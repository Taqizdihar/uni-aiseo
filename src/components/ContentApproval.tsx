import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, FileText, Send, ChevronDown, Loader2, X } from 'lucide-react';
import api from '../utils/api';

interface ReviewTask {
  id: string;
  title: string;
  targetKeyword: string;
  metaTitle: string;
  metaDesc: string;
  content: string;
  seoScore: number;
  readability: string;
  density: string;
  aiSuggestion: string;
  status: 'Waiting Approval' | 'Done' | 'In Progress';
}

export default function ContentApproval() {
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const fetchPendingApprovals = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/approval/pending');
      setTasks(res.data);
      if (res.data.length > 0) {
        setSelectedTaskId(res.data[0].id);
      } else {
        setSelectedTaskId(null);
      }
    } catch (err) {
      console.error('Error fetching approvals:', err);
      notify('Gagal memuat tugas yang menunggu persetujuan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleApprove = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    
    try {
      await api.put(`/approval/${selectedTask.id}/approve`);
      
      notify('Konten disetujui dan tugas ditandai selesai!');
      
      // Remove from list
      const remaining = tasks.filter(t => t.id !== selectedTask.id);
      setTasks(remaining);
      setSelectedTaskId(remaining.length > 0 ? remaining[0].id : null);
    } catch (err: any) {
      console.error('Error approving task:', err);
      notify(err.response?.data?.message || 'Gagal menyetujui tugas', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !rejectionNote.trim()) return;

    setIsSubmitting(true);
    try {
      await api.put(`/approval/${selectedTask.id}/reject`, {
        rejection_note: rejectionNote.trim()
      });
      
      notify('Konten ditolak. Permintaan revisi dikirim ke Writer.');
      
      // Remove from list
      const remaining = tasks.filter(t => t.id !== selectedTask.id);
      setTasks(remaining);
      setSelectedTaskId(remaining.length > 0 ? remaining[0].id : null);
      setShowRejectModal(false);
      setRejectionNote('');
    } catch (err: any) {
      console.error('Error rejecting task:', err);
      notify(err.response?.data?.message || 'Gagal menolak tugas', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-yellow" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="space-y-6 h-full flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2 text-center">Hore! Tidak ada draf yang menunggu persetujuan saat ini.</h2>
        <p className="text-[var(--text-secondary)] text-center">Tim konten Anda sedang bekerja atau semua draf telah disetujui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold mb-2 flex items-center">
            <ClipboardCheck className="w-6 h-6 mr-2 text-brand-yellow" />
            Persetujuan Konten
          </h2>
          <p className="text-[var(--text-secondary)]">Tinjau konten yang dikirim berdampingan dengan metrik validasi AI.</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-between w-full sm:w-64 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-left hover:border-brand-yellow/50 transition-colors"
          >
            <span className="truncate mr-2 font-medium">
              {selectedTask ? selectedTask.title : 'Pilih Tugas untuk Ditinjau'}
            </span>
            <ChevronDown className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
          </button>
          
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setShowDropdown(false);
                  }}
                  className={`px-4 py-3 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors border-b border-[var(--border-color)] last:border-0 ${selectedTaskId === task.id ? 'bg-[var(--bg-secondary)] border-l-4 border-l-brand-yellow' : ''}`}
                >
                  <div className="text-sm font-semibold truncate">{task.title}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                    Waiting Approval
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTask && (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-y-auto lg:overflow-hidden min-h-0 pb-6 lg:pb-0">
          
          {/* Left Panel: Content View */}
          <motion.div
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             key={selectedTask.id}
             className="flex-1 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-sm flex flex-col overflow-hidden min-h-[400px] lg:min-h-0"
          >
             <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30 flex flex-wrap items-center justify-between gap-4 shrink-0">
               <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[var(--text-secondary)]" />
                  <h3 className="font-bold truncate max-w-sm">Draf: {selectedTask.title}</h3>
               </div>
               <span className="px-3 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-full text-xs font-bold whitespace-nowrap">
                 Waiting Approval
               </span>
             </div>
             
             <div className="p-6 md:p-8 overflow-y-auto flex-1 text-[var(--text-secondary)] space-y-6">
                <div className="space-y-4 mb-6 pb-6 border-b border-[var(--border-color)]">
                   <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                     <span className="text-xs uppercase font-bold text-brand-yellow tracking-wider mb-2 block">Target Keyword</span>
                     <p className="text-[var(--text-primary)] font-medium">{selectedTask.targetKeyword}</p>
                   </div>
                   <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)] space-y-3">
                     <div>
                       <span className="text-xs uppercase font-bold text-[var(--text-secondary)] tracking-wider mb-1 block">Meta Title Usulan</span>
                       <p className="text-blue-400 font-medium text-lg leading-tight">{selectedTask.metaTitle}</p>
                     </div>
                     <div>
                       <span className="text-xs uppercase font-bold text-[var(--text-secondary)] tracking-wider mb-1 block">Meta Description Usulan</span>
                       <p className="text-[var(--text-primary)] text-sm">{selectedTask.metaDesc}</p>
                     </div>
                   </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <div className="text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed text-base">
                     {selectedTask.content}
                  </div>
                </div>
             </div>
          </motion.div>

          {/* Right Panel: AI Validation & Actions */}
          <motion.div
             initial={{ opacity: 0, x: 10 }}
             animate={{ opacity: 1, x: 0 }}
             key={`${selectedTask.id}-validation`}
             className="w-full lg:w-96 shrink-0 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-sm flex flex-col overflow-hidden min-h-[500px] lg:min-h-0"
          >
             <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30 shrink-0">
               <h3 className="font-bold flex items-center">
                 <CheckCircle2 className="w-5 h-5 mr-2 text-brand-yellow" />
                 Hasil Validasi AI
               </h3>
             </div>
             
             <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Overall Score */}
                <div className="p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-3 opacity-10">
                     <CheckCircle2 className="w-24 h-24 text-green-500" />
                   </div>
                   <div className="relative z-10">
                     <div className={`text-4xl font-display font-bold mb-1 ${
                       selectedTask.seoScore >= 80 ? 'text-green-500' :
                       selectedTask.seoScore >= 60 ? 'text-yellow-500' :
                       'text-red-500'
                     }`}>
                       {selectedTask.seoScore}/100
                     </div>
                     <div className="text-sm font-medium text-[var(--text-secondary)]">Skor SEO Keseluruhan</div>
                   </div>
                </div>

                {/* Metrics */}
                <div className="space-y-4">
                   <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-medium text-[var(--text-secondary)]">Kepadatan Keyword</span>
                         <span className="text-sm font-bold text-green-500">{selectedTask.density}</span>
                      </div>
                      <div className="w-full bg-[var(--bg-primary)] rounded-full h-1.5">
                         <div className="bg-green-500 h-full rounded-full" style={{ width: '60%' }} />
                      </div>
                   </div>

                   <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-medium text-[var(--text-secondary)]">Keterbacaan (Readability)</span>
                         <span className="text-sm font-bold text-blue-500">{selectedTask.readability}</span>
                      </div>
                      <div className="w-full bg-[var(--bg-primary)] rounded-full h-1.5">
                         <div className="bg-blue-500 h-full rounded-full" style={{ width: '85%' }} />
                      </div>
                   </div>
                </div>

                {/* Warnings */}
                <div className="p-4 bg-brand-yellow/10 border border-brand-yellow/30 rounded-xl flex items-start">
                   <AlertTriangle className="w-5 h-5 text-brand-yellow shrink-0 mr-3 mt-0.5" />
                   <p className="text-sm text-[var(--text-secondary)]">
                     <strong className="text-[var(--text-primary)] block mb-1">Catatan Sistem:</strong> 
                     {selectedTask.aiSuggestion}
                   </p>
                </div>
             </div>

             {/* Action Bar */}
             <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 shrink-0 space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-6 py-3.5 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                  Setujui & Tandai Selesai
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-6 py-3.5 bg-[var(--bg-primary)] text-red-500 font-semibold rounded-xl border border-[var(--border-color)] hover:border-red-500 hover:bg-red-500/10 transition-colors shadow-sm disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Tolak & Minta Revisi
                </button>
             </div>
          </motion.div>
        </div>
      )}

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isSubmitting && setShowRejectModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]/50">
                <h3 className="text-xl font-bold flex items-center text-red-500">
                  <XCircle className="w-6 h-6 mr-2" />
                  Minta Revisi
                </h3>
                <button 
                  onClick={() => !isSubmitting && setShowRejectModal(false)}
                  className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors text-[var(--text-secondary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit}>
                <div className="p-6">
                  <p className="text-[var(--text-secondary)] mb-4 text-sm">
                    Draf ini akan dikembalikan ke status "In Progress". Penulis akan menerima notifikasi beserta catatan revisi Anda.
                  </p>
                  
                  <label className="block text-sm font-semibold mb-2 text-[var(--text-primary)]">
                    Catatan Revisi / Alasan Penolakan
                  </label>
                  <textarea
                    required
                    autoFocus
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    className="w-full p-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--text-primary)] resize-none min-h-[120px]"
                    placeholder="Masukkan alasan penolakan atau instruksi revisi untuk Content Writer..."
                  />
                </div>

                <div className="p-6 pt-0 flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    disabled={isSubmitting}
                    className="px-6 py-3 font-semibold rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!rejectionNote.trim() || isSubmitting}
                    className="px-6 py-3 font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                    Kirim Revisi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 z-50 ${
              toastType === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500/90 text-white border border-red-400'
            }`}
          >
            {toastType === 'success' ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
            <span className="font-medium">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

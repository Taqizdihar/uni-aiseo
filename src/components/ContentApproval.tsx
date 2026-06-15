import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, FileText, ArrowLeft, Send, ChevronDown } from 'lucide-react';

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
  status: 'pending' | 'approved' | 'rejected';
}

const mockTasks: ReviewTask[] = [
  {
    id: 'task-1',
    title: 'Blog Post: Tren AI SEO di 2024',
    targetKeyword: 'AI SEO Trends',
    metaTitle: 'Tren AI SEO di 2024: Panduan Lengkap untuk Pemula',
    metaDesc: 'Pelajari bagaimana AI mengubah cara kita melakukan SEO pada tahun 2024 dan apa yang harus Anda lakukan untuk beradaptasi.',
    content: `# Panduan Lengkap Tren AI SEO di 2024\n\nArtificial Intelligence merevolusi cara kita mendekati Search Engine Optimization (SEO). Dari pembuatan konten otomatis hingga analitik prediktif, lanskap ini bergeser pada kecepatan yang belum pernah terjadi sebelumnya.\n\n## 1. Riset Keyword Otomatis\nAlat AI sekarang dapat menganalisis sejumlah besar data pencarian untuk mengidentifikasi keywords dengan konversi tinggi dan persaingan rendah dalam hitungan detik. Hal ini memungkinkan SEO Analyst untuk fokus pada strategi daripada mengumpulkan data secara manual.\n\n## 2. Keterbacaan dan Optimasi Konten\nMesin pencari semakin memprioritaskan pengalaman pengguna. AI content optimizer memastikan bahwa tulisan Anda sesuai dengan tingkat membaca ideal dari target audiens Anda, memanfaatkan Natural Language Processing (NLP) untuk menyarankan perbaikan struktural dan semantic LSI keywords.\n\n## 3. Kemampuan Pencarian Visual\nDengan bangkitnya pencarian visual, sangat penting untuk memastikan gambar dioptimalkan dengan alt-text yang benar dan rasio kontras yang tinggi. AI visual analyzer modern dapat mengaudit seluruh properti web untuk inklusivitas visual.\n\nSebagai kesimpulan, mengintegrasikan AI ke dalam alur kerja SEO Anda bukan lagi tentang kemewahan opsional — hal ini adalah persyaratan mendasar untuk tetap kompetitif di pasar digital saat ini.`,
    seoScore: 92,
    readability: 'Kelas 8',
    density: '1.8%',
    aiSuggestion: 'Pertimbangkan untuk menambahkan satu lagi LSI keyword terkait "Strategi Konten" pada paragraf terakhir.',
    status: 'pending',
  },
  {
    id: 'task-2',
    title: 'Landing Page: Promo Musim Panas',
    targetKeyword: 'Promo Musim Panas 2024',
    metaTitle: 'Diskon Terbesar Promo Musim Panas 2024 - Dapatkan Sekarang!',
    metaDesc: 'Nikmati penawaran eksklusif dan diskon hingga 50% selama Promo Musim Panas 2024. Jangan sampai kehabisan!',
    content: `# Promo Musim Panas Telah Tiba!\n\nPersiapkan diri Anda untuk diskon besar-besaran di semua kategori produk favorit Anda.\n\n## Diskon Hingga 50%\nDapatkan potongan harga dari pakaian musim panas, aksesori, hingga peralatan perlengkapan luar ruangan.\n\nCepat, penawaran ini hanya berlaku hingga akhir bulan!`,
    seoScore: 88,
    readability: 'Kelas 6',
    density: '2.1%',
    aiSuggestion: 'Tambahkan ajakan bertindak (CTA) sekunder di bagian bawah konten untuk meningkatkan konversi peluang.',
    status: 'pending',
  }
];

export default function ContentApproval() {
  const [tasks, setTasks] = useState<ReviewTask[]>(mockTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(mockTasks[0].id);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastActionStatus, setLastActionStatus] = useState<'approved' | 'rejected'>('approved');

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  const handleTaskAction = (action: 'approved' | 'rejected') => {
    if (!selectedTask) return;
    
    setLastActionStatus(action);
    setTasks(prev => prev.map(t => t.id === selectedTaskId ? { ...t, status: action } : t));
    
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      const remainingPending = tasks.filter(t => t.id !== selectedTaskId && t.status === 'pending');
      setSelectedTaskId(remainingPending.length > 0 ? remainingPending[0].id : null);
    }, 2000);
  };

  if (pendingTasks.length === 0) {
    return (
      <div className="space-y-6 h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2 text-center">Sudah Selesai Semua!</h2>
        <p className="text-[var(--text-secondary)] text-center">Tidak ada lagi draf konten yang menunggu persetujuan.</p>
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
            className="flex items-center justify-between w-full sm:w-64 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-left hover:border-brand-yellow/50 transition-colors"
          >
            <span className="truncate mr-2">
              {selectedTask ? selectedTask.title : 'Pilih Tugas untuk Ditinjau'}
            </span>
            <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
          </button>
          
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
              {pendingTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setShowDropdown(false);
                  }}
                  className={`px-4 py-3 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors border-b border-[var(--border-color)] last:border-0 ${selectedTaskId === task.id ? 'bg-[var(--bg-secondary)] border-l-2 border-l-brand-yellow' : ''}`}
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
                  <h3 className="font-bold">Draf: {selectedTask.title}</h3>
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
                  <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
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
                     <div className="text-4xl font-display font-bold text-green-500 mb-1">{selectedTask.seoScore}/100</div>
                     <div className="text-sm font-medium text-[var(--text-secondary)]">Skor SEO Bagus Sekali</div>
                   </div>
                </div>

                {/* Metrics */}
                <div className="space-y-4">
                   <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-medium text-[var(--text-secondary)]">Kepadatan Keyword</span>
                         <span className="text-sm font-bold text-green-500">{selectedTask.density} (Optimal)</span>
                      </div>
                      <div className="w-full bg-[var(--bg-primary)] rounded-full h-1.5">
                         <div className="bg-green-500 h-full rounded-full" style={{ width: '60%' }} />
                      </div>
                      <div className="mt-2 text-xs text-[var(--text-secondary)]">
                        Target keyword: "{selectedTask.targetKeyword}"
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
                      <div className="mt-2 text-xs text-[var(--text-secondary)]">
                        Sesuai dengan target audiens.
                      </div>
                   </div>
                </div>

                {/* Warnings */}
                <div className="p-4 bg-brand-yellow/10 border border-brand-yellow/30 rounded-xl flex items-start">
                   <AlertTriangle className="w-5 h-5 text-brand-yellow shrink-0 mr-3 mt-0.5" />
                   <p className="text-sm text-[var(--text-secondary)]">
                     <strong className="text-[var(--text-primary)]">Saran Minor:</strong> {selectedTask.aiSuggestion}
                   </p>
                </div>
             </div>

             {/* Action Bar */}
             <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 shrink-0 space-y-3">
                <button
                  onClick={() => handleTaskAction('approved')}
                  className="w-full flex items-center justify-center px-6 py-3.5 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Setujui & Tandai Selesai
                </button>
                <button
                  onClick={() => handleTaskAction('rejected')}
                  className="w-full flex items-center justify-center px-6 py-3.5 bg-[var(--bg-primary)] text-red-500 font-semibold rounded-xl border border-[var(--border-color)] hover:border-red-500 hover:bg-red-500/10 transition-colors shadow-sm"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Tolak & Minta Revisi
                </button>
             </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
         {showToast && (
           <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
             <div className={`border rounded-xl px-4 py-3 flex items-center shadow-lg backdrop-blur-md ${
                lastActionStatus === 'approved' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                  : 'bg-red-500/10 border-red-500/20 text-red-500'
             }`}>
               {lastActionStatus === 'approved' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-2" />}
               <span className="font-medium text-sm">
                 {lastActionStatus === 'approved' ? 'Konten disetujui dan tugas ditandai selesai!' : 'Konten ditolak. Permintaan revisi dikirim.'}
               </span>
             </div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}


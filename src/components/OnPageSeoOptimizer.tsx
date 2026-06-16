import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, FileText, CheckCircle, AlertTriangle, Activity, Link2, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import api from '../utils/api';

interface SEOAnalysis {
  seo_score: number;
  readability_level: string;
  keyword_density: string;
  feedback: string[];
}

interface ActiveTask {
  id: number;
  title: string;
  status: string;
  writer_id: number | null;
  rejection_note?: string;
}

export default function OnPageSeoOptimizer({ setIsLoading }: { setIsLoading: (val: boolean) => void }) {
  // Task state
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  // Keywords from Analyst
  const [focusKeyword, setFocusKeyword] = useState('');
  const [lsiKeywords, setLsiKeywords] = useState<string[]>([]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);

  // Content & Analysis
  const [content, setContent] = useState('');
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  // Get user info for writer filtering
  const getUserFromStorage = () => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  // Fetch active 'In Progress' tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        const user = getUserFromStorage();
        let filtered = res.data.filter((t: any) => t.status === 'In Progress');

        // If Content Writer, only show tasks assigned to them
        if (user && user.role === 'Content Writer') {
          filtered = filtered.filter((t: any) => t.writer_id === user.id);
        }

        setActiveTasks(filtered);
        if (filtered.length > 0) {
          setSelectedTaskId(filtered[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };
    fetchTasks();
  }, []);

  // When task selection changes, fetch keyword data
  useEffect(() => {
    if (!selectedTaskId) {
      setFocusKeyword('');
      setLsiKeywords([]);
      return;
    }

    const fetchTaskData = async () => {
      setIsLoadingKeywords(true);
      try {
        const res = await api.get(`/onpage/task-data/${selectedTaskId}`);
        setFocusKeyword(res.data.focus_keyword || '');
        setLsiKeywords(res.data.lsi_keywords || []);
      } catch (err) {
        console.error('Error fetching task keywords:', err);
        setFocusKeyword('');
        setLsiKeywords([]);
      } finally {
        setIsLoadingKeywords(false);
      }
    };
    fetchTaskData();

    // Reset states on task change
    setAnalysis(null);
    setIsSubmitted(false);
    setContent('');
  }, [selectedTaskId]);

  // Analyze content with Gemini
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusKeyword.trim() || !content.trim()) return;

    setIsAnalyzing(true);
    setIsLoading(true);
    setAnalysis(null);

    try {
      const res = await api.post('/onpage/analyze', {
        content_draft: content,
        focus_keyword: focusKeyword,
        lsi_keywords: lsiKeywords,
      });
      setAnalysis(res.data);
    } catch (error: any) {
      console.error('Error analyzing content:', error);
      if (error.response?.status === 503) {
        notify(error.response?.data?.message || 'Trafik AI sedang sibuk, silakan coba lagi.', 'error');
      } else {
        notify(error.response?.data?.message || 'Gagal menganalisis konten.', 'error');
      }
    } finally {
      setIsAnalyzing(false);
      setIsLoading(false);
    }
  };

  // Submit draft for approval
  const handleSubmit = async () => {
    if (!selectedTaskId || !content.trim()) return;

    setIsSubmitting(true);

    try {
      await api.post('/onpage/submit', {
        task_id: parseInt(selectedTaskId),
        content_draft: content,
        focus_keyword: focusKeyword,
        seo_score: analysis?.seo_score || null,
        readability_level: analysis?.readability_level || null,
      });

      setIsSubmitted(true);
      notify('Draf berhasil dikirim ke Manager untuk persetujuan!');

      // Remove submitted task from dropdown
      setActiveTasks(prev => prev.filter(t => t.id.toString() !== selectedTaskId));

      // Reset states
      setTimeout(() => {
        setContent('');
        setAnalysis(null);
        setIsSubmitted(false);
        setFocusKeyword('');
        setLsiKeywords([]);
        // Select next available task
        const remaining = activeTasks.filter(t => t.id.toString() !== selectedTaskId);
        setSelectedTaskId(remaining.length > 0 ? remaining[0].id.toString() : '');
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting draft:', error);
      notify(error.response?.data?.message || 'Gagal mengirim draf.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length;

  return (
    <div className="space-y-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold mb-2">On-Page SEO Optimizer</h2>
          <p className="text-[var(--text-secondary)]">Analisis draf konten Anda terhadap target Keyword untuk mendapatkan rekomendasi optimasi instan.</p>
        </div>
      </div>
      
      {/* Task Selector */}
      <div className="bg-[var(--bg-primary)] p-4 md:p-6 rounded-2xl border border-[var(--border-color)] shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <label className="font-semibold flex items-center shrink-0">
          <Link2 className="w-5 h-5 mr-2 text-brand-yellow" />
          Pilih Tugas Aktif:
        </label>
        <div className="flex-1 relative">
          {activeTasks.length === 0 ? (
            <div className="px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] text-sm">
              Tidak ada tugas "In Progress". Minta Analyst memindahkan tugas ke "In Progress" di Task Board.
            </div>
          ) : (
            <select 
              className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent appearance-none cursor-pointer"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              {activeTasks.map(task => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm flex flex-col h-full space-y-6"
        >
          {/* Rejection Note Banner */}
          {activeTasks.find(t => t.id.toString() === selectedTaskId)?.rejection_note && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-500 mb-1">Revisi Diperlukan (Dari Manager)</h4>
                <p className="text-sm text-red-400">
                  {activeTasks.find(t => t.id.toString() === selectedTaskId)?.rejection_note}
                </p>
              </div>
            </div>
          )}

          {/* LSI Keywords from Analyst */}
          {isLoadingKeywords ? (
            <div className="p-4 bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-xl flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-brand-yellow mr-2" />
              <span className="text-sm text-[var(--text-secondary)]">Memuat data keyword...</span>
            </div>
          ) : lsiKeywords.length > 0 ? (
            <div className="p-4 bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-xl">
              <h4 className="text-sm font-bold mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-brand-yellow" />
                Target LSI Keywords (dari Analyst)
              </h4>
              <div className="flex flex-wrap gap-2">
                {lsiKeywords.map((lsi, idx) => (
                  <span key={idx} className="px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs">
                    {lsi}
                  </span>
                ))}
              </div>
            </div>
          ) : selectedTaskId ? (
            <div className="p-4 bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-secondary)]">
              Belum ada keyword LSI dari Analyst. Masukkan Focus Keyword secara manual di bawah.
            </div>
          ) : null}

          <form onSubmit={handleAnalyze} className="flex-1 flex flex-col space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Focus Keyword</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                  placeholder="misal: ai seo tool"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Draf Artikel</label>
                <span className="text-xs text-[var(--text-secondary)]">{wordCount} kata</span>
              </div>
              <div className="relative flex-1 flex flex-col">
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="block w-full flex-1 p-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow resize-none min-h-[300px]"
                  placeholder="Tempelkan (paste) konten Anda di sini untuk dianalisis..."
                />
                <div className="absolute top-4 right-4 text-[var(--text-secondary)] pointer-events-none">
                  <FileText className="w-5 h-5 opacity-20" />
                </div>
              </div>
            </div>

            {/* Buttons */}
            {!analysis && !isSubmitted ? (
              <button
                type="submit"
                disabled={!focusKeyword.trim() || !content.trim() || isAnalyzing || !selectedTaskId}
                className="flex items-center justify-center w-full px-6 py-4 font-semibold rounded-xl transition-all shadow-sm bg-[linear-gradient(to_right,var(--color-brand-yellow),#e0b820)] text-brand-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analisis Konten
                  </>
                )}
              </button>
            ) : analysis && !isSubmitted ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center justify-center w-full px-6 py-4 font-semibold rounded-xl transition-all shadow-sm bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Kirim untuk Persetujuan
                  </>
                )}
              </button>
            ) : isSubmitted ? (
              <div className="flex items-center justify-center w-full px-6 py-4 font-semibold rounded-xl bg-green-500 text-white">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Draf telah dikirim — status "Waiting Approval"
              </div>
            ) : null}
          </form>
        </motion.div>

        {/* Output Side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col h-full"
        >
          {isAnalyzing ? (
            /* Loading State */
            <div className="h-full bg-[var(--bg-primary)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-16 h-16 text-brand-yellow animate-spin" />
              <h3 className="text-xl font-display font-medium text-[var(--text-secondary)]">Menganalisis Konten...</h3>
              <p className="text-[var(--text-secondary)] max-w-sm">AI sedang mengevaluasi draf Anda terhadap keyword target.</p>
            </div>
          ) : analysis ? (
            /* Results */
            <div className="bg-[var(--bg-primary)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-8 flex-1 h-full">
              <div className="flex items-center space-x-2 border-b border-[var(--border-color)] pb-4">
                <Activity className="w-6 h-6 text-brand-yellow" />
                <h3 className="text-xl font-display font-bold">Hasil Analisis</h3>
              </div>

              {/* Overall SEO Score - Circular Progress */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative flex items-center justify-center w-36 h-36">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-[var(--bg-secondary)]"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className={`transition-all duration-1000 ease-out ${
                        analysis.seo_score >= 80 ? 'text-green-500' :
                        analysis.seo_score >= 60 ? 'text-brand-yellow' :
                        'text-red-500'
                      }`}
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * analysis.seo_score) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-bold">{analysis.seo_score}</span>
                    <span className="text-xs text-[var(--text-secondary)]">Skor SEO</span>
                  </div>
                </div>
                <p className="mt-4 text-[var(--text-secondary)] font-medium">Berdasarkan skor SEO keseluruhan</p>
              </div>

              {/* Keyword Density & Readability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] flex flex-col justify-center">
                  <span className="text-[var(--text-secondary)] text-sm font-medium mb-1">Kepadatan Keyword</span>
                  <div className="flex items-center text-base font-bold">
                    <CheckCircle className="w-5 h-5 text-brand-yellow mr-2 flex-shrink-0" />
                    <span>{analysis.keyword_density}</span>
                  </div>
                </div>
                <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] flex flex-col justify-center">
                  <span className="text-[var(--text-secondary)] text-sm font-medium mb-1">Keterbacaan (Readability)</span>
                  <div className="flex items-center text-base font-bold">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="leading-tight">{analysis.readability_level}</span>
                  </div>
                </div>
              </div>

              {/* Word Count */}
              <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)] text-sm font-medium mb-1 block">Jumlah Kata</span>
                <div className="flex items-center text-base font-bold">
                  <CheckCircle className="w-5 h-5 text-brand-yellow mr-2 flex-shrink-0" />
                  <span>{wordCount} kata</span>
                </div>
              </div>

              {/* Feedback / Checklist */}
              {analysis.feedback && analysis.feedback.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-brand-yellow" />
                    Rekomendasi Perbaikan
                  </h4>
                  <ul className="space-y-3">
                    {analysis.feedback.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-brand-yellow/10 text-brand-yellow flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="text-[var(--text-secondary)] leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="h-full bg-[var(--bg-primary)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-color)]">
                <Search className="w-10 h-10 text-[var(--text-secondary)] opacity-50" />
              </div>
              <h3 className="text-xl font-display font-medium text-[var(--text-secondary)]">Siap untuk Analisis</h3>
              <p className="text-[var(--text-secondary)] max-w-sm">Masukkan Focus Keyword dan teks Anda di layar, lalu klik analisis untuk melihat skor SEO dan umpan balik yang dapat ditindaklanjuti.</p>
            </div>
          )}
        </motion.div>
      </div>

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
              <AlertCircle className="w-6 h-6" />
            )}
            <span className="font-medium">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, TrendingUp, BarChart, FileText, CheckSquare, Square, Save, Link2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface KeywordResult {
  keyword: string;
  volume: number;
  kd_percent: number;
  intent: string;
  content_title_idea: string;
}

interface ActiveTask {
  id: number;
  title: string;
  status: string;
}

export default function AIKeywordGenerator({ setIsLoading }: { setIsLoading: (val: boolean) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KeywordResult[] | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  // Active tasks for dropdown
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  // Save state
  const [isSaved, setIsSaved] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Fetch active tasks for dropdown
  useEffect(() => {
    const fetchActiveTasks = async () => {
      try {
        const res = await api.get('/visual/active-tasks');
        setActiveTasks(res.data);
        if (res.data.length > 0) {
          setSelectedTaskId(res.data[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching active tasks:', err);
      }
    };
    fetchActiveTasks();
  }, []);

  const toggleSelection = (idx: number) => {
    const newSelection = new Set(selectedIndices);
    if (newSelection.has(idx)) {
      newSelection.delete(idx);
    } else {
      newSelection.add(idx);
    }
    setSelectedIndices(newSelection);
  };

  const toggleAll = () => {
    if (!results) return;
    if (selectedIndices.size === results.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(results.map((_, i) => i)));
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isGenerating) return;

    setIsGenerating(true);
    setIsLoading(true);
    setResults(null);
    setSelectedIndices(new Set());
    setIsSaved(false);

    try {
      const res = await api.post('/keywords/generate', { seed_keyword: query.trim() });
      setResults(res.data);
    } catch (error: any) {
      console.error('Error generating keywords:', error);
      if (error.response?.status === 503) {
        notify(error.response?.data?.message || 'Trafik AI sedang sibuk, silakan coba lagi.', 'error');
      } else {
        notify(error.response?.data?.message || 'Gagal menghasilkan keyword.', 'error');
      }
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const handleSaveToTask = async () => {
    if (!results || selectedIndices.size === 0 || !selectedTaskId) {
      notify('Pilih keyword dan tugas terlebih dahulu.', 'error');
      return;
    }

    const selectedKeywords = Array.from(selectedIndices).map(idx => results[idx]);

    try {
      await api.post('/keywords/save', {
        task_id: parseInt(selectedTaskId),
        keywords: selectedKeywords,
      });
      setIsSaved(true);
      notify('Keyword berhasil disimpan ke tugas!');
      setTimeout(() => {
        setIsSaved(false);
        setSelectedIndices(new Set());
      }, 3000);
    } catch (error: any) {
      console.error('Error saving keywords:', error);
      notify(error.response?.data?.message || 'Gagal menyimpan keyword.', 'error');
    }
  };

  const formatVolume = (vol: number) => {
    return vol.toLocaleString('id-ID');
  };

  const getIntentColor = (intent: string) => {
    switch (intent.toLowerCase()) {
      case 'informational': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'commercial': return 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20';
      case 'transactional': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'navigational': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)]';
    }
  };

  const getDifficultyColor = (kd: number) => {
    if (kd <= 30) return 'text-green-500';
    if (kd <= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold mb-2">AI Keyword Generator</h2>
        <p className="text-[var(--text-secondary)]">Temukan Keyword berpotensi tinggi dan ide konten berbasis AI secara instan.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-primary)] p-6 sm:p-8 rounded-2xl border border-[var(--border-color)] shadow-sm"
      >
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[var(--text-secondary)]" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Masukkan seed keyword atau topik (misal: 'artificial intelligence')"
              className="w-full pl-12 pr-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || isGenerating}
            className="flex items-center justify-center px-8 py-4 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Menghasilkan...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Hasilkan
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Empty State */}
      {!results && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-primary)] p-12 rounded-2xl border border-[var(--border-color)] shadow-sm text-center"
        >
          <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[var(--text-secondary)]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Mulai Riset Keyword</h3>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Masukkan seed keyword di atas dan klik "Hasilkan" untuk mendapatkan saran keyword berpotensi tinggi dari AI.
          </p>
        </motion.div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-primary)] p-12 rounded-2xl border border-[var(--border-color)] shadow-sm text-center"
        >
          <Loader2 className="w-12 h-12 text-brand-yellow animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Menganalisis Keyword...</h3>
          <p className="text-[var(--text-secondary)]">AI sedang menghasilkan saran keyword berpotensi tinggi untuk "{query}"</p>
        </motion.div>
      )}

      {/* Results Table */}
      {results && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]/50">
            <h3 className="text-lg font-bold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-brand-yellow" />
              Saran Keyword untuk "{query}"
            </h3>
            <span className="text-sm text-[var(--text-secondary)]">{results.length} hasil</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                  <th className="py-4 px-6 w-12">
                    <button onClick={toggleAll} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                       {selectedIndices.size === results.length && results.length > 0 ? <CheckSquare className="w-5 h-5 text-brand-yellow" /> : <Square className="w-5 h-5" />}
                    </button>
                  </th>
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Ide Keyword</th>
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Volume</th>
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">KD %</th>
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Intent</th>
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Ide Judul Konten</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, idx) => (
                  <tr 
                    key={idx} 
                    className={`border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]/20 transition-colors cursor-pointer ${selectedIndices.has(idx) ? 'bg-brand-yellow/5' : ''}`}
                    onClick={() => toggleSelection(idx)}
                  >
                    <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                       <button onClick={() => toggleSelection(idx)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                         {selectedIndices.has(idx) ? <CheckSquare className="w-5 h-5 text-brand-yellow" /> : <Square className="w-5 h-5" />}
                       </button>
                    </td>
                    <td className="py-4 px-6 font-medium">{item.keyword}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-[var(--text-secondary)]">
                        <BarChart className="w-4 h-4 mr-2" />
                        {formatVolume(item.volume)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${getDifficultyColor(item.kd_percent)}`}>
                        {item.kd_percent}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getIntentColor(item.intent)}`}>
                        {item.intent}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-[var(--text-secondary)] text-sm">
                        <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-xs">{item.content_title_idea}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Selection Action Bar */}
          <AnimatePresence>
            {selectedIndices.size > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[var(--bg-secondary)] p-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                 <div className="flex items-center">
                   <div className="w-8 h-8 rounded-full bg-brand-yellow/10 text-brand-yellow flex items-center justify-center font-bold mr-3">
                     {selectedIndices.size}
                   </div>
                   <span className="font-medium">Keyword Dipilih</span>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                   {activeTasks.length > 0 ? (
                     <>
                       <div className="flex items-center w-full sm:w-auto bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl overflow-hidden px-3">
                         <Link2 className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0" />
                         <select 
                           className="w-full sm:w-48 px-3 py-2.5 bg-transparent border-none focus:outline-none focus:ring-0 text-sm appearance-none cursor-pointer"
                           value={selectedTaskId}
                           onChange={(e) => setSelectedTaskId(e.target.value)}
                         >
                           {activeTasks.map(task => (
                             <option key={task.id} value={task.id}>
                               {task.title} ({task.status})
                             </option>
                           ))}
                         </select>
                       </div>
                       <button 
                         onClick={handleSaveToTask}
                         disabled={isSaved}
                         className={`w-full sm:w-auto flex-shrink-0 px-6 py-2.5 font-semibold rounded-xl transition-colors flex items-center justify-center ${
                           isSaved 
                             ? 'bg-green-500 text-white hover:bg-green-600' 
                             : 'bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover'
                         }`}
                       >
                         {isSaved ? (
                           <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Tersimpan!
                           </>
                         ) : (
                           <>
                              <Save className="w-4 h-4 mr-2" />
                              Simpan ke Tugas
                           </>
                         )}
                       </button>
                     </>
                   ) : (
                     <p className="text-sm text-[var(--text-secondary)]">Tidak ada tugas aktif. Buat tugas di Task Board terlebih dahulu.</p>
                   )}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, TrendingUp, BarChart, FileText, CheckSquare, Square, Save, Link2, CheckCircle2 } from 'lucide-react';

interface KeywordIdea {
  id: string;
  keyword: string;
  volume: string;
  difficulty: number;
  intent: string;
  ideas: string;
}

const mockResults: KeywordIdea[] = [
  { id: '1', keyword: 'ai seo trends 2024', volume: '22,000', difficulty: 45, intent: 'Informational', ideas: `What is AI SEO? The Ultimate Guide` },
  { id: '2', keyword: 'best ai seo tools', volume: '14,500', difficulty: 78, intent: 'Commercial', ideas: `Top 10 AI SEO Tools for 2024` },
  { id: '3', keyword: 'how to do ai seo', volume: '9,200', difficulty: 35, intent: 'Informational', ideas: `Step-by-Step Tutorial on AI SEO` },
  { id: '4', keyword: 'ai seo vs competitor', volume: '5,400', difficulty: 60, intent: 'Transactional', ideas: `AI SEO Alternatives & Comparisons` },
  { id: '5', keyword: 'buy ai seo software', volume: '3,100', difficulty: 82, intent: 'Transactional', ideas: `Where to Get the Best AI SEO` },
];

export default function AIKeywordGenerator({ setIsLoading }: { setIsLoading: (val: boolean) => void }) {
  const [query, setQuery] = useState('ai seo');
  const [results, setResults] = useState<KeywordIdea[] | null>(mockResults);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['1', '2']));
  
  const [selectedTask, setSelectedTask] = useState('Pembaruan UX Promo Musim Panas');
  const [isSaved, setIsSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const toggleAll = () => {
    if (selectedIds.size === results?.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results?.map(r => r.id)));
    }
  };

  const handleSaveToTask = () => {
    setIsSaved(true);
    setShowToast(true);
    setTimeout(() => {
      setIsSaved(false);
      setShowToast(false);
      setSelectedIds(new Set());
    }, 3000);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    
    setTimeout(() => {
      setResults(mockResults);
      setSelectedIds(new Set());
      setIsLoading(false);
    }, 3500);
  };

  const getIntentColor = (intent: string) => {
    switch (intent.toLowerCase()) {
      case 'informational': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'commercial': return 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20';
      case 'transactional': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)]';
    }
  };

  const getDifficultyColor = (kd: number) => {
    if (kd < 40) return 'text-green-500';
    if (kd < 70) return 'text-brand-yellow';
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
            disabled={!query.trim()}
            className="flex items-center justify-center px-8 py-4 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Hasilkan
          </button>
        </form>
      </motion.div>

      {results && (
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
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                  <th className="py-4 px-6 w-12">
                    <button onClick={toggleAll} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                       {selectedIds.size === results.length ? <CheckSquare className="w-5 h-5 text-brand-yellow" /> : <Square className="w-5 h-5" />}
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
                {results.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]/20 transition-colors cursor-pointer ${selectedIds.has(item.id) ? 'bg-brand-yellow/5' : ''}`}
                    onClick={() => toggleSelection(item.id)}
                  >
                    <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                       <button onClick={() => toggleSelection(item.id)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                         {selectedIds.has(item.id) ? <CheckSquare className="w-5 h-5 text-brand-yellow" /> : <Square className="w-5 h-5" />}
                       </button>
                    </td>
                    <td className="py-4 px-6 font-medium">{item.keyword}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-[var(--text-secondary)]">
                        <BarChart className="w-4 h-4 mr-2" />
                        {item.volume}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
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
                        <span className="truncate max-w-[200px] sm:max-w-xs">{item.ideas}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[var(--bg-secondary)] p-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                 <div className="flex items-center">
                   <div className="w-8 h-8 rounded-full bg-brand-yellow/10 text-brand-yellow flex items-center justify-center font-bold mr-3">
                     {selectedIds.size}
                   </div>
                   <span className="font-medium">Keyword Dipilih</span>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                   <div className="flex items-center w-full sm:w-auto bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl overflow-hidden px-3">
                     <Link2 className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0" />
                     <select 
                       className="w-full sm:w-48 px-3 py-2.5 bg-transparent border-none focus:outline-none focus:ring-0 text-sm appearance-none cursor-pointer"
                       value={selectedTask}
                       onChange={(e) => setSelectedTask(e.target.value)}
                     >
                       <option value="Pembaruan UX Promo Musim Panas">Pembaruan UX Promo Musim Panas</option>
                       <option value="Desain Ulang Hero Beranda">Desain Ulang Hero Beranda</option>
                       <option value="Blog Post: Tren AI SEO">Blog Post: Tren AI SEO</option>
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
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 z-50"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-medium">Keyword berhasil disematkan ke tugas!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, FileText, CheckCircle, AlertTriangle, Activity, Link2, CheckCircle2 } from 'lucide-react';

interface SEOAnalysis {
  score: number;
  keywordDensity: { status: 'optimal' | 'low' | 'high'; value: number };
  readability: string;
  lsiKeywords: string[];
}

export default function OnPageSeoOptimizer({ setIsLoading }: { setIsLoading: (val: boolean) => void }) {
  const [selectedTask, setSelectedTask] = useState('Blog Post: Tren AI SEO');
  const [keyword, setKeyword] = useState('');
  const [content, setContent] = useState('');
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (selectedTask === 'Blog Post: Tren AI SEO') {
      setKeyword('ai seo trends');
    } else if (selectedTask === 'Pembaruan UX Promo Musim Panas') {
      setKeyword('summer promo shoes');
    } else {
      setKeyword('');
    }
  }, [selectedTask]);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !content.trim()) return;
    
    setIsLoading(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      setAnalysis({
        score: 84,
        keywordDensity: { status: 'optimal', value: 1.8 },
        readability: 'Target audiens: Kelas 8 (Sangat Baik)',
        lsiKeywords: ['SEO marketing', 'content strategy', 'search engine ranking', 'organic traffic']
      });
      setIsLoading(false);
      
      // Simulate task submission
      setTimeout(() => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }, 500);
    }, 4000);
  };

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
           <select 
             className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent appearance-none cursor-pointer"
             value={selectedTask}
             onChange={(e) => setSelectedTask(e.target.value)}
           >
             <option value="Blog Post: Tren AI SEO">Blog Post: Tren AI SEO</option>
             <option value="Pembaruan UX Promo Musim Panas">Pembaruan UX Promo Musim Panas</option>
             <option value="Desain Ulang Hero Beranda">Desain Ulang Hero Beranda</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm flex flex-col h-full space-y-6"
        >
          {selectedTask === 'Blog Post: Tren AI SEO' && (
             <div className="p-4 bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-xl">
               <h4 className="text-sm font-bold mb-2 flex items-center">
                 <AlertTriangle className="w-4 h-4 mr-2 text-brand-yellow" />
                 Target LSI Keywords (dari Analyst)
               </h4>
               <div className="flex flex-wrap gap-2">
                 <span className="px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs">AI SEO tools</span>
                 <span className="px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs">SEO automation</span>
                 <span className="px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs">content optimization</span>
               </div>
             </div>
          )}

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
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                  placeholder="misal: ai seo tool"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium mb-2">Draf Artikel</label>
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

            <button
              type="submit"
              disabled={!keyword.trim() || !content.trim() || isSaved}
              className={`flex items-center justify-center w-full px-6 py-4 font-semibold rounded-xl transition-all shadow-sm ${
                isSaved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-[linear-gradient(to_right,var(--color-brand-yellow),#e0b820)] text-brand-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isSaved ? (
                 <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Tugas ditaruh pada status "Waiting Approval"
                 </>
              ) : (
                 <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analisis & Kirim untuk Persetujuan
                 </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Output Side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col h-full"
        >
          {analysis ? (
            <div className="bg-[var(--bg-primary)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-8 flex-1 h-full">
              <div className="flex items-center space-x-2 border-b border-[var(--border-color)] pb-4">
                <Activity className="w-6 h-6 text-brand-yellow" />
                <h3 className="text-xl font-display font-bold">Hasil Analisis</h3>
              </div>

              {/* Overall SEO Score */}
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
                      className={`text-brand-yellow transition-all duration-1000 ease-out`}
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * analysis.score) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-bold">{analysis.score}</span>
                    <span className="text-xs text-[var(--text-secondary)]">Skor</span>
                  </div>
                </div>
                <p className="mt-4 text-[var(--text-secondary)] font-medium">Berdasarkan skor SEO keseluruhan</p>
              </div>

              {/* Keyword Density */}
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Kepadatan Keyword ({analysis.keywordDensity.value}%)</span>
                  <span className="text-sm font-bold text-green-500 capitalize">{analysis.keywordDensity.status}</span>
                </div>
                <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden flex">
                  <div className="bg-brand-yellow h-2 rounded-full" style={{ width: `${Math.min(analysis.keywordDensity.value * 30, 100)}%` }} />
                </div>
                <p className="text-xs text-[var(--text-secondary)]">Target kepadatan antara 1% dan 2.5%.</p>
              </div>

              {/* Readability & Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] flex flex-col justify-center">
                  <span className="text-[var(--text-secondary)] text-sm font-medium mb-1">Keterbacaan (Readability)</span>
                  <div className="flex items-center text-base font-bold">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="leading-tight">{analysis.readability}</span>
                  </div>
                </div>
                <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] flex flex-col justify-center">
                  <span className="text-[var(--text-secondary)] text-sm font-medium mb-1">Jumlah Kata</span>
                  <div className="flex items-center text-base font-bold">
                    <CheckCircle className="w-5 h-5 text-brand-yellow mr-2 flex-shrink-0" />
                    <span>{content.split(/\\s+/).filter((w: string) => w.length > 0).length} kata</span>
                  </div>
                </div>
              </div>

              {/* LSI Keywords */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-brand-yellow" />
                  Rekomendasi LSI Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.lsiKeywords.map((lsi, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full text-sm font-medium">
                      {lsi}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
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
    </div>
  );
}

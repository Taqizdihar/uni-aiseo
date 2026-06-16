import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Type, AlignLeft, Sparkles, Copy, CheckCircle2, AlertCircle, Link2, Save, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface GeneratedTags {
  title: string;
  description: string;
}

interface ActiveTask {
  id: number;
  title: string;
  status: string;
}

export default function AIMetaTagGenerator({ setIsLoading }: { setIsLoading: (val: boolean) => void }) {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  
  // Task Dropdown State
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  // Generation State
  const [result, setResult] = useState<GeneratedTags | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Interactions
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

  // Fetch active tasks for dropdown
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks/active');
        setActiveTasks(res.data);
        if (res.data.length > 0) {
          setSelectedTaskId(res.data[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };
    fetchTasks();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !description.trim() || isGenerating) return;

    setIsGenerating(true);
    setIsLoading(true);
    setResult(null);
    setIsSaved(false);

    try {
      const res = await api.post('/metatags/generate', {
        focus_topic: topic.trim(),
        content_brief: description.trim()
      });
      
      setResult({
        title: res.data.meta_title,
        description: res.data.meta_description
      });
    } catch (error: any) {
      console.error('Error generating meta tags:', error);
      if (error.response?.status === 503) {
        notify(error.response?.data?.message || 'Trafik AI sedang sibuk, silakan coba lagi.', 'error');
      } else {
        notify(error.response?.data?.message || 'Gagal menghasilkan meta tags.', 'error');
      }
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'title' | 'description') => {
    navigator.clipboard.writeText(text);
    if (type === 'title') {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  const handleSaveToTask = async () => {
    if (!result || !selectedTaskId) return;

    setIsSaving(true);
    try {
      await api.post('/metatags/save', {
        task_id: parseInt(selectedTaskId),
        meta_title: result.title,
        meta_description: result.description
      });
      
      setIsSaved(true);
      notify('Meta Tags berhasil disimpan ke database!');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
        setTopic('');
        setDescription('');
        setResult(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error saving meta tags:', error);
      notify(error.response?.data?.message || 'Gagal menyimpan meta tags.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getLengthColor = (length: number, max: number, min: number) => {
    if (length === 0) return 'text-[var(--text-secondary)]';
    if (length < min) return 'text-yellow-500'; // too short
    if (length <= max) return 'text-green-500'; // optimal
    return 'text-red-500'; // too long
  };

  const getBarColor = (length: number, max: number) => {
    if (length === 0) return 'bg-[var(--border-color)]';
    if (length <= max) return 'bg-green-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold mb-2">AI Meta Tag Generator</h2>
          <p className="text-[var(--text-secondary)]">Hasilkan Meta Title dan Meta Description instan yang berpotensi konversi tinggi dan teroptimasi SEO.</p>
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
               Tidak ada tugas aktif ("To Do" atau "In Progress").
             </div>
           ) : (
             <select 
               className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent appearance-none cursor-pointer"
               value={selectedTaskId}
               onChange={(e) => setSelectedTaskId(e.target.value)}
             >
               {activeTasks.map(task => (
                 <option key={task.id} value={task.id}>{task.title} ({task.status})</option>
               ))}
             </select>
           )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-primary)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-sm"
      >
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Judul Artikel / Topik Fokus</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                <Type className="h-5 w-5" />
              </div>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                placeholder="misal: Best SEO Practices 2024"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Deskripsi Singkat Konten</label>
            <div className="relative">
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full p-4 pl-10 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow resize-none min-h-[120px]"
                placeholder="Deskripsikan secara singkat tentang apa artikel atau halaman Anda..."
              />
              <div className="absolute top-4 left-3 text-[var(--text-secondary)] pointer-events-none">
                <AlignLeft className="h-5 w-5" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || !description.trim() || isGenerating}
            className="flex items-center justify-center w-full px-6 py-4 bg-[linear-gradient(to_right,var(--color-brand-yellow),#e0b820)] text-brand-black font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-base shadow-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Menghasilkan...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Hasilkan Meta Tags
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Results / Editable Output */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-[var(--bg-primary)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-8"
          >
            <div className="flex items-center space-x-2 border-b border-[var(--border-color)] pb-4">
              <Sparkles className="w-6 h-6 text-brand-yellow" />
              <h3 className="text-xl font-display font-bold">Hasil Meta Tags</h3>
            </div>

            {/* Meta Title */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="block text-sm font-medium text-[var(--text-primary)]">Meta Title</label>
                <div className="flex items-center text-xs space-x-2">
                  <span className={getLengthColor(result.title.length, 60, 30)}>
                    {result.title.length} / 60
                  </span>
                  {result.title.length <= 60 && result.title.length >= 30 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className={`w-4 h-4 ${result.title.length > 60 ? 'text-red-500' : 'text-yellow-500'}`} />
                  )}
                </div>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  value={result.title}
                  onChange={(e) => setResult({ ...result, title: e.target.value })}
                  className="w-full p-4 pr-14 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow text-lg text-blue-600 dark:text-blue-400 font-medium break-words transition-shadow"
                />
                <button
                  onClick={() => copyToClipboard(result.title, 'title')}
                  className="absolute top-2 right-2 p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:text-brand-yellow hover:border-brand-yellow transition-colors"
                  title="Salin Title"
                >
                  {copiedTitle ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-1.5 overflow-hidden">
                 <div className={`h-full rounded-full transition-all duration-500 ${getBarColor(result.title.length, 60)}`} style={{ width: `${Math.min((result.title.length / 60) * 100, 100)}%` }} />
              </div>
            </div>

            {/* Meta Description */}
            <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
              <div className="flex justify-between items-end">
                <label className="block text-sm font-medium text-[var(--text-primary)]">Meta Description</label>
                <div className="flex items-center text-xs space-x-2">
                  <span className={getLengthColor(result.description.length, 160, 120)}>
                     {result.description.length} / 160
                  </span>
                  {result.description.length <= 160 && result.description.length >= 120 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className={`w-4 h-4 ${result.description.length > 160 ? 'text-red-500' : 'text-yellow-500'}`} />
                  )}
                </div>
              </div>
              <div className="relative group">
                <textarea
                  value={result.description}
                  onChange={(e) => setResult({ ...result, description: e.target.value })}
                  className="w-full p-4 pr-14 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow text-base text-[var(--text-secondary)] break-words transition-shadow resize-none min-h-[100px]"
                />
                <button
                  onClick={() => copyToClipboard(result.description, 'description')}
                  className="absolute top-2 right-2 p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:text-brand-yellow hover:border-brand-yellow transition-colors"
                  title="Salin Description"
                >
                  {copiedDesc ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-1.5 overflow-hidden">
                 <div className={`h-full rounded-full transition-all duration-500 ${getBarColor(result.description.length, 160)}`} style={{ width: `${Math.min((result.description.length / 160) * 100, 100)}%` }} />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[var(--border-color)]">
               <div className="flex-1 p-4 bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl text-sm text-[var(--text-primary)] flex items-start">
                  <Sparkles className="w-5 h-5 text-brand-yellow mr-3 shrink-0 mt-0.5" />
                  <p>Anda dapat mengedit teks di atas. Indikator warna akan memberikan validasi panjang karakter secara langsung.</p>
               </div>
               
               <button
                 onClick={handleSaveToTask}
                 disabled={isSaving || isSaved || !selectedTaskId}
                 className={`w-full sm:w-auto flex-shrink-0 px-8 py-4 font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center ${
                   isSaved 
                     ? 'bg-green-500 text-white' 
                     : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border-2 border-brand-yellow hover:bg-brand-yellow/10 disabled:opacity-50 disabled:cursor-not-allowed'
                 }`}
               >
                 {isSaving ? (
                   <>
                     <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                     Menyimpan...
                   </>
                 ) : isSaved ? (
                   <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Tag tersimpan!
                   </>
                 ) : (
                   <>
                      <Save className="w-5 h-5 mr-2" />
                      Simpan Tag ke Tugas Aktif
                   </>
                 )}
               </button>
            </div>
          </motion.div>
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
              <AlertCircle className="w-6 h-6" />
            )}
            <span className="font-medium">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

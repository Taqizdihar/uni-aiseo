import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, FileImage, Sparkles, CheckCircle, AlertTriangle, ArrowRight, Save, Link2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface AnalysisResult {
  image_url: string;
  text_ratio: string;
  readability: string;
  contrast_score: string;
  recommendations: string[];
}

interface ActiveTask {
  id: number;
  title: string;
  status: string;
}

export default function AIVisualAnalyzer({ setIsLoading }: { setIsLoading: (val: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
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

  // Fetch active tasks for the dropdown
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/png') {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setAnalysis(null);
      setIsSaved(false);
    } else {
      notify('Harap unggah file JPG atau PNG.', 'error');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/visual/analyze', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        if (res.status === 503) {
          notify(errData?.message || 'Trafik AI sedang sibuk, silakan coba lagi.', 'error');
        } else {
          notify(errData?.message || 'Gagal menganalisis gambar.', 'error');
        }
        return;
      }

      const data: AnalysisResult = await res.json();
      setAnalysis(data);
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      notify('Terjadi kesalahan jaringan. Silakan coba lagi.', 'error');
    } finally {
      setIsAnalyzing(false);
      setIsLoading(false);
    }
  };

  const handleSaveToTask = async () => {
    if (!analysis || !selectedTaskId) {
      notify('Pilih tugas terlebih dahulu.', 'error');
      return;
    }

    try {
      await api.post('/visual/save', {
        task_id: parseInt(selectedTaskId),
        image_url: analysis.image_url,
        text_ratio: analysis.text_ratio,
        readability: analysis.readability,
        contrast_score: analysis.contrast_score,
        recommendations: analysis.recommendations,
      });
      setIsSaved(true);
      notify('Hasil analisis berhasil disimpan ke tugas!');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error: any) {
      console.error('Error saving to task:', error);
      notify(error.response?.data?.message || 'Gagal menyimpan hasil ke tugas.', 'error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setIsSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold mb-2">AI Visual & Design Analyzer</h2>
        <p className="text-[var(--text-secondary)]">Unggah mockup atau tangkapan layar untuk mendapatkan umpan balik instan berbasis AI tentang SEO dan usabilitas.</p>
      </div>

      {!analysis ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-primary)] p-8 rounded-2xl border border-[var(--border-color)] shadow-sm max-w-3xl mx-auto"
        >
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-12 text-center hover:border-brand-yellow hover:bg-brand-yellow/5 transition-colors cursor-pointer group"
          >
            <input
              type="file"
              accept="image/jpeg, image/png"
              className="hidden"
              id="file-upload"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) handleFileSelection(e.target.files[0]);
              }}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              {previewUrl ? (
                <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden border border-[var(--border-color)] shadow-sm">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium flex items-center">
                      <FileImage className="w-5 h-5 mr-2" />
                      Ubah Gambar
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-[var(--text-secondary)] group-hover:text-brand-yellow" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Tarik & Lepas Gambar (Drag & Drop)</h3>
                  <p className="text-[var(--text-secondary)] text-sm mb-4">atau klik untuk menelusuri (JPG, PNG)</p>
                  <span className="px-6 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm font-medium group-hover:bg-brand-yellow group-hover:text-brand-black group-hover:border-transparent transition-all">
                    Pilih File
                  </span>
                </>
              )}
            </label>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              disabled={!file || isAnalyzing}
              onClick={handleAnalyze}
              className="flex items-center px-6 py-3 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analisis Desain
                </>
              )}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Image Preview Side */}
          <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Pratinjau Gambar</h3>
              <button
                onClick={handleReset}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center"
              >
                Unggah Baru <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="flex-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-hidden flex items-center justify-center p-4">
              {previewUrl && <img src={previewUrl} alt="Analyzed Mockup" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />}
            </div>
          </div>

          {/* AI Feedback Side */}
          <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-6">
            <div className="flex items-center space-x-2 border-b border-[var(--border-color)] pb-4">
              <Sparkles className="w-6 h-6 text-brand-yellow" />
              <h3 className="text-xl font-display font-bold">Hasil Analisis</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)] text-sm font-medium mb-1 block">Rasio Text-to-Image</span>
                <div className="flex items-center text-lg font-bold">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  {analysis.text_ratio}
                </div>
              </div>
              <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)] text-sm font-medium mb-1 block">Skor Keterbacaan (Readability)</span>
                <div className="flex items-center text-lg font-bold">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  {analysis.readability}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)] text-sm font-medium mb-1 block">Penilaian Kontras Warna</span>
              <div className="flex items-start mt-1">
                <AlertTriangle className="w-5 h-5 text-brand-yellow mr-2 mt-0.5 flex-shrink-0" />
                <span className="font-medium leading-relaxed">{analysis.contrast_score}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Rekomendasi Tindakan:</h4>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-brand-yellow/10 text-brand-yellow flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="text-[var(--text-secondary)] leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Attach to Task Section */}
            <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
               <h4 className="font-semibold mb-3 flex items-center">
                 <Link2 className="w-4 h-4 mr-2" />
                 Sematkan ke Tugas
               </h4>
               {activeTasks.length === 0 ? (
                 <p className="text-sm text-[var(--text-secondary)]">Tidak ada tugas aktif. Buat tugas baru terlebih dahulu di Task Board.</p>
               ) : (
                 <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                   <select
                     className="flex-1 w-full sm:w-auto px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent text-sm appearance-none cursor-pointer"
                     value={selectedTaskId}
                     onChange={(e) => setSelectedTaskId(e.target.value)}
                   >
                     {activeTasks.map(task => (
                       <option key={task.id} value={task.id}>
                         {task.title} ({task.status})
                       </option>
                     ))}
                   </select>
                   <button
                     onClick={handleSaveToTask}
                     disabled={isSaved || !selectedTaskId}
                     className={`w-full sm:w-auto shrink-0 px-6 py-2.5 font-semibold rounded-xl transition-colors flex items-center justify-center ${
                       isSaved
                         ? 'bg-green-500 text-white hover:bg-green-600'
                         : 'bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover'
                     } disabled:opacity-60`}
                   >
                     {isSaved ? (
                       <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Tersimpan!
                       </>
                     ) : (
                       <>
                          <Save className="w-4 h-4 mr-2" />
                          Simpan Hasil ke Tugas
                       </>
                     )}
                   </button>
                 </div>
               )}
            </div>
          </div>
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
              <CheckCircle className="w-6 h-6" />
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

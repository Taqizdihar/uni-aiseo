import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UploadCloud, FileImage, Sparkles, CheckCircle, AlertTriangle, ArrowRight, Save, Link2 } from 'lucide-react';

interface MockAnalysis {
  textToImage: string;
  readability: string;
  contrast: string;
  recommendations: string[];
}

export default function AIVisualAnalyzer({ setIsLoading }: { setIsLoading: (val: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>('https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop');
  const [analysis, setAnalysis] = useState<MockAnalysis | null>({
    textToImage: '18% (Optimal)',
    readability: '92/100 (Sangat Baik)',
    contrast: 'Perlu Perbaikan (Kontras teks Header dengan latar belakang gelap sedikit rendah)',
    recommendations: [
      'Tingkatkan rasio kontras header setidaknya menjadi 4.5:1 untuk kepatuhan WCAG.',
      'Optimalkan ukuran file gambar; ukuran saat ini mungkin berdampak pada Largest Contentful Paint (LCP).',
      'Tambahkan alt text deskriptif ke elemen UI fungsional untuk aksesibilitas yang lebih baik.',
      'Hierarki visual kuat; tombol Call to Action langsung menarik perhatian.'
    ]
  });
  
  const [selectedTask, setSelectedTask] = useState('Pembaruan UX Promo Musim Panas');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveToTask = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

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
    } else {
      alert('Harap unggah file JPG atau PNG.');
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    setIsLoading(true);
    
    // Simulate complex AI processing
    setTimeout(() => {
      setAnalysis({
        textToImage: '18% (Optimal)',
        readability: '92/100 (Sangat Baik)',
        contrast: 'Perlu Perbaikan (Kontras teks Header dengan latar belakang gelap sedikit rendah)',
        recommendations: [
          'Tingkatkan rasio kontras header setidaknya menjadi 4.5:1 untuk kepatuhan WCAG.',
          'Optimalkan ukuran file gambar; ukuran saat ini mungkin berdampak pada Largest Contentful Paint (LCP).',
          'Tambahkan alt text deskriptif ke elemen UI fungsional untuk aksesibilitas yang lebih baik.',
          'Hierarki visual kuat; tombol Call to Action langsung menarik perhatian.'
        ]
      });
      setIsLoading(false);
    }, 4000);
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
                if (e.target.files) handleFileSelection(e.target.files[0]);
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
              disabled={!file}
              onClick={handleAnalyze}
              className="flex items-center px-6 py-3 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Analisis Desain
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
                onClick={() => setAnalysis(null)}
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
                  {analysis.textToImage}
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
                <span className="font-medium leading-relaxed">{analysis.contrast}</span>
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
               <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                 <select 
                   className="flex-1 w-full sm:w-auto px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent text-sm appearance-none cursor-pointer"
                   value={selectedTask}
                   onChange={(e) => setSelectedTask(e.target.value)}
                 >
                   <option value="Pembaruan UX Promo Musim Panas">Pembaruan UX Promo Musim Panas</option>
                   <option value="Desain Ulang Hero Beranda">Desain Ulang Hero Beranda</option>
                   <option value="Blog Post: Tren AI SEO">Blog Post: Tren AI SEO</option>
                 </select>
                 <button 
                   onClick={handleSaveToTask}
                   disabled={isSaved}
                   className={`w-full sm:w-auto shrink-0 px-6 py-2.5 font-semibold rounded-xl transition-colors flex items-center justify-center ${
                     isSaved 
                       ? 'bg-green-500 text-white hover:bg-green-600' 
                       : 'bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover'
                   }`}
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
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

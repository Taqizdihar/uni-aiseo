import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, History, Calendar, Star, FileText, X, LayoutTemplate, AlertCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface ArchiveData {
  taskId: string | number;
  campaignName: string;
  completionDate: string;
  finalScore: number | string | null;
  focusKeyword: string | null;
  contentDraft: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  analystName: string | null;
  writerName: string | null;
}

export default function ProjectHistory() {
  const [archives, setArchives] = useState<ArchiveData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [selectedProject, setSelectedProject] = useState<ArchiveData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        const res = await api.get('/archive');
        setArchives(res.data);
      } catch (err) {
        console.error('Error fetching archive:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArchive();
  }, []);

  const filteredArchives = archives.filter(p => 
    p.campaignName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const openReport = (project: ArchiveData) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-yellow" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-display font-bold mb-2 flex items-center">
            <History className="w-6 h-6 mr-2 text-brand-yellow" />
            Arsip Workspace
          </h2>
          <p className="text-[var(--text-secondary)]">Akses dan tinjau laporan kampanye SEO yang telah selesai.</p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
          <input
            type="text"
            placeholder="Cari kampanye..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:border-brand-yellow transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)]">
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Kampanye</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Tim (Analyst & Writer)</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Skor SEO Akhir</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Tanggal Selesai</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredArchives.map((project) => (
                <tr key={project.taskId} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-[var(--text-primary)]">{project.campaignName}</p>
                  </td>
                  <td className="p-4 text-sm text-[var(--text-primary)]">
                    <span className="block">{project.analystName || 'Tidak ada'} &amp; {project.writerName || 'Tidak ada'}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      typeof project.finalScore === 'number' && project.finalScore >= 80 ? 'bg-green-500/10 text-green-500' :
                      typeof project.finalScore === 'number' && project.finalScore >= 60 ? 'bg-yellow-500/10 text-yellow-500' :
                      !project.finalScore ? 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      <Star className="w-3.5 h-3.5 mr-1" />
                      {project.finalScore ? `${project.finalScore}/100` : 'N/A'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                    {formatDate(project.completionDate)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openReport(project)}
                      className="px-4 py-2 bg-brand-yellow/10 text-brand-yellow font-semibold rounded-lg hover:bg-brand-yellow hover:text-brand-black transition-colors inline-flex items-center text-sm whitespace-nowrap"
                    >
                      <FileText className="w-4 h-4 mr-1.5" />
                      Lihat Laporan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!archives || archives.length === 0) && (
            <div className="h-64 flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-primary)]">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-[var(--text-secondary)] opacity-50" />
              </div>
              <p className="text-[var(--text-secondary)] font-medium max-w-sm">
                Tidak ada kampanye yang ditemukan. Sepertinya tidak ada kampanye disetujui yang cocok dengan pencarian Anda.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {isModalOpen && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--bg-primary)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[var(--border-color)]"
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] shrink-0 bg-[var(--bg-secondary)]/30">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-brand-yellow/10 rounded-lg">
                    <FileText className="w-6 h-6 text-brand-yellow" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">Laporan Akhir: {selectedProject.campaignName}</h3>
                    <p className="text-sm text-[var(--text-secondary)] flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Disetujui pada {formatDate(selectedProject.completionDate)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                {/* Metrics Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                    <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider mb-1">Skor SEO</p>
                    <p className={`text-2xl font-bold ${!selectedProject.finalScore ? 'text-[var(--text-secondary)]' : 'text-green-500'}`}>{selectedProject.finalScore || 'N/A'}</p>
                  </div>
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                    <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider mb-1">Target Keyword</p>
                    <input type="text" readOnly value={selectedProject.focusKeyword || 'Tidak ada data'} className="w-full bg-transparent text-base font-bold truncate focus:outline-none" title={selectedProject.focusKeyword || 'Tidak ada data'} />
                  </div>
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                    <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider mb-1">Readability</p>
                    <p className="text-base font-bold text-blue-500">N/A</p> {/* Readability isn't strictly requested to be mapped from root object, keeping N/A or omitting */}
                  </div>
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                    <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider mb-1">Status</p>
                    <p className="text-base font-bold flex items-center text-green-500">
                      Selesai
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Meta Tags */}
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
                      <LayoutTemplate className="w-5 h-5 mr-2 text-brand-yellow" />
                      Meta Tags Final
                    </h4>
                    <div className="bg-[var(--bg-secondary)] p-5 rounded-xl border border-[var(--border-color)] space-y-4">
                      <div>
                        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Meta Title</span>
                        <input type="text" readOnly value={selectedProject.metaTitle || 'Tidak ada data'} className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-blue-500 font-medium focus:outline-none" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Meta Description</span>
                        <textarea readOnly value={selectedProject.metaDescription || 'Tidak ada data'} className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] min-h-[80px] resize-none focus:outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Tim */}
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
                      <AlertCircle className="w-5 h-5 mr-2 text-brand-yellow" />
                      Tim Penanggung Jawab
                    </h4>
                    <div className="bg-[var(--bg-secondary)] p-5 rounded-xl border border-[var(--border-color)] space-y-4">
                      <div>
                        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">SEO Analyst</span>
                        <p className="font-medium">{selectedProject.analystName || 'Tidak ada data'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Content Writer</span>
                        <p className="font-medium">{selectedProject.writerName || 'Tidak ada data'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Draft */}
                <div className="space-y-4">
                  <h4 className="font-bold flex items-center text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
                    <FileText className="w-5 h-5 mr-2 text-brand-yellow" />
                    Draf Konten Final
                  </h4>
                  <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)]">
                    <textarea 
                      readOnly 
                      value={selectedProject.contentDraft || 'Tidak ada data'} 
                      className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] min-h-[300px] resize-none focus:outline-none whitespace-pre-wrap leading-relaxed" 
                    />
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Eye, ArrowLeft, CheckCircle2, User, Activity, FileText, Download } from 'lucide-react';

interface MockCampaign {
  id: string;
  name: string;
  completedDate: string;
  assignedWriter: string;
  assignedAnalyst: string;
  finalScore: number;
  finalContent: string;
  targetKeyword: string;
  lsiKeywords: string[];
  metaTitle: string;
  metaDesc: string;
}

const initialCampaigns: MockCampaign[] = [
  { 
    id: '1', 
    name: 'Desain Ulang Hero Beranda - Q3', 
    completedDate: '2026-06-12', 
    assignedWriter: 'Siti (SA)', 
    assignedAnalyst: 'Andi (Analyst)',
    finalScore: 98,
    finalContent: `# Selamat Datang di Dunia Baru Kami\n\nJelajahi inovasi terkini dan desain memukau. Kami membawa performa dan keindahan ke tingkat selanjutnya...`,
    targetKeyword: 'Desain Inovatif',
    lsiKeywords: ['Performa', 'Keindahan UI', 'Revolusi Desain'],
    metaTitle: 'Desain Inovatif: Transformasi Hero Beranda - Q3',
    metaDesc: 'Kami membawakan pengalaman baru dengan desain memukau. Jelajahi sekarang untuk inovasi tanpa batas.'
  },
  { 
    id: '2', 
    name: 'Pembaruan UX Promo Musim Panas', 
    completedDate: '2026-06-10', 
    assignedWriter: 'Budi (CW)', 
    assignedAnalyst: 'Citra (Analyst)',
    finalScore: 92,
    finalContent: `# Diskon Spesial Musim Panas\n\nPenawaran terbaik terbatas untuk musim ini! Jangan lewatkan kesempatan Anda mendapatkan produk favorit dengan harga miring.\n\n## Kategori Diskon 50%\n* Sandal Musim Panas\n* Kacamata Hitam\n* Topi Pantai\n\nSegera berbelanja sebelum kehabisan!`,
    targetKeyword: 'Promo Musim Panas',
    lsiKeywords: ['Diskon Spesial', 'Penawaran Terbatas', 'Harga Miring'],
    metaTitle: 'Spesial: Promo Musim Panas Diskon hingga 50%',
    metaDesc: 'Jangan lewatkan promo musim panas kami dengan diskon fantastis. Dapatkan produk impian sekarang!'
  },
  { 
    id: '3', 
    name: 'Blog Post: Gambaran Umum Tren AI SEO', 
    completedDate: '2026-06-08', 
    assignedWriter: 'Budi (CW)', 
    assignedAnalyst: 'Citra (Analyst)',
    finalScore: 89,
    finalContent: `# Mengapa AI Mempengaruhi SEO di 2024\n\nDengan perkembangan teknologi, lanskap pencarian digital berubah. \n\n## Peran NLP\nNLP memungkinkan mesin pencari lebih memahami makna di balik query, membantu pengiriman konten yang lebih relevan. Ini merubah strategi SEO secara radikal...`,
    targetKeyword: 'AI SEO Tren',
    lsiKeywords: ['Mesin Pencari', 'NLP SEO', 'Optimasi AI'],
    metaTitle: 'Tren AI SEO: Panduan Lengkap Perubahan Lanskap Pencarian',
    metaDesc: 'Pelajari dampak revolusioner AI terhadap strategi SEO. Baca selengkapnya untuk mempertahankan peringkat dengan NLP.'
  },
];

export default function WorkspaceArchive() {
  const [campaigns] = useState<MockCampaign[]>(initialCampaigns);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedCampaign, setSelectedCampaign] = useState<MockCampaign | null>(null);

  const filteredCampaigns = campaigns.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (selectedCampaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => setSelectedCampaign(null)}
            className="p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-brand-yellow hover:border-brand-yellow transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-display font-bold flex items-center">
              <CheckCircle2 className="w-6 h-6 mr-2 text-green-500" />
              {selectedCampaign.name}
            </h2>
            <div className="flex items-center text-[var(--text-secondary)] text-sm mt-1">
              <span>Disetujui & Diarsipkan pada {selectedCampaign.completedDate}</span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-primary)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
              <div className="flex flex-col sm:flex-row gap-6">
                 <div>
                   <h3 className="text-sm uppercase tracking-wider font-bold mb-1 flex items-center text-[var(--text-secondary)]">
                     <User className="w-4 h-4 mr-2" />
                     Writer yang Ditugaskan
                   </h3>
                   <p className="text-[var(--text-primary)] font-medium">{selectedCampaign.assignedWriter}</p>
                 </div>
                 <div>
                   <h3 className="text-sm uppercase tracking-wider font-bold mb-1 flex items-center text-[var(--text-secondary)]">
                     <User className="w-4 h-4 mr-2" />
                     Analyst yang Ditugaskan
                   </h3>
                   <p className="text-[var(--text-primary)] font-medium">{selectedCampaign.assignedAnalyst}</p>
                 </div>
              </div>
              <div className="text-right sm:text-left">
                <h3 className="text-sm uppercase tracking-wider font-bold mb-1 flex items-center justify-end sm:justify-start text-[var(--text-secondary)]">
                  <Activity className="w-4 h-4 mr-2 text-green-500" />
                  Skor SEO Final
                </h3>
                <div className="flex items-center justify-end sm:justify-start gap-3">
                  <div className="w-32 bg-[var(--bg-secondary)] rounded-full h-2">
                     <div className="bg-green-500 h-full rounded-full" style={{ width: `${selectedCampaign.finalScore}%` }} />
                  </div>
                  <span className="text-[var(--text-primary)] font-bold text-green-500">{selectedCampaign.finalScore}/100</span>
                </div>
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-xl font-display font-bold text-[var(--text-primary)] flex items-center">
                 <FileText className="w-5 h-5 mr-3 text-brand-yellow" />
                 Laporan Final Kampanye
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Left Column: Keyword & Meta */}
                 <div className="md:col-span-1 space-y-6">
                    <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)]">
                       <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Strategi Keyword</h4>
                       <div className="space-y-4">
                          <div>
                             <span className="text-xs text-[var(--text-secondary)] block mb-1">Target Keyword</span>
                             <span className="inline-block px-3 py-1 bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 font-medium rounded-lg">{selectedCampaign.targetKeyword}</span>
                          </div>
                          <div>
                             <span className="text-xs text-[var(--text-secondary)] block mb-2">LSI Keywords</span>
                             <div className="flex flex-wrap gap-2">
                                {selectedCampaign.lsiKeywords.map((kw, i) => (
                                   <span key={i} className="px-2 py-1 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] text-xs rounded shadow-sm">{kw}</span>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
                       <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Meta Tags Final</h4>
                       <div>
                         <span className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Title</span>
                         <p className="text-blue-400 font-medium text-sm leading-tight">{selectedCampaign.metaTitle}</p>
                       </div>
                       <div>
                         <span className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Description</span>
                         <p className="text-[var(--text-primary)] text-sm">{selectedCampaign.metaDesc}</p>
                       </div>
                    </div>
                 </div>

                 {/* Right Column: Content Sandbox */}
                 <div className="md:col-span-2">
                    <div className="h-full flex flex-col">
                       <div className="p-4 bg-[var(--bg-secondary)] border-t border-x border-[var(--border-color)] rounded-t-xl shrink-0 flex items-center justify-between">
                          <span className="text-sm font-semibold text-[var(--text-primary)]">Teks Artikel Final</span>
                          <span className="text-xs text-[var(--text-secondary)]">Read-Only</span>
                       </div>
                       <div className="p-6 bg-[#1a1a1c] border border-[var(--border-color)] rounded-b-xl overflow-y-auto flex-1 min-h-[300px]">
                          <div className="prose prose-invert prose-sm max-w-none font-mono text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                             {selectedCampaign.finalContent}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="pt-6 border-t border-[var(--border-color)] text-right flex items-center justify-end">
              <button className="flex items-center px-6 py-3 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover shadow-sm transition-colors">
                <Download className="w-5 h-5 mr-2" />
                Unduh Laporan Lengkap PDF
              </button>
           </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-display font-bold mb-2">Arsip Workspace</h2>
          <p className="text-[var(--text-secondary)]">Tinjau kampanye yang diselesaikan dan disetujui untuk workspace ini.</p>
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2.5 text-sm border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
            placeholder="Cari kampanye..."
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden flex-1"
      >
        {filteredCampaigns.length > 0 ? (
          <div className="overflow-x-auto h-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Nama Task / Kampanye</th>
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Tanggal Diselesaikan</th>
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Writer yang Ditugaskan</th>
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)] text-center">Skor SEO Final</th>
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]/20 transition-colors group">
                    <td className="py-4 px-6 font-medium">
                      {campaign.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-[var(--text-secondary)]">
                      {campaign.completedDate}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-sm">
                        <div className="w-6 h-6 rounded-full bg-brand-yellow/20 text-brand-yellow flex items-center justify-center font-bold text-xs mr-2">
                          {campaign.assignedWriter.charAt(0)}
                        </div>
                        {campaign.assignedWriter}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                       <span className="font-bold text-green-500">{campaign.finalScore}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                       <button
                         onClick={() => setSelectedCampaign(campaign)}
                         className="px-4 py-2 inline-flex items-center justify-center rounded-lg font-semibold bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-brand-yellow hover:text-brand-black hover:border-brand-yellow transition-colors text-sm"
                       >
                         <Eye className="w-4 h-4 mr-2" />
                         Lihat Laporan Final
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center h-full">
             <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-[var(--text-secondary)] opacity-50" />
             </div>
             <h3 className="text-lg font-bold mb-2">Tidak ada kampanye yang ditemukan.</h3>
             <p className="text-[var(--text-secondary)] max-w-sm">
               Sepertinya tidak ada kampanye disetujui yang cocok dengan pencarian Anda.
             </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

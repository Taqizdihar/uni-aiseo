import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const initialFAQs: FAQ[] = [
  { id: '1', question: 'Bagaimana cara AI Visual Analyzer menilai gambar saya?', answer: 'Model AI kami mengevaluasi komposisi, rasio teks-ke-gambar, kontras warna untuk kepatuhan aksesibilitas WCAG, dan hierarki struktural terhadap tolok ukur standar desain web peringkat atas.' },
  { id: '2', question: 'Apakah keyword yang dianalisis disimpan secara otomatis?', answer: 'Ya! Setiap daftar keyword yang dihasilkan atau audit SEO on-page otomatis disimpan ke panel Arsip Workspace Anda untuk ditinjau nanti.' },
  { id: '3', question: 'Bisakah saya mengekspor rekomendasi SEO?', answer: 'Saat ini, Anda dapat melihat semua rekomendasi langsung di dashboard dan menyalinnya secara manual. Mengekspor ke PDF/CSV direncanakan untuk rilis V2 mendatang.' },
  { id: '4', question: 'Apa batasan untuk AI Content Optimization?', answer: 'Pengguna paket Pro memiliki akses ke kredit analitik AI tanpa batas, sementara akun standar dibatasi hingga 50 permintaan per bulan.' },
];

export default function FAQViewer() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-8">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-yellow/20">
           <MessageSquare className="w-8 h-8 text-brand-yellow" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-3">Pusat Bantuan & FAQs</h2>
        <p className="text-[var(--text-secondary)]">Pertanyaan yang sering diajukan seputar penggunaan platform UNI-AISEO.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {initialFAQs.map((faq, idx) => (
          <div key={faq.id} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl overflow-hidden transition-shadow hover:shadow-sm">
            <button
              onClick={() => toggleAccordion(idx)}
              className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
            >
              <div className="flex items-center space-x-3">
                <HelpCircle className={`w-5 h-5 transition-colors ${openIndex === idx ? 'text-brand-yellow' : 'text-[var(--text-secondary)]'}`} />
                <span className="font-semibold text-lg">{faq.question}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-6 pt-0 text-[var(--text-secondary)] leading-relaxed pl-14">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

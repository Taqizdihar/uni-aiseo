import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, MessageSquare, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function FAQViewer() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await api.get('/faqs');
        setFaqs(res.data);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-yellow" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col pt-4">
      <div className="text-center mb-10 shrink-0">
        <div className="w-16 h-16 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-brand-yellow" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-3">Pusat Bantuan & FAQs</h2>
        <p className="text-[var(--text-secondary)]">
          Temukan jawaban atas pertanyaan umum seputar fitur dan penggunaan platform UNI-AISEO.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 mt-10 text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4 border border-[var(--border-color)]">
              <MessageSquare className="w-10 h-10 text-[var(--text-secondary)] opacity-50" />
            </div>
            <h3 className="text-xl font-bold mb-2">Belum ada informasi bantuan saat ini.</h3>
            <p className="text-[var(--text-secondary)] font-medium max-w-sm">
              Administrator belum menambahkan FAQ. Silakan periksa kembali nanti.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div 
                key={faq.id}
                className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl overflow-hidden transition-all hover:border-brand-yellow/50 shadow-sm"
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-semibold text-[var(--text-primary)] pr-8">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300 shrink-0 ${
                      openId === faq.id ? 'rotate-180 text-brand-yellow' : ''
                    }`} 
                  />
                </button>
                <AnimatePresence>
                  {openId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-5 text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)] pt-4 mt-1">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit2, Trash2, HelpCircle, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function FAQManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

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

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/faqs');
      setFaqs(res.data);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      notify('Gagal memuat FAQs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setSelectedFaq(null);
    setQuestion('');
    setAnswer('');
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FAQ) => {
    setSelectedFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setIsModalOpen(true);
  };

  const openDeleteModal = (faq: FAQ) => {
    setSelectedFaq(faq);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setIsSubmitting(true);
    try {
      if (selectedFaq) {
        await api.put(`/faqs/${selectedFaq.id}`, { question, answer });
        notify('FAQ berhasil diperbarui!');
      } else {
        await api.post('/faqs', { question, answer });
        notify('FAQ berhasil ditambahkan!');
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err: any) {
      console.error('Error saving FAQ:', err);
      notify(err.response?.data?.message || 'Gagal menyimpan FAQ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFaq) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/faqs/${selectedFaq.id}`);
      notify('FAQ berhasil dihapus!');
      setIsDeleteModalOpen(false);
      fetchFaqs();
    } catch (err: any) {
      console.error('Error deleting FAQ:', err);
      notify(err.response?.data?.message || 'Gagal menghapus FAQ', 'error');
    } finally {
      setIsSubmitting(false);
    }
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
            <HelpCircle className="w-6 h-6 mr-2 text-brand-yellow" />
            Kelola FAQs
          </h2>
          <p className="text-[var(--text-secondary)]">Kelola Pusat Bantuan untuk pengguna Workspace Anda.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
            <input
              type="text"
              placeholder="Cari pertanyaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:border-brand-yellow transition-colors"
            />
          </div>
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah FAQ Baru
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm flex flex-col">
        {faqs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
              <HelpCircle className="w-8 h-8 text-[var(--text-secondary)] opacity-50" />
            </div>
            <h3 className="text-xl font-bold mb-2">Belum ada FAQ</h3>
            <p className="text-[var(--text-secondary)] font-medium max-w-sm">
              Belum ada FAQ. Klik 'Tambah FAQ Baru' untuk membuat dan memandu pengguna Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)]">
                  <th className="p-4 font-semibold text-[var(--text-secondary)] w-1/3">Pertanyaan</th>
                  <th className="p-4 font-semibold text-[var(--text-secondary)]">Jawaban</th>
                  <th className="p-4 font-semibold text-[var(--text-secondary)] text-right w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredFaqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                    <td className="p-4 font-medium text-[var(--text-primary)] align-top">
                      {faq.question}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)] leading-relaxed align-top">
                      {faq.answer}
                    </td>
                    <td className="p-4 text-right align-top">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(faq)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit FAQ"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(faq)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Hapus FAQ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--bg-primary)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[var(--border-color)]"
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                <h3 className="text-xl font-bold">
                  {selectedFaq ? 'Edit FAQ' : 'Tambah FAQ Baru'}
                </h3>
                <button 
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Pertanyaan</label>
                    <input
                      type="text"
                      required
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow transition-shadow"
                      placeholder="Masukkan pertanyaan umum..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Jawaban</label>
                    <textarea
                      required
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow transition-shadow resize-none h-32"
                      placeholder="Tuliskan jawaban yang detail..."
                    />
                  </div>
                </div>

                <div className="p-6 pt-0 flex justify-end gap-3 border-t border-[var(--border-color)] mt-6 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover flex items-center"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {selectedFaq ? 'Simpan Perubahan' : 'Tambah FAQ'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedFaq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isSubmitting && setIsDeleteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[var(--bg-primary)] rounded-2xl shadow-2xl p-6 border border-[var(--border-color)] text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Hapus FAQ ini?</h3>
              <p className="text-[var(--text-secondary)] mb-6">
                Tindakan ini tidak dapat dibatalkan. Pertanyaan "{selectedFaq.question}" akan dihapus permanen.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-colors border border-[var(--border-color)]"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 flex items-center"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
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

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HelpCircle,
  Edit2,
  Trash2,
  Plus,
  X,
  Server,
  CheckCircle2,
} from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const initialFAQs: FAQ[] = [
  {
    id: "1",
    question: "Bagaimana cara AI Visual Analyzer menilai gambar saya?",
    answer:
      "Model AI kami mengevaluasi komposisi, rasio teks-ke-gambar, kontras warna untuk kepatuhan aksesibilitas WCAG, dan hierarki struktural terhadap tolok ukur standar desain web peringkat atas.",
  },
  {
    id: "2",
    question: "Apakah keyword yang dianalisis disimpan secara otomatis?",
    answer:
      "Ya! Setiap daftar keyword yang dihasilkan atau audit SEO on-page otomatis disimpan ke panel Arsip Workspace Anda untuk ditinjau nanti.",
  },
  {
    id: "3",
    question: "Bisakah saya mengekspor rekomendasi SEO?",
    answer:
      "Saat ini, Anda dapat melihat semua rekomendasi langsung di dashboard dan menyalinnya secara manual. Mengekspor ke PDF/CSV direncanakan untuk rilis V2 mendatang.",
  },
  {
    id: "4",
    question: "Apa batasan untuk AI Content Optimization?",
    answer:
      "Pengguna paket Pro memiliki akses ke kredit analitik AI tanpa batas, sementara akun standar dibatasi hingga 50 permintaan per bulan.",
  },
];

export default function FAQManager() {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFAQs);

  // Modal & Toast states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const openModal = (faq?: FAQ) => {
    if (faq) {
      setEditingId(faq.id);
      setQuestion(faq.question);
      setAnswer(faq.answer);
    } else {
      setEditingId(null);
      setQuestion("");
      setAnswer("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setQuestion("");
    setAnswer("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    if (editingId) {
      setFaqs(
        faqs.map((f) => (f.id === editingId ? { ...f, question, answer } : f)),
      );
      displayToast("FAQ berhasil diperbarui.");
    } else {
      setFaqs([...faqs, { id: Date.now().toString(), question, answer }]);
      displayToast("FAQ berhasil ditambahkan.");
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus FAQ ini?")) {
      setFaqs(faqs.filter((f) => f.id !== id));
      displayToast("FAQ berhasil dihapus.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold mb-2 flex items-center">
            <Server className="w-6 h-6 mr-2 text-brand-yellow" />
            Kelola FAQs
          </h2>
          <p className="text-[var(--text-secondary)]">
            Tambah, edit, atau hapus Pertanyaan yang Sering Diajukan yang
            terlihat oleh pengguna.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-5 py-2.5 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah FAQ Baru
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-4"
      >
        {faqs.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            Tidak ada FAQ yang tersedia. Mulai dengan menambahkan satu!
          </div>
        ) : (
          faqs.map((faq) => (
            <div
              key={faq.id}
              className="p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-brand-yellow/30 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2 flex items-start">
                  <HelpCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5 text-brand-yellow" />
                  {faq.question}
                </h4>
                <p className="text-[var(--text-secondary)] pl-7 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
              <div className="flex items-center space-x-2 shrink-0 sm:mt-0 mt-2">
                <button
                  onClick={() => openModal(faq)}
                  className="p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:text-blue-500 hover:border-blue-500 transition-colors"
                  title="Edit FAQ"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500 transition-colors"
                  title="Hapus FAQ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[var(--bg-primary)] p-6 rounded-2xl shadow-xl w-full max-w-xl border border-[var(--border-color)] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {editingId ? "Edit FAQ" : "Tambah FAQ Baru"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pertanyaan
                  </label>
                  <input
                    type="text"
                    required
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="block w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                    placeholder="misal, Bagaimana cara saya menghasilkan keywords?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Jawaban
                  </label>
                  <textarea
                    required
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="block w-full p-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow min-h-[120px] resize-none"
                    placeholder="Berikan jawaban yang jelas dan membantu..."
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand-yellow text-brand-black font-semibold rounded-lg hover:bg-brand-yellow-hover"
                  >
                    Simpan FAQ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-[300]"
          >
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span className="font-medium text-sm">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

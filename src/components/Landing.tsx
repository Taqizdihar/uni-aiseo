import React from 'react';
import { ArrowRight, BarChart2, Globe, Zap, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingProps {
  navigate: (view: string) => void;
}

export default function Landing({ navigate }: LandingProps) {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-brand-black" />,
      title: 'Wawasan Berbasis AI',
      description: 'Manfaatkan model deep learning untuk memprediksi perubahan peringkat dan menemukan peluang Keyword tersembunyi sebelum pesaing Anda.'
    },
    {
      icon: <Globe className="w-6 h-6 text-brand-black" />,
      title: 'Pelacakan SERP Global',
      description: 'Pantau visibilitas Anda di Google, Bing, dan Baidu di lebih dari 150 wilayah dengan otomatisasi harian intelijen.'
    },
    {
      icon: <BarChart2 className="w-6 h-6 text-brand-black" />,
      title: 'Audit Konten Otomatis',
      description: 'Pindai seluruh domain Anda dan terima panduan buatan AI yang dapat ditindaklanjuti untuk memperbarui konten SEO dalam hitungan detik.'
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-display font-bold tracking-tight max-w-4xl mx-auto leading-tight"
          >
            Kuasai SERP dengan <span className="text-brand-yellow">Intelligent SEO</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto"
          >
            UNI-AISEO menggabungkan data skala perusahaan dengan algoritma AI canggih untuk menemukan Keyword ROI tinggi, mengaudit situs Anda, dan mengalahkan pesaing.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate('register')}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-brand-yellow text-brand-black rounded-xl hover:bg-brand-yellow-hover hover:scale-105 transition-all shadow-lg"
            >
              Mulai Uji Coba Gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('login')}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold border border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--border-color)] transition-colors"
            >
              Masuk
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[var(--bg-secondary)] border-y border-[var(--border-color)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold">Semua yang Anda butuhkan untuk peringkat #1</h2>
            <p className="mt-4 text-[var(--text-secondary)]">Kumpulan alat utama untuk tim pemasaran pencarian modern.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-8 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-brand-yellow rounded-xl mb-6 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaborative Teams Section */}
      <section className="py-32 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
             <div className="lg:w-1/2">
                <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
                   Dibuat Untuk <span className="text-brand-yellow">Tim Kolaboratif</span>
                </h2>
                <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed">
                   Satukan strategi SEO Anda dalam satu Workspace yang terpusat. Skalakan pertumbuhan organik Anda dengan menetapkan peran berbeda dan menghubungkan semua orang melalui alur kerja Task Board pintar.
                </p>
                <div className="space-y-8">
                   <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-shrink-0 items-center justify-center text-brand-yellow mt-1 font-bold shadow-sm">
                        <Users className="w-5 h-5 text-brand-yellow" />
                      </div>
                      <div className="ml-5">
                         <h4 className="text-xl font-bold text-[var(--text-primary)]">SEO Managers</h4>
                         <p className="text-[var(--text-secondary)] mt-2 leading-relaxed">Awasi kampanye, buat Task Board, dan pantau metrik visibilitas global serta penggunaan kredit AI.</p>
                      </div>
                   </div>
                   <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-shrink-0 items-center justify-center text-blue-500 mt-1 font-bold shadow-sm">
                        <BarChart2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="ml-5">
                         <h4 className="text-xl font-bold text-[var(--text-primary)]">SEO Analysts</h4>
                         <p className="text-[var(--text-secondary)] mt-2 leading-relaxed">Hasilkan AI Keyword, analisis desain visual, dan berikan rekomendasi strategis ke tugas.</p>
                      </div>
                   </div>
                   <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-shrink-0 items-center justify-center text-emerald-500 mt-1 font-bold shadow-sm">
                        <ArrowRight className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="ml-5">
                         <h4 className="text-xl font-bold text-[var(--text-primary)]">Content Writers</h4>
                         <p className="text-[var(--text-secondary)] mt-2 leading-relaxed">Optimalkan On-Page SEO, hasilkan Meta Tags menggunakan AI, dan ajukan draf konten untuk persetujuan cepat dari Manajer.</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="lg:w-1/2 w-full">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-8 shadow-xl lg:h-[600px] flex flex-col justify-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl" />
                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
                   
                   {/* Abstract Workspace Visual */}
                   <div className="space-y-6 w-full max-w-md mx-auto relative z-10">
                      <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }} className="bg-[var(--bg-primary)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm hover:border-brand-yellow/50 transition-colors">
                         <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 rounded-full bg-brand-yellow text-brand-black flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-brand-yellow/20">SM</div>
                           <div>
                             <p className="font-bold text-[var(--text-primary)]">Ringkasan Kampanye Dibuat</p>
                             <p className="text-xs text-[var(--text-secondary)] mt-0.5">Ditugaskan oleh SEO Manager</p>
                           </div>
                         </div>
                      </motion.div>
                      
                      <div className="w-1 h-8 bg-gradient-to-b from-[var(--border-color)] to-transparent ml-10 rounded-full" />

                      <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} viewport={{ once: true }} className="bg-[var(--bg-primary)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm ml-8 hover:border-blue-500/50 transition-colors">
                         <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-sm shadow-sm">SA</div>
                           <div>
                             <p className="font-bold text-[var(--text-primary)]">AI Keywords Disematkan</p>
                             <p className="text-xs text-[var(--text-secondary)] mt-0.5">Tugas diambil oleh SEO Analyst</p>
                           </div>
                         </div>
                      </motion.div>
                      
                      <div className="w-1 h-8 bg-gradient-to-b from-[var(--border-color)] to-transparent ml-[72px] rounded-full" />

                      <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} viewport={{ once: true }} className="bg-[var(--bg-primary)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm hover:border-emerald-500/50 transition-colors">
                         <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-sm shadow-sm">CW</div>
                           <div>
                             <p className="font-bold text-[var(--text-primary)]">Draf Konten & Meta Tag Siap</p>
                             <p className="text-xs text-[var(--text-secondary)] mt-0.5">Menunggu Persetujuan Manajer</p>
                           </div>
                         </div>
                      </motion.div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, UserPlus, Trash2, Send, CheckCircle2, ShieldBan, ShieldAlert, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  role: string;
  status: 'Active' | 'Pending';
}

const initialTeam: TeamMember[] = [
  { id: '1', email: 'manager@umkmmajujaya.com', role: 'SEO Manager', status: 'Active' },
  { id: '2', email: 'analyst@umkmmajujaya.com', role: 'SEO Analyst', status: 'Active' },
  { id: '3', email: 'writer@umkmmajujaya.com', role: 'Content Writer', status: 'Pending' },
];

export default function TeamManagement({ mockUser }: { mockUser?: { role: string; name: string; workspaceName?: string; workspaceBgUrl?: string; email?: string } | null }) {
  const workspaceName = mockUser?.workspaceName || 'UMKM Maju Jaya';
  const workspaceBgUrl = mockUser?.workspaceBgUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80';
  
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('SEO Analyst');
  const [showToast, setShowToast] = useState<'invite' | 'resend' | 'revoke' | null>(null);
  const [memberToRevoke, setMemberToRevoke] = useState<{ id: string; email: string } | null>(null);

  // Mock visual carousel data
  const visualTeam = [
    { id: '1', name: mockUser?.name || 'Siti Rahmawati', role: 'SEO Manager', avatar: (mockUser?.name?.charAt(0) || 'S').toUpperCase(), color: 'text-brand-yellow' },
    { id: 'A1', name: 'Andi Pratama', role: 'SEO Analyst', avatar: 'AP', color: 'text-blue-500' },
    { id: 'W1', name: 'Budi Santoso', role: 'Content Writer', avatar: 'BS', color: 'text-emerald-500' },
    { id: 'A2', name: 'Rina Kusuma', role: 'SEO Analyst', avatar: 'RK', color: 'text-blue-500' },
    { id: 'W2', name: 'Dewi Lestari', role: 'Content Writer', avatar: 'DL', color: 'text-emerald-500' },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + visualTeam.length) % visualTeam.length);
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % visualTeam.length);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setTeam([
      ...team,
      { id: Date.now().toString(), email: inviteEmail, role: inviteRole, status: 'Pending' }
    ]);
    setInviteEmail('');
    
    setShowToast('invite');
    setTimeout(() => setShowToast(null), 3000);
  };

  const confirmRevoke = () => {
    if (memberToRevoke) {
      setTeam(team.filter(member => member.id !== memberToRevoke.id));
      setMemberToRevoke(null);
      setShowToast('revoke');
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  const handleResend = (email: string) => {
    setShowToast('resend');
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <div className="h-full overflow-y-auto space-y-6">
      
      {/* Hero Section */}
      <section className="relative w-full rounded-b-3xl overflow-hidden -mt-6 mx-auto bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        {/* Blended Background Image */}
        <div 
          className="absolute inset-0 z-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `url("${workspaceBgUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
          }}
        />

        <div className="relative z-10 pt-16 pb-8 text-center max-w-5xl mx-auto px-4">
          <p className="text-sm font-bold tracking-widest text-[var(--text-secondary)] uppercase mb-2">Tim Dari</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-yellow mb-12 drop-shadow-md">
            {workspaceName}
          </h1>

          {/* Interactive Infinite Team Carousel */}
          <div className="relative w-full h-[320px] flex items-center justify-center">
            
            {/* Nav Buttons */}
            <button 
              onClick={handlePrev}
              className="absolute left-0 md:left-12 z-20 w-12 h-12 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-lg flex items-center justify-center hover:bg-brand-yellow hover:text-brand-black transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-0 md:right-12 z-20 w-12 h-12 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-lg flex items-center justify-center hover:bg-brand-yellow hover:text-brand-black transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Carousel Items */}
            <div className="relative w-full max-w-3xl h-full flex items-center justify-center pointer-events-none">
              {visualTeam.map((member, idx) => {
                const offset = ((idx - activeIndex + visualTeam.length + Math.floor(visualTeam.length / 2)) % visualTeam.length) - Math.floor(visualTeam.length / 2);
                
                const isActive = offset === 0;
                
                let translateX = 0;
                let scale = 1;
                let opacity = 1;

                if (offset === -1) {
                    translateX = -180;
                    scale = 0.85;
                    opacity = 0.6;
                } else if (offset === 1) {
                    translateX = 180;
                    scale = 0.85;
                    opacity = 0.6;
                } else if (offset === 0) {
                    translateX = 0;
                    scale = 1.15;
                    opacity = 1;
                } else if (offset === -2) {
                    translateX = -300;
                    scale = 0.6;
                    opacity = 0;
                } else {
                    translateX = 300;
                    scale = 0.6;
                    opacity = 0;
                }

                // Adjust tight spacing on mobile
                const isMobile = window.innerWidth < 768;
                if (isMobile) {
                   translateX = translateX * 0.6; 
                }

                return (
                  <div 
                    key={member.id}
                    className="absolute pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col items-center justify-center p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-3xl shadow-xl w-56 md:w-64"
                    style={{ 
                      transform: `translateX(${translateX}px) scale(${scale})`, 
                      opacity, 
                      zIndex: isActive ? 10 : 5,
                      boxShadow: isActive ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none'
                    }}
                    onClick={() => setActiveIndex(idx)}
                  >
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4 border-4 bg-[var(--bg-secondary)] shadow-inner ${
                      member.color === 'text-brand-yellow' ? 'border-brand-yellow/30 text-brand-yellow' : 
                      member.color === 'text-blue-500' ? 'border-blue-500/30 text-blue-500' : 
                      'border-emerald-500/30 text-emerald-500'
                    }`}>
                      {member.avatar}
                    </div>
                    <h4 className="text-xl font-bold text-center leading-tight truncate w-full">{member.name}</h4>
                    <p className={`text-sm mt-1 font-medium ${member.color}`}>
                      {member.role}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-primary)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-sm mb-8"
        >
          <h3 className="text-lg font-bold mb-4 border-b border-[var(--border-color)] pb-3">Undang Anggota Baru</h3>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                placeholder="team@example.com"
              />
            </div>
            <div className="sm:w-48 shrink-0">
               <select
                 value={inviteRole}
                 onChange={(e) => setInviteRole(e.target.value)}
                 className="block w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow appearance-none cursor-pointer"
               >
                 <option value="SEO Analyst">SEO Analyst</option>
                 <option value="Content Writer">Content Writer</option>
               </select>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center px-6 py-3 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover transition-colors shrink-0 whitespace-nowrap"
            >
              <Send className="w-4 h-4 mr-2" />
              Kirim Undangan
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden"
        >
           <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
            <h3 className="text-lg font-bold">Anggota Tim</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Email</th>
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Role</th>
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Status</th>
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {team.length === 0 ? (
                  <tr>
                     <td colSpan={4} className="py-8 text-center text-[var(--text-secondary)]">Tidak ada anggota tim yang ditemukan.</td>
                  </tr>
                ) : (
                  team.map((member) => (
                    <tr key={member.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]/20 transition-colors">
                      <td className="py-4 px-6 font-medium text-[var(--text-primary)]">{member.email}</td>
                      <td className="py-4 px-6 text-sm">{member.role}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          member.status === 'Active' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20'
                        }`}>
                          {member.status === 'Active' ? 'Aktif' : 'Tertunda'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                         {member.status === 'Active' ? (
                            member.role === 'SEO Manager' ? (
                              <span className="text-sm font-medium text-[var(--text-secondary)] italic mr-4">Anda (Pemilik)</span>
                            ) : (
                              <button
                                onClick={() => setMemberToRevoke({ id: member.id, email: member.email })}
                                className="p-2 inline-flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
                                title="Cabut Akses"
                              >
                                <ShieldBan className="w-4 h-4 mr-1.5" />
                                <span className="text-sm font-medium">Cabut</span>
                              </button>
                            )
                         ) : (
                            <button
                              onClick={() => handleResend(member.email)}
                              className="p-2 inline-flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors border border-transparent hover:border-blue-500/20"
                              title="Kirim Ulang Undangan"
                            >
                              <Send className="w-4 h-4 mr-1.5" />
                              <span className="text-sm font-medium">Kirim Ulang</span>
                            </button>
                         )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Revoke Confirmation Modal */}
      <AnimatePresence>
        {memberToRevoke && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
              onClick={() => setMemberToRevoke(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-2xl z-[201] overflow-hidden"
            >
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Cabut Akses Anggota?</h3>
                <button
                  onClick={() => setMemberToRevoke(null)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-[var(--text-secondary)] mb-6">
                  Apakah Anda yakin ingin mengeluarkan pengguna ini dari workspace {workspaceName}? Mereka tidak akan dapat lagi mengakses tugas atau alat AI.
                </p>
                <div className="flex gap-3 justify-end mt-8">
                  <button
                    onClick={() => setMemberToRevoke(null)}
                    className="px-6 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmRevoke}
                    className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    Ya, Cabut Akses
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toasts */}
      {(showToast) && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
           <div className={`border rounded-xl px-4 py-3 flex items-center shadow-lg backdrop-blur-md ${
             showToast === 'revoke' 
               ? 'bg-red-500/10 border-red-500/20 text-red-500' 
               : 'bg-green-500/10 border-green-500/20 text-green-500'
           }`}>
             {showToast === 'revoke' ? <ShieldBan className="w-5 h-5 mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
             <span className="font-medium text-sm">
               {showToast === 'invite' && 'Undangan berhasil dikirim!'}
               {showToast === 'resend' && 'Undangan berhasil dikirim ulang!'}
               {showToast === 'revoke' && 'Akses berhasil dicabut!'}
             </span>
           </div>
        </div>
      )}
    </div>
  );
}

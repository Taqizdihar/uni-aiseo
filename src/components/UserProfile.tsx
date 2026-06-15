import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Pencil,
  Building,
  X,
} from "lucide-react";
import api from "../utils/api";

interface UserProfileProps {
  mockUser: {
    name: string;
    email: string;
    role: string;
    workspaceName?: string;
    workspaceBgUrl?: string;
  } | null;
  setMockUser?: React.Dispatch<React.SetStateAction<any>>;
}

export default function UserProfile({
  mockUser,
  setMockUser,
}: UserProfileProps) {
  const [name, setName] = useState(mockUser?.name || "");
  const email = mockUser?.email || ""; // Cannot be changed
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [workspaceBgUrl, setWorkspaceBgUrl] = useState(
    mockUser?.workspaceBgUrl ||
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80",
  );
  const [workspaceName, setWorkspaceName] = useState(
    mockUser?.workspaceName || "UMKM Maju Jaya",
  );
  const [showToast, setShowToast] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  React.useEffect(() => {
    api.get('/users/profile').then(res => {
      const data = res.data;
      if (data.name) setName(data.name);
      if (data.workspace_name) setWorkspaceName(data.workspace_name);
      if (data.profile_picture) setProfilePicUrl(`http://localhost:5000${data.profile_picture}`);
      if (data.background_image) setWorkspaceBgUrl(`http://localhost:5000${data.background_image}`);
    }).catch(err => console.error(err));
  }, []);

  const handleImageUpload = async (file: File, endpoint: string) => {
    const formData = new FormData();
    if (endpoint === '/users/profile') {
      formData.append('profile_picture', file);
    } else {
      formData.append('background_image', file);
    }

    try {
      const res = await fetch(`http://localhost:5000/api${endpoint}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (endpoint === '/users/profile') {
        setProfilePicUrl(`http://localhost:5000${data.profile_picture}`);
      } else {
        setWorkspaceBgUrl(`http://localhost:5000${data.background_image}`);
      }
    } catch (e) {
      console.error(e);
      alert('Gagal mengupload gambar');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isChangingPassword && newPassword) {
      try {
        await api.post('/auth/change-password', { currentPassword, newPassword });
      } catch (error: any) {
        console.error('Error changing password:', error);
        const errorMsg = error.response?.data?.message || 'Gagal mengganti kata sandi.';
        alert(errorMsg);
        return;
      }
    }

    try {
      await api.put('/users/profile', { name });
      if (mockUser?.role === 'manager') {
        await api.put('/workspace/profile', { workspace_name: workspaceName });
      }

      if (setMockUser) {
        setMockUser((prev: any) => ({
          ...prev,
          name,
          workspaceName,
        }));
      }
      setShowToast(true);
      setCurrentPassword("");
      setNewPassword("");
      setIsChangingPassword(false);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Gagal menyimpan profil');
    }
  };

  const handleLeaveWorkspace = () => {
    setShowLeaveModal(false);
    alert('Anda telah keluar dari workspace.'); // Dummy action
    if (setMockUser) {
       setMockUser(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold mb-2">
          Profil Pengguna
        </h2>
        <p className="text-[var(--text-secondary)]">
          Kelola informasi pribadi dan pengaturan keamanan Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-primary)] p-0 rounded-2xl border border-[var(--border-color)] shadow-sm flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Background Image Preview */}
          <div
            className="w-full h-32 bg-[var(--bg-secondary)] relative group/cover"
            style={{
              backgroundImage: `url(${workspaceBgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
            {mockUser?.role === "manager" && (
              <label
                htmlFor="bg-upload"
                className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-opacity backdrop-blur-md cursor-pointer border border-white/20"
                title="Ganti Gambar Sampul"
              >
                <Pencil className="w-4 h-4" />
                <input 
                  type="file" 
                  id="bg-upload" 
                  className="hidden" 
                  accept="image/png, image/jpeg" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, '/workspace/profile');
                  }} 
                />
              </label>
            )}
          </div>

          <div className="p-6 md:p-8 flex flex-col items-center w-full relative -mt-16">
            <label htmlFor="profile-upload" className="relative group cursor-pointer mb-4">
              {profilePicUrl ? (
                <img src={profilePicUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover shadow-sm border-4 border-[var(--bg-primary)]" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-brand-yellow text-brand-black flex items-center justify-center font-display font-bold text-4xl shadow-sm border-4 border-[var(--bg-primary)]">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white mb-1" />
                <span className="text-xs text-white font-medium">Ganti</span>
              </div>
              <input 
                type="file" 
                id="profile-upload" 
                className="hidden" 
                accept="image/png, image/jpeg" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, '/users/profile');
                }} 
              />
            </label>

            <div className="flex space-x-2 mb-6">
              <label
                htmlFor="profile-upload"
                className="flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-secondary)] px-4 py-2 rounded-xl border border-[var(--border-color)] hover:border-brand-yellow/50 shadow-sm cursor-pointer hover:shadow"
              >
                <Camera className="w-4 h-4 mr-2" />
                Ganti Foto Profil
              </label>
            </div>

            <div>
              <h3 className="text-xl font-bold">{name || "User"}</h3>
              <p className="text-[var(--text-secondary)] text-sm">
                {mockUser?.role === "admin"
                  ? "Administrator"
                  : `${mockUser?.role === "manager" ? "SEO Manager" : "SEO Analyst"} • ${workspaceName}`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 bg-[var(--bg-primary)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-sm relative overflow-hidden"
        >
          <form onSubmit={handleSave} className="space-y-6">
            <h3 className="text-lg font-bold border-b border-[var(--border-color)] pb-3 mb-6">
              Detail Akun
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)]/50 text-[var(--text-secondary)] cursor-not-allowed opacity-70"
                    title="Email cannot be changed"
                  />
                </div>
              </div>

              {mockUser?.role === "manager" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nama Workspace
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                      <Building className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold border-b border-[var(--border-color)] pb-3 mb-6 pt-4">
              Keamanan
            </h3>

            {!isChangingPassword ? (
              <div>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="px-5 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl font-medium text-[var(--text-primary)] hover:border-brand-yellow/50 hover:bg-[var(--bg-primary)] transition-colors shadow-sm"
                >
                  Ganti Kata Sandi
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Kata Sandi Saat Ini
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                    }}
                    className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Batalkan penggantian kata sandi
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center justify-center px-6 py-3 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover hover:scale-105 transition-all shadow-sm"
              >
                <Save className="w-5 h-5 mr-2" />
                Simpan Perubahan
              </button>
            </div>
          </form>

          {/* Toast Notification */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-6 right-6 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl px-4 py-3 flex items-center shadow-lg backdrop-blur-md"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <span className="font-medium text-sm">
                  Profil berhasil diperbarui!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Danger Zone */}
      {mockUser?.role !== "manager" && mockUser?.role !== "admin" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-red-500/5 p-6 rounded-2xl border border-red-500/20 shadow-sm relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-1">Zona Bahaya</h3>
              <p className="text-sm text-[var(--text-secondary)]">Keluar dari workspace akan menghapus akses Anda ke semua fitur dan tugas.</p>
            </div>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-6 py-2.5 rounded-xl border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold transition-colors whitespace-nowrap"
            >
              Keluar dari Workspace
            </button>
          </div>
        </motion.div>
      )}

      {/* Leave Workspace Modal */}
      <AnimatePresence>
        {showLeaveModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
              onClick={() => setShowLeaveModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-2xl z-[201] overflow-hidden"
            >
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Keluar dari Workspace?</h3>
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Lock className="w-5 h-5 hidden" /> {/* Just to keep layout, using X instead */}
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-[var(--text-secondary)] mb-6">
                  Anda akan kehilangan akses ke semua tugas di {workspaceName}. Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-3 justify-end mt-8">
                  <button
                    onClick={() => setShowLeaveModal(false)}
                    className="px-6 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleLeaveWorkspace}
                    className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    Keluar Sekarang
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

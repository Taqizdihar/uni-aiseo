import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, Settings, Database, Server, Trash2, Ban, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../utils/api';

interface Metrics {
  totalWorkspaces: number;
  totalUsers: number;
  totalApiCredits: number;
  activeSessions: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  workspace_name: string | null;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const fetchData = async () => {
    try {
      const [metricsRes, usersRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/users')
      ]);
      setMetrics(metricsRes.data);
      setUsers(usersRes.data);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      notify('Gagal memuat data dashboard admin', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'Aktif' ? 'Ditangguhkan' : 'Aktif';
    try {
      await api.put(`/admin/users/${user.id}/status`, { status: newStatus });
      notify(`Status pengguna berhasil diubah menjadi ${newStatus}`);
      fetchData(); // Refresh list
    } catch (err: any) {
      console.error('Error toggling status:', err);
      notify(err.response?.data?.message || 'Gagal mengubah status', 'error');
    }
  };

  const confirmDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/users/${selectedUser.id}`);
      notify('Pengguna berhasil dihapus permanen');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      notify(err.response?.data?.message || 'Gagal menghapus pengguna', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-yellow" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full overflow-y-auto pb-8 pr-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold mb-2 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-brand-yellow" />
            Super Admin Dashboard
          </h2>
          <p className="text-[var(--text-secondary)]">Pantau aktivitas platform dan kelola pengguna secara global.</p>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">Total Workspaces</p>
          <h3 className="text-3xl font-display font-bold mt-1">{metrics?.totalWorkspaces || 0}</h3>
        </div>
        
        <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">Total Pengguna Aktif</p>
          <h3 className="text-3xl font-display font-bold mt-1">{metrics?.totalUsers || 0}</h3>
        </div>

        <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">Kredit AI Terpakai</p>
          <h3 className="text-3xl font-display font-bold mt-1">{metrics?.totalApiCredits || 0}</h3>
        </div>

        <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-brand-yellow/10 rounded-xl flex items-center justify-center">
              <Server className="w-6 h-6 text-brand-yellow" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">Sesi Aktif (24j)</p>
          <h3 className="text-3xl font-display font-bold mt-1">{metrics?.activeSessions || 0}</h3>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-secondary)]/30">
          <h3 className="text-lg font-bold flex items-center">
            <Settings className="w-5 h-5 mr-2 text-[var(--text-secondary)]" />
            Manajemen Pengguna Global
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)]">
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Pengguna</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Role</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Workspace</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Terdaftar</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-secondary)] font-medium">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[var(--text-primary)]">{user.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{user.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${
                        user.role === 'Administrator' ? 'bg-brand-yellow text-brand-black' :
                        user.role === 'SEO Manager' ? 'bg-blue-500/10 text-blue-500' :
                        user.role === 'SEO Analyst' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {user.workspace_name || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        user.status === 'Aktif' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {user.role !== 'Administrator' && (
                          <>
                            <button 
                              onClick={() => handleToggleStatus(user)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.status === 'Aktif' 
                                  ? 'text-orange-500 hover:bg-orange-500/10' 
                                  : 'text-green-500 hover:bg-green-500/10'
                              }`}
                              title={user.status === 'Aktif' ? "Tangguhkan Pengguna" : "Aktifkan Pengguna"}
                            >
                              {user.status === 'Aktif' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => confirmDelete(user)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Hapus Permanen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedUser && (
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
              <h3 className="text-xl font-bold mb-2">Hapus Pengguna ini?</h3>
              <p className="text-[var(--text-secondary)] mb-6">
                Tindakan ini tidak dapat dibatalkan. Seluruh data terkait pengguna "{selectedUser.name}" mungkin akan ikut terhapus.
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

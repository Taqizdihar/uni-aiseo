import React, { useState, useEffect } from 'react';
import { Database, Search, Ban, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../utils/api';

interface Workspace {
  id: number;
  name: string;
  status: string;
  api_credits_used: number;
  created_at: string;
  total_members: number;
  owner_name: string | null;
}

export default function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/admin/workspaces');
      setWorkspaces(res.data);
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      notify('Gagal memuat data workspace', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleToggleStatus = async (workspace: Workspace) => {
    const newStatus = workspace.status === 'Aktif' ? 'Ditangguhkan' : 'Aktif';
    try {
      await api.put(`/admin/workspaces/${workspace.id}/status`, { status: newStatus });
      notify(`Status workspace berhasil diubah menjadi ${newStatus}`);
      fetchWorkspaces();
    } catch (err: any) {
      console.error('Error toggling workspace status:', err);
      notify(err.response?.data?.message || 'Gagal mengubah status', 'error');
    }
  };

  const filteredWorkspaces = workspaces.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.owner_name && w.owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-display font-bold mb-2 flex items-center">
            <Database className="w-6 h-6 mr-2 text-brand-yellow" />
            Kelola Workspace
          </h2>
          <p className="text-[var(--text-secondary)]">Pantau penggunaan dan kelola status workspace pengguna.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
          <input
            type="text"
            placeholder="Cari workspace..."
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
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Nama Workspace</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">SEO Manager (Owner)</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-center">Total Member</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-center">Kredit Terpakai</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Dibuat Pada</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredWorkspaces.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-secondary)] font-medium">
                    Belum ada workspace yang terdaftar di platform.
                  </td>
                </tr>
              ) : (
                filteredWorkspaces.map((workspace) => (
                  <tr key={workspace.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[var(--text-primary)]">{workspace.name}</p>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {workspace.owner_name || 'Tidak diketahui'}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {workspace.total_members}
                    </td>
                    <td className="p-4 text-center font-bold text-brand-yellow">
                      {workspace.api_credits_used}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        workspace.status === 'Aktif' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {workspace.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {formatDate(workspace.created_at)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(workspace)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                          workspace.status === 'Aktif'
                            ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white'
                            : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'
                        }`}
                      >
                        {workspace.status === 'Aktif' ? (
                          <>
                            <Ban className="w-4 h-4 mr-1.5" />
                            Tangguhkan
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Aktifkan
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

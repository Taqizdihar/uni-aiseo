import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Search, Filter, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface AuditLog {
  id: number;
  user_email: string | null;
  action: string;
  ip_address: string | null;
  created_at: string;
}

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async (search: string = '') => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/audit-logs?search=${search}`);
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-display font-bold mb-2 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-brand-yellow" />
            Jejak Audit Sistem
          </h2>
          <p className="text-[var(--text-secondary)]">Rekaman log aktivitas untuk seluruh pengguna di dalam platform.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
            <input
              type="text"
              placeholder="Cari email atau tindakan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:border-brand-yellow transition-colors"
            />
          </div>
          <button className="p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-brand-yellow transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)]">
                <th className="p-4 font-semibold text-[var(--text-secondary)] w-1/4">Timestamp</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] w-1/4">Pengguna (Email)</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] w-1/3">Tindakan</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] w-1/6">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-yellow mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[var(--text-secondary)] font-medium">
                    Belum ada aktivitas sistem yang tercatat.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                    <td className="p-4 font-mono text-sm text-[var(--text-secondary)]">
                      {formatTimestamp(log.created_at)}
                    </td>
                    <td className="p-4 font-medium text-[var(--text-primary)]">
                      {log.user_email || <span className="text-[var(--text-secondary)] italic">Sistem/Dihapus</span>}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm text-[var(--text-secondary)]">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

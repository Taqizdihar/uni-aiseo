import React, { useState, useEffect } from 'react';
import { Activity, Search, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface AuditLog {
  id: number;
  message: string;
  user_name: string | null;
  user_role: string | null;
  created_at: string;
}

export default function WorkspaceAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/notifications');
        setLogs(res.data);
      } catch (err) {
        console.error('Error fetching workspace audit log:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const formatTimestamp = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
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
      <div className="shrink-0">
        <h2 className="text-2xl font-display font-bold mb-2 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-brand-yellow" />
          Log Audit Workspace
        </h2>
        <p className="text-[var(--text-secondary)]">
          Rekaman aktivitas terbaru di dalam workspace Anda.
        </p>
      </div>

      <div className="flex-1 min-h-0 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)]">
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Timestamp</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Pengguna</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Role</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[var(--text-secondary)] font-medium">
                    Belum ada aktivitas tercatat di workspace ini.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                    <td className="p-4 font-mono text-sm text-[var(--text-secondary)] whitespace-nowrap">
                      {formatTimestamp(log.created_at)}
                    </td>
                    <td className="p-4 font-medium text-[var(--text-primary)]">
                      {log.user_name || 'Sistem'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${
                        log.user_role === 'SEO Manager' ? 'bg-blue-500/10 text-blue-500' :
                        log.user_role === 'SEO Analyst' ? 'bg-purple-500/10 text-purple-500' :
                        log.user_role === 'Content Writer' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                      }`}>
                        {log.user_role || 'Sistem'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        {log.message}
                      </span>
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

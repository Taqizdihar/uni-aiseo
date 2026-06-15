import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, List, ShieldAlert, Activity } from 'lucide-react';

interface Log {
  id: string;
  timestamp: string;
  email: string;
  action: string;
  ip: string;
}

const initialLogs: Log[] = [
  { id: '1', timestamp: '2026-06-14 14:30', email: 'siti@example.com', action: 'Log Masuk (Login)', ip: '192.168.1.10' },
  { id: '2', timestamp: '2026-06-14 14:25', email: 'budi@example.com', action: 'Proyek "Landing Page SEO" Dihapus', ip: '192.168.1.15' },
  { id: '3', timestamp: '2026-06-14 14:20', email: 'unknown', action: 'Percobaan Login Gagal', ip: '198.51.100.2' },
  { id: '4', timestamp: '2026-06-14 14:05', email: 'admin@gmail.com', action: 'Pengguna andi@example.com Ditangguhkan', ip: '203.0.113.5' },
  { id: '5', timestamp: '2026-06-14 12:44', email: 'siti@example.com', action: 'Dihasilkan AI Keywords untuk "SEO"', ip: '192.168.1.10' },
  { id: '6', timestamp: '2026-06-14 09:12', email: 'admin@gmail.com', action: 'Memperbarui FAQ #3', ip: '203.0.113.5' },
];

export default function AuditTrail() {
  const [logs] = useState<Log[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log => 
    log.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold mb-2 flex items-center">
            <List className="w-6 h-6 mr-2 text-brand-yellow" />
            Jejak Audit
          </h2>
          <p className="text-[var(--text-secondary)]">Pantau aktivitas sistem dan peristiwa keamanan di seluruh platform.</p>
        </div>
        <div className="relative w-full sm:w-72 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2.5 text-sm border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
            placeholder="Cari log berdasarkan email atau aksi..."
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Waktu (Timestamp)</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Email Pengguna</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Aksi yang Diambil</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">Alamat IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]/20 transition-colors">
                    <td className="py-4 px-6 text-sm whitespace-nowrap text-[var(--text-secondary)]">
                      {log.timestamp}
                    </td>
                    <td className="py-4 px-6 font-medium">
                      {log.email === 'unknown' ? <span className="text-red-500 flex items-center"><ShieldAlert className="w-4 h-4 mr-1"/> Tidak Diautentikasi</span> : log.email}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex items-center">
                        {log.action.includes('Gagal') ? (
                          <ShieldAlert className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                        ) : (
                          <Activity className="w-4 h-4 mr-2 text-brand-yellow flex-shrink-0" />
                        )}
                        {log.action}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-[var(--text-secondary)] font-mono text-xs">
                      {log.ip}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[var(--text-secondary)]">
                    Tidak ada log aktivitas yang ditemukan yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Search,
  MoreVertical,
  ShieldAlert,
  Key,
  Users,
} from "lucide-react";

interface WorkspaceData {
  id: string;
  name: string;
  ownerName: string;
  totalMembers: number;
  apiCreditUsed: number;
  apiCreditLimit: number;
  status: "aktif" | "ditangguhkan";
}

const initialWorkspaces: WorkspaceData[] = [
  {
    id: "ws-1",
    name: "UMKM Maju Jaya",
    ownerName: "M. Taqi",
    totalMembers: 4,
    apiCreditUsed: 1250,
    apiCreditLimit: 5000,
    status: "aktif",
  },
  {
    id: "ws-2",
    name: "Digital Agency X",
    ownerName: "Sarah Jenkins",
    totalMembers: 12,
    apiCreditUsed: 8400,
    apiCreditLimit: 10000,
    status: "aktif",
  },
  {
    id: "ws-3",
    name: "Tech Startup Alpha",
    ownerName: "Budi Santoso",
    totalMembers: 6,
    apiCreditUsed: 5200,
    apiCreditLimit: 5000,
    status: "ditangguhkan",
  },
];

export default function WorkspaceManager() {
  const [workspaces, setWorkspaces] =
    useState<WorkspaceData[]>(initialWorkspaces);
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const filtered = workspaces.filter(
    (ws) =>
      ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.ownerName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "aktif" ? "ditangguhkan" : "aktif";
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === id ? { ...ws, status: newStatus } : ws)),
    );
    setToastMessage(
      `Workspace berhasil ${newStatus === "aktif" ? "diaktifkan" : "ditangguhkan"}.`,
    );
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold mb-2 flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-brand-yellow" />
            Kelola Workspace
          </h2>
          <p className="text-[var(--text-secondary)]">
            Manajemen global untuk seluruh entitas organisasi dalam platform.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari workspace..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
          />
          <Search className="w-5 h-5 text-[var(--text-secondary)] absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">
                  Nama Workspace
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">
                  Pemilik (SEO Manager)
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">
                  Total Anggota
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)] text-center">
                  Kredit API Digunakan
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)] text-center">
                  Status
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)] text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ws) => (
                <tr
                  key={ws.id}
                  className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="font-bold text-[var(--text-primary)]">
                      {ws.name}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center text-sm font-medium">
                      <div className="w-6 h-6 rounded-full bg-brand-yellow text-brand-black flex items-center justify-center text-xs mr-2 font-bold">
                        {ws.ownerName.charAt(0)}
                      </div>
                      {ws.ownerName}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center text-sm text-[var(--text-secondary)]">
                      <Users className="w-4 h-4 mr-2" />
                      {ws.totalMembers}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-sm font-bold ${ws.apiCreditUsed > ws.apiCreditLimit * 0.8 ? "text-red-500" : "text-green-500"}`}
                      >
                        {ws.apiCreditUsed.toLocaleString()} /{" "}
                        {ws.apiCreditLimit.toLocaleString()}
                      </span>
                      <div className="w-24 bg-[var(--bg-secondary)] rounded-full h-1.5 mt-2 border border-[var(--border-color)]">
                        <div
                          className={`h-full rounded-full ${ws.apiCreditUsed > ws.apiCreditLimit * 0.8 ? "bg-red-500" : "bg-green-500"}`}
                          style={{
                            width: `${Math.min((ws.apiCreditUsed / ws.apiCreditLimit) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${ws.status === "aktif" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}
                    >
                      {ws.status === "aktif" ? "Aktif" : "Ditangguhkan"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => toggleStatus(ws.id, ws.status)}
                      className={`p-2 rounded-lg transition-colors border ${ws.status === "aktif" ? "text-red-500 hover:bg-red-500/10 border-transparent hover:border-red-500/20" : "text-green-500 hover:bg-green-500/10 border-transparent hover:border-green-500/20"}`}
                      title={
                        ws.status === "aktif"
                          ? "Tangguhkan Workspace"
                          : "Aktifkan Workspace"
                      }
                    >
                      <ShieldAlert className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-[var(--text-secondary)]"
                  >
                    Tidak ada workspace ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2" />
              <span className="font-medium text-sm">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

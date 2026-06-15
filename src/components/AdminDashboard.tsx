import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Users,
  Zap,
  Activity,
  Ban,
  Trash2,
  ShieldCheck,
  Building2,
} from "lucide-react";

interface MockRegisteredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  workspace: string;
  date: string;
  status: "Active" | "Suspended";
}

const initialUsers: MockRegisteredUser[] = [
  {
    id: "1",
    name: "Siti Rahmawati",
    email: "siti@example.com",
    role: "SEO Analyst",
    workspace: "UMKM Maju Jaya",
    date: "2026-06-10",
    status: "Active",
  },
  {
    id: "2",
    name: "Budi Santoso",
    email: "budi@example.com",
    role: "SEO Analyst",
    workspace: "Digital Agency X",
    date: "2026-06-09",
    status: "Active",
  },
  {
    id: "3",
    name: "Andi Pratama",
    email: "andi@example.com",
    role: "Content Writer",
    workspace: "Tech Startup Alpha",
    date: "2026-06-08",
    status: "Suspended",
  },
  {
    id: "4",
    name: "Admin Sistem",
    email: "admin@gmail.com",
    role: "Administrator",
    workspace: "System",
    date: "2026-06-01",
    status: "Active",
  },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState<MockRegisteredUser[]>(initialUsers);

  const toggleStatus = (id: string) => {
    setUsers(
      users.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            status: u.status === "Active" ? "Suspended" : "Active",
          };
        }
        return u;
      }),
    );
  };

  const deleteUser = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const stats = [
    {
      title: "Total Workspace Aktif",
      value: "24",
      icon: <Building2 className="w-5 h-5 text-[var(--text-secondary)]" />,
    },
    {
      title: "Total Pengguna Terdaftar",
      value: users.length.toString(),
      icon: <Users className="w-5 h-5 text-[var(--text-secondary)]" />,
    },
    {
      title: "Total Kredit API Digunakan",
      value: "1,245,000",
      icon: <Zap className="w-5 h-5 text-[var(--text-secondary)]" />,
    },
    {
      title: "Sesi Aktif",
      value: "42",
      icon: <Activity className="w-5 h-5 text-[var(--text-secondary)]" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold mb-2 flex items-center">
          <ShieldCheck className="w-6 h-6 mr-2 text-brand-yellow" />
          Dashboard Administrator
        </h2>
        <p className="text-[var(--text-secondary)]">
          Kelola pengaturan sistem, pengguna, dan awasi penggunaan platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[var(--bg-secondary)] rounded-xl group-hover:bg-brand-yellow/10 transition-colors">
                {stat.icon}
              </div>
            </div>
            <h3 className="text-3xl font-display font-bold mb-1">
              {stat.value}
            </h3>
            <div className="flex justify-between items-end">
              <p className="text-[var(--text-secondary)] font-medium">
                {stat.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
          <h3 className="text-lg font-bold">Manajemen Pengguna</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">
                  Nama
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">
                  Email
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">
                  Role
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">
                  Workspace
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">
                  Tanggal Registrasi
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)]">
                  Status
                </th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--text-secondary)] text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]/20 transition-colors"
                >
                  <td className="py-4 px-6 font-medium">{user.name}</td>
                  <td className="py-4 px-6 text-[var(--text-secondary)]">
                    {user.email}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <span
                      className={`px-2 py-1 rounded bg-[var(--bg-secondary)] text-xs font-bold border border-[var(--border-color)] ${user.role === "Administrator" ? "text-brand-yellow" : ""}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[var(--text-primary)] text-sm">
                    {user.workspace}
                  </td>
                  <td className="py-4 px-6 text-sm text-[var(--text-secondary)]">
                    {user.date}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.status === "Active"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}
                    >
                      {user.status === "Active" ? "Aktif" : "Ditangguhkan"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className="p-2 inline-flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-brand-yellow hover:bg-[var(--bg-secondary)] transition-colors"
                      title={
                        user.status === "Active"
                          ? "Tangguhkan Pengguna"
                          : "Aktifkan Pengguna"
                      }
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-2 inline-flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--bg-secondary)] transition-colors"
                      title="Hapus Pengguna"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

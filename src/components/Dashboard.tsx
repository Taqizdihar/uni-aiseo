import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Activity,
  Zap,
  Target,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
} from "lucide-react";
import api from '../utils/api';

interface OptData {
  name: string;
  value: number;
  color: string;
}

interface PerfData {
  day: string;
  score: number;
}

interface KwData {
  week: string;
  generated: number;
}

interface DashboardMetrics {
  totalProjects: number;
  totalTeam: number;
  avgSeoScore: number;
  optimizationData: OptData[];
  performanceData: PerfData[];
  keywordData: KwData[];
}

export default function Dashboard({
  mockUser,
}: {
  mockUser: {
    name: string;
    email: string;
    role: string;
    workspaceName?: string;
  } | null;
}) {
  const role = mockUser?.role || "manager";
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 0,
    totalTeam: 0,
    avgSeoScore: 0,
    optimizationData: [
      { name: "Dioptimalkan", value: 0, color: "#fad02c" },
      { name: "Perlu Perbaikan", value: 0, color: "#e0b820" },
      { name: "Kritis", value: 0, color: "#ff4444" },
    ],
    performanceData: [
      { day: "W1", score: 0 },
      { day: "W2", score: 0 },
      { day: "W3", score: 0 },
      { day: "W4", score: 0 },
    ],
    keywordData: [
      { week: "Minggu 1", generated: 0 },
      { week: "Minggu 2", generated: 0 },
      { week: "Minggu 3", generated: 0 },
      { week: "Minggu 4", generated: 0 },
    ],
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/workspace/dashboard');
        setMetrics(res.data);
      } catch (error) {
        console.error('Error fetching dashboard metrics', error);
      }
      try {
        const res = await api.get('/notifications');
        setRecentActivity(res.data);
      } catch (error) {
        console.error('Error fetching recent activity', error);
      }
    };
    fetchDashboard();
  }, []);

  const cards =
    {
      manager: [
        {
          title: "Total Proyek Tim",
          value: metrics.totalProjects.toString(),
          icon: <Activity className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "Total tugas",
        },
        {
          title: "Total Anggota Tim",
          value: metrics.totalTeam.toString(),
          icon: <Zap className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "Aktif",
        },
        {
          title: "Rata-rata Skor SEO Tim",
          value: `${metrics.avgSeoScore}/100`,
          icon: <Target className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "Skor konten gabungan",
        },
      ],
      analyst: [
        {
          title: "Keyword Diteliti Minggu Ini",
          value: "1,245",
          icon: <Zap className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "+12% dari minggu lalu",
        },
        {
          title: "Gambar Dianalisis",
          value: "38",
          icon: <Activity className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "2 tertunda",
        },
        {
          title: "Tingkat Penyelesaian Tugas",
          value: "92%",
          icon: <Target className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "Sesuai target",
        },
      ],
      writer: [
        {
          title: "Artikel Menunggu Optimasi",
          value: "4",
          icon: (
            <CircleDashed className="w-5 h-5 text-[var(--text-secondary)]" />
          ),
          change: "Jatuh tempo minggu ini",
        },
        {
          title: "Rata-rata Skor SEO Konten",
          value: "88/100",
          icon: <Target className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "+2.1% peningkatan",
        },
        {
          title: "Kata Ditulis",
          value: "12rb",
          icon: <Activity className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "Bulan ini",
        },
      ],
    }[role] ||
    Object.values({
      manager: [
        {
          title: "Total Proyek Tim",
          value: "0",
          icon: <Activity className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "Belum ada proyek",
        },
        {
          title: "Kredit AI Tim Digunakan",
          value: "0",
          icon: <Zap className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "0% dari batas",
        },
        {
          title: "Rata-rata Skor SEO Tim",
          value: "0/100",
          icon: <Target className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "Belum ada konten",
        },
      ],
    })[0];


  const assignedTasks = {
    analyst: [
      { id: 1, title: "Keyword Promo Musim Panas", status: "In Progress" },
      { id: 2, title: "Desain Ulang Hero Beranda", status: "To Do" },
    ],
    writer: [
      { id: 1, title: "Konten Promo Musim Panas", status: "To Do" },
      { id: 2, title: "Penyempurnaan Q3 Meta Tags", status: "In Progress" },
    ],
  };

  const tasksList = assignedTasks[role as keyof typeof assignedTasks];

  // Compute total for donut center
  const optTotal = metrics.optimizationData.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">
            Selamat Datang Kembali, {mockUser?.name || "User"}!
          </h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Workspace:{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {mockUser?.workspaceName || "Default Workspace"}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[var(--bg-secondary)] rounded-xl group-hover:bg-brand-yellow/10 transition-colors">
                {card.icon}
              </div>
            </div>
            <h3 className="text-3xl font-display font-bold mb-1">
              {card.value}
            </h3>
            <div className="flex justify-between items-end">
              <p className="text-[var(--text-secondary)] font-medium">
                {card.title}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                {card.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm lg:col-span-2"
        >
          <h3 className="text-lg font-semibold mb-6">
            Tren Kinerja Keseluruhan SEO (30 Hari)
          </h3>
          <div className="h-[300px] w-full">
            {metrics.totalProjects === 0 ? (
              <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-center px-4">
                Belum ada data analitik. Mulai buat tugas baru untuk melihat tren.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.performanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "var(--text-primary)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#fad02c"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#fad02c", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#e0b820" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Pie Chart / Quick Tasks */}
        {role === "manager" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-6">
              Status Optimasi Konten
            </h3>
            <div className="h-[300px] w-full flex flex-col pt-4">
              <div className="flex-1 relative w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.optimizationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {metrics.optimizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-color)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold">{optTotal > 0 ? '100%' : '0%'}</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    Dianalisis
                  </span>
                </div>
              </div>
              <div className="w-full space-y-2 mt-auto">
                {metrics.optimizationData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[var(--text-secondary)]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm flex flex-col"
          >
            <h3 className="text-lg font-semibold mb-6">
              {role === "analyst"
                ? "Tugas Penelitian Saya"
                : "Tugas Menulis Saya"}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3">
              {tasksList?.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {task.status}
                    </p>
                  </div>
                  {task.status === "In Progress" ? (
                    <CircleDashed className="text-brand-yellow w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="text-gray-400 w-5 h-5" />
                  )}
                </div>
              ))}
              {tasksList?.length === 0 && (
                <p className="text-[var(--text-secondary)] text-sm">
                  Tidak ada tugas yang tertunda.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Bar Chart / Activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm ${role === "manager" ? "lg:col-span-2" : "lg:col-span-3"}`}
        >
          <h3 className="text-lg font-semibold mb-6">
            Keywords Dihasilkan per Minggu
          </h3>
          <div className="h-[300px] w-full">
            {metrics.totalProjects === 0 ? (
              <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-center px-4">
                Belum ada data analitik. Mulai buat tugas baru untuk melihat tren.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.keywordData}
                  margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--bg-secondary)" }}
                    contentStyle={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                  <Bar
                    dataKey="generated"
                    name="Dihasilkan"
                    fill="#fad02c"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Recent Team Activity - only for manager */}
        {role === "manager" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm lg:col-span-1 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                Aktivitas Tim Terbaru
              </h3>
              <Link
                to="/workspace/audit-log"
                className="text-xs font-semibold text-brand-yellow hover:underline flex items-center gap-1"
              >
                Log Audit Workspace
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {recentActivity.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
                  Belum ada aktivitas tim.
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 border-b border-[var(--border-color)] pb-3 last:border-0 last:pb-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-yellow/20 flex items-center justify-center text-brand-yellow font-bold shrink-0 text-sm">
                      {activity.user_name ? activity.user_name.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight mb-1 text-[var(--text-primary)]">
                        <span className="font-bold">{activity.user_name || "Sistem"}</span>{" "}
                        {activity.message}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

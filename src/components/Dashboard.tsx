import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
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
} from "lucide-react";
import api from '../utils/api';

const performanceData = [
  { day: "1", score: 45 },
  { day: "5", score: 52 },
  { day: "10", score: 48 },
  { day: "15", score: 61 },
  { day: "20", score: 59 },
  { day: "25", score: 75 },
  { day: "30", score: 82 },
];

const keywordData = [
  { week: "Minggu 1", analyzed: 400, generated: 240 },
  { week: "Minggu 2", analyzed: 300, generated: 139 },
  { week: "Minggu 3", analyzed: 200, generated: 980 },
  { week: "Minggu 4", analyzed: 278, generated: 390 },
];

const optimizationData = [
  { name: "Dioptimalkan", value: 65, color: "#fad02c" },
  { name: "Perlu Perbaikan", value: 25, color: "#e0b820" },
  { name: "Kritis", value: 10, color: "#ff4444" },
];

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
  const [metrics, setMetrics] = useState({ totalTasks: 0, totalTeamMembers: 0 });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/workspace/metrics');
        setMetrics(res.data);
      } catch (error) {
        console.error('Error fetching metrics', error);
      }
    };
    fetchMetrics();
  }, []);

  const cards =
    {
      manager: [
        {
          title: "Total Proyek Tim",
          value: metrics.totalTasks.toString(),
          icon: <Activity className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "+2 bulan ini",
        },
        {
          title: "Total Anggota Tim",
          value: metrics.totalTeamMembers.toString(),
          icon: <Zap className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "Aktif",
        },
        {
          title: "Rata-rata Skor SEO Tim",
          value: "82/100",
          icon: <Target className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "+5.4% peningkatan",
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
          value: "12",
          icon: <Activity className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "+2 bulan ini",
        },
        {
          title: "Kredit AI Tim Digunakan",
          value: "8,459",
          icon: <Zap className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "75% dari batas",
        },
        {
          title: "Rata-rata Skor SEO Tim",
          value: "82/100",
          icon: <Target className="w-5 h-5 text-[var(--text-secondary)]" />,
          change: "+5.4% peningkatan",
        },
      ],
    })[0];

  const recentActivity = [
    {
      id: 1,
      user: "Siti (SEO Analyst)",
      action: "menyimpan keyword ke tugas 'Promo Musim Panas'",
      time: "2 jam yang lalu",
    },
    {
      id: 2,
      user: "Budi (Content Writer)",
      action: "mengirimkan artikel untuk persetujuan",
      time: "4 jam yang lalu",
    },
    {
      id: 3,
      user: "Andi (SEO Manager)",
      action: "membuat tugas baru 'Q3 Meta Tags'",
      time: "1 hari yang lalu",
    },
    {
      id: 4,
      user: "Siti (SEO Analyst)",
      action: "menyelesaikan tugas 'Desain Ulang Hero Beranda'",
      time: "2 hari yang lalu",
    },
  ];

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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
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
                      data={optimizationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {optimizationData.map((entry, index) => (
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
                  <span className="text-3xl font-bold">100%</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    Dianalisis
                  </span>
                </div>
              </div>
              <div className="w-full space-y-2 mt-auto">
                {optimizationData.map((item, idx) => (
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
            Keywords Dianalisis vs Dihasilkan
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={keywordData}
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
                  dataKey="analyzed"
                  name="Dianalisis"
                  fill="#fad02c"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
                <Bar
                  dataKey="generated"
                  name="Dihasilkan"
                  fill="#222222"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                  className="dark:fill-[#555]"
                />
              </BarChart>
            </ResponsiveContainer>
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
            <h3 className="text-lg font-semibold mb-6">
              Aktivitas Tim Terbaru
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 border-b border-[var(--border-color)] pb-3 last:border-0 last:pb-0"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-yellow/20 flex items-center justify-center text-brand-yellow font-bold shrink-0 text-sm">
                    {activity.user.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight mb-1 text-[var(--text-primary)]">
                      <span className="font-bold">{activity.user}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

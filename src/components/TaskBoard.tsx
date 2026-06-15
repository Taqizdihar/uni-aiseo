import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Kanban,
  Plus,
  User,
  Clock,
  FileText,
  CheckCircle2,
  Lock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Trash2,
  X,
  CalendarDays,
} from "lucide-react";
import api from '../utils/api';

interface TaskData {
  id: number;
  title: string;
  description: string;
  status: "To Do" | "In Progress" | "Waiting Approval" | "Done";
  analyst_id: number | null;
  writer_id: number | null;
  analyst_name: string | null;
  writer_name: string | null;
  created_at: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
}

const COLUMNS: Array<"To Do" | "In Progress" | "Waiting Approval" | "Done"> = [
  "To Do",
  "In Progress",
  "Waiting Approval",
  "Done",
];

export default function TaskBoard({
  mockUser,
}: {
  mockUser?: { role: string; name: string } | null;
}) {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal & Drag-and-Drop state
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [draggingOverColumn, setDraggingOverColumn] = useState<string | null>(null);

  // User context
  const role = mockUser?.role || "manager";

  // Form State
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [analystId, setAnalystId] = useState<string>("");
  const [writerId, setWriterId] = useState<string>("");

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch team members for dropdowns
  const fetchTeam = async () => {
    try {
      const response = await api.get('/users/team');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (role === "manager") {
      fetchTeam();
    }
  }, []);

  const analysts = teamMembers.filter(m => m.role === 'SEO Analyst');
  const writers = teamMembers.filter(m => m.role === 'Content Writer');

  const showNotification = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Do":
        return "border-blue-500 text-blue-500 bg-blue-500/10";
      case "In Progress":
        return "border-brand-yellow text-brand-yellow bg-brand-yellow/10";
      case "Waiting Approval":
        return "border-purple-500 text-purple-500 bg-purple-500/10";
      case "Done":
        return "border-green-500 text-green-500 bg-green-500/10";
      default:
        return "border-[var(--border-color)] text-[var(--text-secondary)]";
    }
  };

  const getColumnLabel = (column: string) => {
    switch (column) {
      case "Waiting Approval": return "Menunggu Persetujuan";
      case "To Do": return "To Do";
      case "In Progress": return "In Progress";
      case "Done": return "Done";
      default: return column;
    }
  };

  // ---- Drag-and-Drop ----
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    setDraggingOverColumn(column);
  };

  const handleDragLeave = () => {
    setDraggingOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    setDraggingOverColumn(null);
    if (!draggedTaskId) return;

    const task = tasks.find(t => t.id === draggedTaskId);
    if (!task || task.status === targetColumn) {
      setDraggedTaskId(null);
      return;
    }

    // Optimistic UI update
    const originalTasks = [...tasks];
    setTasks(prev =>
      prev.map(t =>
        t.id === draggedTaskId ? { ...t, status: targetColumn as TaskData["status"] } : t
      )
    );

    try {
      await api.put(`/tasks/${draggedTaskId}/status`, { status: targetColumn });
    } catch (error: any) {
      // Revert on failure
      setTasks(originalTasks);
      const errorMsg = error.response?.data?.message || "Anda tidak memiliki izin untuk memindahkan tugas ini.";
      showNotification(errorMsg, "error");
    }

    setDraggedTaskId(null);
  };

  const handleMoveTask = (
    e: React.MouseEvent,
    taskId: number,
    direction: "up" | "down",
  ) => {
    e.stopPropagation();
    const colTasks = tasks.filter(t => t.status === tasks.find(x => x.id === taskId)?.status);
    const taskIdx = colTasks.findIndex(t => t.id === taskId);
    if (taskIdx === -1) return;

    const targetIdx = direction === "up" ? taskIdx - 1 : taskIdx + 1;
    if (targetIdx < 0 || targetIdx >= colTasks.length) return;

    // Swap within full tasks array
    const fullIdxA = tasks.findIndex(t => t.id === colTasks[taskIdx].id);
    const fullIdxB = tasks.findIndex(t => t.id === colTasks[targetIdx].id);
    const newTasks = [...tasks];
    const temp = newTasks[fullIdxA];
    newTasks[fullIdxA] = newTasks[fullIdxB];
    newTasks[fullIdxB] = temp;
    setTasks(newTasks);
  };

  // ---- Create Task ----
  const openCreateModal = () => {
    setTaskName("");
    setTaskDesc("");
    setAnalystId("");
    setWriterId("");
    setIsModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/tasks', {
        title: taskName,
        description: taskDesc,
        analyst_id: analystId ? parseInt(analystId) : null,
        writer_id: writerId ? parseInt(writerId) : null,
      });
      setTasks(prev => [response.data, ...prev]);
      setIsModalOpen(false);
      setTaskName("");
      setTaskDesc("");
      setAnalystId("");
      setWriterId("");
      showNotification("Tugas berhasil dibuat!");
    } catch (error) {
      console.error('Error creating task:', error);
      showNotification("Gagal membuat tugas.", "error");
    }
  };

  // ---- Delete Task ----
  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setIsDetailModalOpen(false);
      setSelectedTask(null);
      showNotification("Tugas berhasil dihapus!");
    } catch (error) {
      console.error('Error deleting task:', error);
      showNotification("Gagal menghapus tugas.", "error");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-display font-bold mb-2 flex items-center">
            <Kanban className="w-6 h-6 mr-2 text-brand-yellow" />
            Workspace Task Board
          </h2>
          <p className="text-[var(--text-secondary)]">
            Kelola kampanye alur kerja dan lacak kemajuan tim.
          </p>
        </div>
        {role === "manager" && (
          <button
            onClick={openCreateModal}
            className="flex items-center px-5 py-2.5 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Buat Tugas Baru
          </button>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter(t => t.status === column);
            const isRestrictedDrop = column === "Waiting Approval" || column === "Done";

            return (
              <div
                key={column}
                onDragOver={(e) => handleDragOver(e, column)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column)}
                className={`w-80 flex flex-col rounded-2xl border overflow-hidden transition-colors ${
                  draggingOverColumn === column && !isRestrictedDrop
                    ? "bg-[var(--bg-secondary)] border-brand-yellow ring-2 ring-brand-yellow/30"
                    : "bg-[var(--bg-secondary)]/30 border-[var(--border-color)]"
                }`}
              >
                <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-primary)]">
                  <div className="flex items-center gap-2 group">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(column).split(" ")[0].replace("border-", "bg-")}`}
                    />
                    <h3 className="font-bold cursor-default">
                      {getColumnLabel(column)}
                    </h3>
                    {isRestrictedDrop && (
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-[var(--text-secondary)] ml-1 cursor-help" />
                        <div className="absolute top-6 left-0 w-48 p-2 bg-[var(--bg-primary)] text-xs text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                          Status diperbarui otomatis melalui sistem Validasi AI
                          dan Persetujuan Konten.
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold bg-[var(--bg-secondary)] text-[var(--text-secondary)] px-2 py-1 rounded-md">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  <AnimatePresence>
                    {columnTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layoutId={task.id.toString()}
                        draggable={role !== "writer"}
                        onDragStart={(e: any) => handleDragStart(e, task.id)}
                        onDragEnd={() => setDraggedTaskId(null)}
                        onClick={() => {
                          setSelectedTask(task);
                          setIsDetailModalOpen(true);
                        }}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`bg-[var(--bg-primary)] p-4 rounded-xl border shadow-sm transition-all group ${
                          draggedTaskId === task.id
                            ? "opacity-50 cursor-grabbing"
                            : role === "writer" ? "cursor-pointer" : "cursor-grab hover:scale-[1.02]"
                        } border-[var(--border-color)] hover:border-brand-yellow/50`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4
                            className="font-bold leading-tight transition-colors text-[var(--text-primary)] group-hover:text-brand-yellow pr-2"
                          >
                            {task.title}
                          </h4>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                          <div className="flex items-center space-x-2">
                            {column === "Done" ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : column === "Waiting Approval" ? (
                              <Clock className="w-4 h-4 text-purple-500" />
                            ) : (
                              <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                            )}
                            {role !== "writer" && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleMoveTask(e, task.id, "up")}
                                  className="p-1 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-brand-yellow rounded transition-colors"
                                  title="Pindah ke Atas"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleMoveTask(e, task.id, "down")}
                                  className="p-1 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-brand-yellow rounded transition-colors"
                                  title="Pindah ke Bawah"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-[var(--text-secondary)] truncate max-w-[140px]">
                            {task.analyst_name || task.writer_name
                              ? `${task.analyst_name || '-'} & ${task.writer_name || '-'}`
                              : 'Belum ditugaskan'}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {columnTasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-[var(--border-color)] rounded-xl flex items-center justify-center text-sm text-[var(--text-secondary)]">
                      {isLoading ? "Memuat..." : "Tidak ada tugas"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedTask && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsDetailModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--bg-primary)] p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-[var(--border-color)] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold font-display uppercase tracking-tight text-[var(--text-primary)] mb-2">
                    {selectedTask.title}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedTask.status)}`}
                    >
                      {getColumnLabel(selectedTask.status)}
                    </span>
                    {selectedTask.created_at && (
                      <span className="text-sm text-[var(--text-secondary)] flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        {formatDate(selectedTask.created_at)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Ringkasan Kampanye
                  </h4>
                  <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] leading-relaxed">
                    {selectedTask.description || "Tidak ada deskripsi."}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Anggota Ditugaskan
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-xl border border-[var(--border-color)]">
                      <p className="text-xs text-[var(--text-secondary)] mb-1">SEO Analyst</p>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-xs font-bold">
                          {selectedTask.analyst_name ? selectedTask.analyst_name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <span className="font-medium text-sm">{selectedTask.analyst_name || "Belum ditugaskan"}</span>
                      </div>
                    </div>
                    <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-xl border border-[var(--border-color)]">
                      <p className="text-xs text-[var(--text-secondary)] mb-1">Content Writer</p>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs font-bold">
                          {selectedTask.writer_name ? selectedTask.writer_name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <span className="font-medium text-sm">{selectedTask.writer_name || "Belum ditugaskan"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                {role === "manager" && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="flex items-center px-4 py-2.5 border border-red-500/30 text-red-500 font-semibold rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Tugas
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] font-semibold rounded-xl hover:bg-[var(--bg-primary)] transition-colors ml-auto"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[var(--bg-primary)] p-6 rounded-2xl shadow-xl w-full max-w-md border border-[var(--border-color)] max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold mb-4">
                Buat Tugas Baru
              </h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nama Tugas/Kampanye
                  </label>
                  <input
                    type="text"
                    required
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                    placeholder="e.g., Summer Promo SEO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ringkasan Kampanye
                  </label>
                  <textarea
                    required
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow h-24 resize-none"
                    placeholder="Deskripsi singkat..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tetapkan Analyst
                    </label>
                    <select
                      value={analystId}
                      onChange={(e) => setAnalystId(e.target.value)}
                      className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow appearance-none cursor-pointer"
                    >
                      <option value="">-- Pilih Analyst --</option>
                      {analysts.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tetapkan Writer
                    </label>
                    <select
                      value={writerId}
                      onChange={(e) => setWriterId(e.target.value)}
                      className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow appearance-none cursor-pointer"
                    >
                      <option value="">-- Pilih Writer --</option>
                      {writers.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 mt-6 border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover"
                  >
                    Buat Tugas
                  </button>
                </div>
              </form>
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
              toastType === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500/90 text-white border border-red-400"
            }`}
          >
            {toastType === "success" ? (
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

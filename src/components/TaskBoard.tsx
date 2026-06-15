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
  Edit2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import api from '../utils/api';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeImage?: string;
  status: "To Do" | "In Progress" | "Waiting Approval" | "Done";
  aiKeywords?: string[];
  aiScore?: number;
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks');
        setTasks(response.data.map((t: any) => ({
          id: t.id.toString(),
          title: t.title,
          description: t.description,
          assignee: `${t.analyst_name || 'Tidak Ada'} (SA) & ${t.writer_name || 'Tidak Ada'} (CW)`,
          status: t.status,
        })));
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  // Detail Modal & Drag-and-Drop state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggingOverColumn, setDraggingOverColumn] = useState<string | null>(
    null,
  );
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // User context
  const role = mockUser?.role || "manager";

  // Form State
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [analyst, setAnalyst] = useState("Siti (SA)");
  const [writer, setWriter] = useState("Budi (CW)");

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

  const getAssigneeColor = (assignee: string) => {
    if (assignee.includes("SA"))
      return "bg-blue-500/20 text-blue-500 border border-blue-500/30";
    if (assignee.includes("CW"))
      return "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30";
    if (assignee.includes("&"))
      return "bg-purple-500/20 text-purple-500 border border-purple-500/30";
    return "bg-[var(--bg-secondary)] border border-[var(--border-color)]";
  };

  const isAssignedToMe = (assignee: string) => {
    if (role === "analyst" && assignee.includes("SA")) return true;
    if (role === "writer" && assignee.includes("CW")) return true;
    return false;
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault(); // Necessary to allow dropping
    if (column === "To Do" || column === "In Progress") {
      setDraggingOverColumn(column);
    }
  };

  const handleDragLeave = () => {
    setDraggingOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, column: string) => {
    e.preventDefault();
    setDraggingOverColumn(null);
    if (!draggedTaskId) return;

    if (column === "To Do" || column === "In Progress" || column === "Done" || column === "Waiting Approval") {
      try {
        await api.put(`/tasks/${draggedTaskId}/status`, { status: column });
        setTasks((prev) =>
          prev.map((t) =>
            t.id === draggedTaskId
              ? { ...t, status: column as Task["status"] }
              : t,
          ),
        );
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
    setDraggedTaskId(null);
  };

  const handleMoveTask = (
    e: React.MouseEvent,
    taskId: string,
    direction: "up" | "down",
  ) => {
    e.stopPropagation();
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const currentTask = tasks[taskIndex];
    let targetIndex = -1;

    if (direction === "up") {
      for (let i = taskIndex - 1; i >= 0; i--) {
        if (tasks[i].status === currentTask.status) {
          targetIndex = i;
          break;
        }
      }
    } else {
      for (let i = taskIndex + 1; i < tasks.length; i++) {
        if (tasks[i].status === currentTask.status) {
          targetIndex = i;
          break;
        }
      }
    }

    if (targetIndex !== -1) {
      const newTasks = [...tasks];
      const temp = newTasks[taskIndex];
      newTasks[taskIndex] = newTasks[targetIndex];
      newTasks[targetIndex] = temp;
      setTasks(newTasks);
    }
  };

  const openCreateModal = () => {
    setEditingTaskId(null);
    setTaskName("");
    setTaskDesc("");
    setAnalyst("Siti (SA)");
    setWriter("Budi (CW)");
    setIsModalOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setIsDetailModalOpen(false);
    setEditingTaskId(task.id);
    setTaskName(task.title);
    setTaskDesc(task.description);

    const parts = task.assignee.split(" & ");
    if (parts.length === 2) {
      setAnalyst(parts[0]);
      setWriter(parts[1]);
    } else {
      setAnalyst(parts[0] || "Siti (SA)");
      setWriter("Budi (CW)");
    }

    setIsModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTaskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTaskId
            ? {
                ...t,
                title: taskName,
                description: taskDesc,
                assignee: `${analyst} & ${writer}`,
              }
            : t,
        ),
      );
      setEditingTaskId(null);
    } else {
      try {
        const response = await api.post('/tasks', {
          title: taskName,
          description: taskDesc,
          analyst_id: null,
          writer_id: null,
        });
        const t = response.data;
        const newTask: Task = {
          id: t.id.toString(),
          title: t.title,
          description: t.description,
          assignee: `${t.analyst_name || 'Tidak Ada'} (SA) & ${t.writer_name || 'Tidak Ada'} (CW)`,
          status: t.status,
        };
        setTasks([newTask, ...tasks]);
      } catch (error) {
        console.error('Error creating task:', error);
      }
    }
    setIsModalOpen(false);

    // Reset form
    setTaskName("");
    setTaskDesc("");
    setAnalyst("Siti (SA)");
    setWriter("Budi (CW)");

    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
            const isRestrictedDrop =
              column === "Waiting Approval" || column === "Done";

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
                      {column === "Waiting Approval"
                        ? "Menunggu Persetujuan"
                        : column}
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
                    {tasks.filter((t) => t.status === column).length}
                  </span>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  <AnimatePresence>
                    {tasks
                      .filter((t) => t.status === column)
                      .map((task) => {
                        const assigned = isAssignedToMe(task.assignee);
                        return (
                          <motion.div
                            key={task.id}
                            layoutId={task.id}
                            draggable={true}
                            onDragStart={(e: any) =>
                              handleDragStart(e, task.id)
                            }
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
                                : "cursor-grab hover:scale-[1.02]"
                            } ${assigned ? "border-brand-yellow ring-1 ring-brand-yellow/50" : "border-[var(--border-color)] hover:border-brand-yellow/50"}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4
                                className={`font-bold leading-tight transition-colors ${assigned ? "text-brand-yellow" : "text-[var(--text-primary)] group-hover:text-brand-yellow"} pr-2`}
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
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                  <button
                                    type="button"
                                    onClick={(e) =>
                                      handleMoveTask(e, task.id, "up")
                                    }
                                    className="p-1 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-brand-yellow rounded transition-colors"
                                    title="Pindah ke Atas"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) =>
                                      handleMoveTask(e, task.id, "down")
                                    }
                                    className="p-1 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-brand-yellow rounded transition-colors"
                                    title="Pindah ke Bawah"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              {task.assigneeImage ? (
                                <img
                                  src={task.assigneeImage}
                                  alt={task.assignee}
                                  className="w-7 h-7 rounded-full object-cover"
                                  title={`Assignee: ${task.assignee}`}
                                />
                              ) : (
                                <div
                                  className="text-xs font-semibold text-[var(--text-secondary)] truncate max-w-[120px]"
                                  title={`Assignee: ${task.assignee}`}
                                >
                                  {task.assignee}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                  </AnimatePresence>

                  {tasks.filter((t) => t.status === column).length === 0 && (
                    <div className="h-24 border-2 border-dashed border-[var(--border-color)] rounded-xl flex items-center justify-center text-sm text-[var(--text-secondary)]"></div>
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
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold font-display uppercase tracking-tight text-[var(--text-primary)] mb-2">
                    {selectedTask.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedTask.status)}`}
                    >
                      {selectedTask.status === "Waiting Approval"
                        ? "Menunggu Persetujuan"
                        : selectedTask.status}
                    </span>
                    <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {selectedTask.assignee}
                    </span>
                  </div>
                </div>
                {role === "manager" && (
                  <button
                    onClick={() => handleEditClick(selectedTask)}
                    className="shrink-0 flex items-center px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium rounded-xl hover:border-brand-yellow/50 transition-colors self-start"
                  >
                    <Edit2 className="w-4 h-4 mr-2 text-brand-yellow" />
                    Edit Tugas
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Ringkasan Kampanye
                  </h4>
                  <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] leading-relaxed">
                    {selectedTask.description}
                  </div>
                </div>

                {selectedTask.status !== "To Do" && (
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 text-brand-yellow" />
                      Layanan AI Terlampir
                    </h4>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-xl space-y-4">
                      {selectedTask.aiScore !== undefined && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              Skor Visual/Desain AI
                            </span>
                            <span className="text-sm font-bold text-green-500">
                              {selectedTask.aiScore}/100
                            </span>
                          </div>
                          <div className="w-full bg-[var(--bg-primary)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${selectedTask.aiScore}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {selectedTask.aiKeywords &&
                        selectedTask.aiKeywords.length > 0 && (
                          <div>
                            <span className="text-sm font-medium block mb-2">
                              Keyword Utama Dihasilkan:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {selectedTask.aiKeywords.map((kw, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-[var(--bg-primary)] border border-brand-yellow/30 text-brand-yellow text-xs font-medium rounded-lg"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] font-semibold rounded-xl hover:bg-[var(--bg-primary)] transition-colors"
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
                {editingTaskId ? "Edit Tugas" : "Buat Tugas Baru"}
              </h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 border-brand-yellow">
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
                      value={analyst}
                      onChange={(e) => setAnalyst(e.target.value)}
                      className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow appearance-none cursor-pointer"
                    >
                      <option>Siti (SA)</option>
                      <option>Dodi (SA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tetapkan Writer
                    </label>
                    <select
                      value={writer}
                      onChange={(e) => setWriter(e.target.value)}
                      className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow appearance-none cursor-pointer"
                    >
                      <option>Budi (CW)</option>
                      <option>Citra (CW)</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 mt-6 border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand-yellow text-brand-black font-semibold rounded-xl hover:bg-brand-yellow-hover"
                  >
                    {editingTaskId ? "Simpan Perubahan" : "Buat Tugas"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 z-50"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-medium">Tugas berhasil dibuat!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

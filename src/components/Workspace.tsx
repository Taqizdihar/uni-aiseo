import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Key,
  Search,
  History,
  Menu,
  Bell,
  User,
  Sun,
  Moon,
  ChevronDown,
  Tag,
  Settings,
  ShieldCheck,
  List,
  Server,
  HelpCircle,
  LogOut,
  Users,
  Kanban,
  ClipboardCheck,
  Building2,
} from "lucide-react";
import { Theme } from "../types";

interface WorkspaceProps {
  theme: Theme;
  toggleTheme: () => void;
  mockUser: {
    name: string;
    email: string;
    role: string;
    workspaceName?: string;
    workspaceBgUrl?: string;
    profilePicture?: string | null;
  } | null;
  setMockUser?: React.Dispatch<React.SetStateAction<any>>;
  onLogout: () => void;
  setIsLoading: (val: boolean) => void;
}

export default function Workspace({
  theme,
  toggleTheme,
  mockUser,
  setMockUser,
  onLogout,
  setIsLoading,
}: WorkspaceProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = mockUser?.role === "admin";
  const role = mockUser?.role || "manager";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const logoUrl =
    theme === "dark"
      ? "https://i.imgur.com/BYH04vK.png"
      : "https://i.imgur.com/JAwcFtn.png";

  const menuItems: {
    path: string;
    label: string;
    icon: React.ReactNode;
    roles: string[];
  }[] = [
    {
      path: "/admin",
      label: "Dashboard Admin",
      icon: <ShieldCheck size={20} />,
      roles: ["admin"],
    },
    {
      path: "/manage-workspaces",
      label: "Kelola Workspace",
      icon: <Building2 size={20} />,
      roles: ["admin"],
    },
    {
      path: "/audit-trail",
      label: "Jejak Audit",
      icon: <List size={20} />,
      roles: ["admin"],
    },
    {
      path: "/manage-faqs",
      label: "Kelola FAQs",
      icon: <Server size={20} />,
      roles: ["admin"],
    },

    {
      path: "/workspace/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      roles: ["manager", "analyst", "writer"],
    },
    {
      path: "/workspace/task-board",
      label: "Papan Tugas Workspace",
      icon: <Kanban size={20} />,
      roles: ["manager", "analyst", "writer"],
    },

    {
      path: "/workspace/visual-analyzer",
      label: "AI Visual & Desain",
      icon: <ImageIcon size={20} />,
      roles: ["manager", "analyst"],
    },
    {
      path: "/workspace/keyword-generator",
      label: "AI Keyword Generator",
      icon: <Key size={20} />,
      roles: ["manager", "analyst"],
    },

    {
      path: "/workspace/on-page-optimizer",
      label: "On-Page SEO Optimizer",
      icon: <Search size={20} />,
      roles: ["manager", "writer"],
    },
    {
      path: "/workspace/meta-tag-generator",
      label: "AI Meta Tag Generator",
      icon: <Tag size={20} />,
      roles: ["manager", "writer"],
    },

    {
      path: "/workspace/content-approval",
      label: "Persetujuan Konten",
      icon: <ClipboardCheck size={20} />,
      roles: ["manager"],
    },
    {
      path: "/workspace/archive",
      label: "Arsip Workspace",
      icon: <History size={20} />,
      roles: ["manager"],
    },
    {
      path: "/workspace/team",
      label: "Manajemen Tim",
      icon: <Users size={20} />,
      roles: ["manager"],
    },

    {
      path: "/workspace/faqs",
      label: "Pusat Bantuan & FAQs",
      icon: <HelpCircle size={20} />,
      roles: ["manager", "analyst", "writer"],
    },
  ];

  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(role),
  );

  return (
    <div className="flex h-screen bg-[var(--bg-secondary)] overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? 280 : 0,
          opacity: 1,
        }}
        className={`fixed md:relative z-40 h-full flex flex-col bg-[var(--bg-primary)] border-r border-[var(--border-color)] overflow-hidden md:w-64 md:!w-64 flex-shrink-0 transition-colors duration-300 md:animate-none ${isSidebarOpen ? "w-64" : "w-0"}`}
      >
        <div
          className="h-24 flex items-center px-6 border-b border-[var(--border-color)] flex-shrink-0 cursor-pointer"
          onClick={() => navigate("/workspace/dashboard")}
        >
          <img src={logoUrl} alt="UNI-AISEO Logo" className="h-20 w-auto" />
        </div>
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-brand-yellow/10 text-brand-yellow font-medium"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <div className="shrink-0">{item.icon}</div>
                <span className="text-sm whitespace-nowrap truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-24 bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex items-center justify-between px-4 sm:px-8 z-20 relative transition-colors duration-300">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 mr-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg md:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider block mb-1">
                {isAdmin ? "SYSTEM ADMINISTRATION" : "Workspace"}
              </span>
              <span
                className="text-lg font-bold truncate block"
                title={
                  isAdmin
                    ? "Global Overview"
                    : mockUser?.workspaceName || "UMKM Maju Jaya"
                }
              >
                {isAdmin
                  ? "Global Overview"
                  : mockUser?.workspaceName || "UMKM Maju Jaya"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 flex items-center justify-center text-[10px] text-white font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="fixed right-4 left-4 top-20 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-3 sm:w-80 md:w-96 bg-[var(--bg-primary)] border border-gray-700 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                  >
                    <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-secondary)]/50">
                      <h3 className="font-bold text-[var(--text-primary)]">
                        Notifikasi
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-brand-yellow hover:text-brand-yellow-hover transition-colors pr-2"
                        >
                          Tandai semua dibaca
                        </button>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-secondary)]">
                          Anda sudah membaca semuanya!
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--bg-secondary)] transition-colors flex gap-3 ${!notif.is_read ? "bg-[#2a2a2c] dark:bg-[var(--bg-primary)]/40 relative" : ""}`}
                          >
                            {!notif.is_read && (
                              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            )}
                            <div
                              className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-brand-black bg-brand-yellow`}
                            >
                              {notif.user_name ? notif.user_name.charAt(0).toUpperCase() : "S"}
                            </div>
                            <div>
                              <p className="text-sm text-[var(--text-primary)] leading-tight mb-1">
                                {notif.message}
                              </p>
                              <p className="text-xs text-[var(--text-secondary)]">
                                {new Date(notif.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 sm:space-x-3 p-1.5 hover:bg-[var(--bg-secondary)] rounded-xl transition-colors border border-transparent hover:border-[var(--border-color)]"
              >
                {mockUser?.profilePicture ? (
                  <img
                    src={mockUser.profilePicture}
                    alt={mockUser.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-yellow text-brand-black flex items-center justify-center font-bold text-sm">
                    {mockUser?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium leading-none mb-1">
                    {mockUser?.name || "User"}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] leading-none">
                    {mockUser?.role === "admin" ? "Administrator" : 
                     mockUser?.role === "manager" ? "SEO Manager" : 
                     mockUser?.role === "analyst" ? "SEO Analyst" : 
                     mockUser?.role === "writer" ? "Content Writer" : 
                     mockUser?.role}
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className="text-[var(--text-secondary)]"
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-[var(--bg-primary)] rounded-xl shadow-lg border border-[var(--border-color)] overflow-hidden"
                  >
                    <div className="p-4 border-b border-[var(--border-color)]">
                      <div className="font-medium truncate">
                        {mockUser?.name}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] truncate">
                        {mockUser?.email}
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        Detail Akun
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] rounded-lg text-sm text-red-500 hover:text-red-400 transition-colors mt-1"
                      >
                        Keluar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsLogoutModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[var(--bg-primary)] p-6 rounded-2xl shadow-xl w-full max-w-sm border border-[var(--border-color)] text-center max-h-[90vh] overflow-y-auto"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Keluar?</h3>
              <p className="text-[var(--text-secondary)] mb-8">
                Apakah Anda yakin ingin keluar dari akun Anda? Anda harus masuk
                kembali untuk mengakses Workspace.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="px-6 py-2.5 font-medium border border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--border-color)] transition-colors w-full flex-1"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogoutModalOpen(false);
                    onLogout();
                    navigate("/");
                  }}
                  className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors w-full flex-1"
                >
                  Keluar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

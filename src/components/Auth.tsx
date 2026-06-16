import React, { useState } from 'react';
import { AppState } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/auth';

interface AuthProps {
  view: 'login' | 'register';
  navigate: (view: AppState) => void;
  onSubmit: (data: { name: string; email: string; role: string; workspaceName?: string; workspace_id?: number; token?: string; profilePicture?: string | null; workspaceBgUrl?: string | null }) => void;
}

export default function Auth({ view, navigate, onSubmit }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [remember, setRemember] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const showAlert = (type: 'error' | 'success', message: string) => {
    setAlert({ type, message });
    if (type === 'success') {
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    // Client-side validation for register
    if (view === 'register' && password !== confirmPass) {
      showAlert('error', 'Password dan konfirmasi password tidak cocok.');
      return;
    }

    if (view === 'register' && password.length < 6) {
      showAlert('error', 'Password minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (view === 'register') {
        // --- REGISTER ---
        const registerRes = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspace_name: workspaceName,
            name,
            email,
            password,
          }),
        });

        const registerData = await registerRes.json();

        if (!registerRes.ok) {
          showAlert('error', registerData.message || 'Registrasi gagal.');
          setIsSubmitting(false);
          return;
        }

        showAlert('success', registerData.message || 'Registrasi berhasil! Mengarahkan ke login...');
        
        // Auto-login after successful registration
        setTimeout(() => {
          navigate('login');
        }, 1500);

      } else {
        // --- LOGIN ---
        const loginRes = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
          showAlert('error', loginData.message || 'Login gagal.');
          setIsSubmitting(false);
          return;
        }

        // Store JWT token and user data in localStorage
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));

        // Map backend role to frontend role key
        const roleMap: Record<string, string> = {
          'SEO Manager': 'manager',
          'SEO Analyst': 'analyst',
          'Content Writer': 'writer',
          'Admin': 'admin',
          'Administrator': 'admin',
        };

        const frontendRole = roleMap[loginData.user.role] || 'manager';

        // Call onSubmit to update App state and trigger navigation
        onSubmit({
          name: loginData.user.name,
          email: loginData.user.email,
          role: frontendRole,
          workspaceName: loginData.user.workspace_name,
          workspace_id: loginData.user.workspace_id,
          token: loginData.token,
          profilePicture: loginData.user.profile_picture ? `http://localhost:5000${loginData.user.profile_picture}` : null,
          workspaceBgUrl: loginData.user.background_image ? `http://localhost:5000${loginData.user.background_image}` : null,
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      showAlert('error', 'Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-20 mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <button
          onClick={() => navigate('landing')}
          className="flex items-center text-sm text-[var(--text-secondary)] hover:text-brand-yellow mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </button>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-8 shadow-xl relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-yellow to-transparent" />
          
          <h2 className="text-3xl font-display font-bold mb-2">
            {view === 'login' ? 'Selamat Datang' : 'Buat akun Anda'}
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            {view === 'login'
              ? 'Masukkan kredensial Anda untuk mengakses Dashboard.'
              : 'Register untuk membuat Workspace baru dan menjadi SEO Manager untuk tim Anda.'}
          </p>

          {/* Dynamic Alert */}
          <AnimatePresence>
            {alert && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-6 flex items-start gap-3 p-4 rounded-xl border ${
                  alert.type === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-green-500/10 border-green-500/30 text-green-400'
                }`}
              >
                {alert.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-medium">{alert.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {view === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Workspace / Organisasi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                      placeholder="e.g., UMKM Maju Jaya"
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 italic">(Catatan: Jika email Anda sudah didaftarkan oleh Manager, nama workspace yang Anda ketik di sini akan diabaikan dan Anda akan langsung diarahkan ke workspace tim)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                      placeholder="Budi Santoso"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                  placeholder="you@company.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {view === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2">Konfirmasi Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-shadow"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            {view === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border-color)] text-brand-yellow focus:ring-brand-yellow bg-[var(--bg-primary)] cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--text-secondary)] cursor-pointer">
                    Ingat saya
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-[var(--text-primary)] hover:text-brand-yellow transition-colors duration-200">
                    Lupa password?
                  </a>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3.5 px-4 mt-2 border border-transparent rounded-xl shadow-sm text-base font-semibold text-brand-black bg-brand-yellow hover:bg-brand-yellow-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow focus:ring-offset-[var(--bg-secondary)] transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {view === 'login' ? 'Memproses...' : 'Mendaftarkan...'}
                </span>
              ) : (
                view === 'login' ? 'Login' : 'Buat akun Anda'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            {view === 'login' ? (
              <p>
                Belum memiliki akun?{' '}
                <button onClick={() => navigate('register')} className="font-medium text-[var(--text-primary)] hover:text-brand-yellow transition-colors duration-200">
                  Daftar gratis
                </button>
              </p>
            ) : (
              <p>
                Sudah memiliki akun?{' '}
                <button onClick={() => navigate('login')} className="font-medium text-[var(--text-primary)] hover:text-brand-yellow transition-colors duration-200">
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

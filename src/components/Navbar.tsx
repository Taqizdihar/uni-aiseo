import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Theme } from '../types';

interface NavbarProps {
  theme: Theme;
  toggleTheme: () => void;
  currentView: string;
  navigate: (view: string) => void;
}

export default function Navbar({ theme, toggleTheme, currentView, navigate }: NavbarProps) {
  const logoUrl = theme === 'dark'
    ? 'https://i.imgur.com/BYH04vK.png'
    : 'https://i.imgur.com/JAwcFtn.png';

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('landing')}
          >
            <img src={logoUrl} alt="UNI-AISEO Logo" className="h-20 w-auto" />
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)]"
              aria-label="Ubah Tema"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {currentView !== 'dashboard' && (
              <div className="hidden sm:flex items-center space-x-4">
                <button
                  onClick={() => navigate('login')}
                  className="text-sm font-medium hover:text-brand-yellow transition-colors"
                >
                  Masuk
                </button>
                <button
                  onClick={() => navigate('register')}
                  className="px-5 py-2.5 text-sm font-medium bg-brand-yellow text-brand-black rounded-lg hover:bg-brand-yellow-hover transition-colors shadow-sm"
                >
                  Mulai Sekarang
                </button>
              </div>
            )}
            {currentView === 'dashboard' && (
              <button
                onClick={() => navigate('landing')}
                className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
              >
                Keluar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// src/components/Navbar.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  User,
  Sun,
  Moon,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Backdrop blur overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      <nav className="relative z-50 backdrop-blur-2xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/30 dark:border-gray-700/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link
              to="/"
              className="group flex items-center space-x-3"
              onClick={closeMobileMenu}
            >
              <img
                src="/nav-logo.png"
                alt="Mkulima Hub Logo"
                className="w-18 h-12 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">

              {/* User Avatar + Name */}
              {user ? (
                <div className="flex items-center space-x-6">

                  {/* User Info */}
                  <div className="flex items-center space-x-3 group">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-500 p-0.5">
                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                          <span className="text-sm font-bold text-transparent bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {user.name.split(' ')[0]}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>

                  {/* Admin Dashboard */}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="group flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                      <LayoutDashboard className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <span>Dashboard</span>
                    </Link>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="group flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Login
                </Link>
              )}

              {/* Theme Toggle - Fixed & Animated */}
              <button
                onClick={toggleTheme}
                className="relative p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-inner hover:shadow-md active:scale-95 transition-all duration-300 overflow-hidden group"
                aria-label="Toggle theme"
              >
                <div className="relative w-5 h-5">
                  <Sun
                    className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-500 ease-in-out ${
                      isDark
                        ? 'rotate-180 scale-0 opacity-0'
                        : 'rotate-0 scale-100 opacity-100'
                    }`}
                  />
                  <Moon
                    className={`absolute inset-0 w-5 h-5 text-indigo-400 transition-all duration-500 ease-in-out ${
                      isDark
                        ? 'rotate-0 scale-100 opacity-100'
                        : '-rotate-180 scale-0 opacity-0'
                    }`}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/20 dark:to-gray-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all duration-200"
              aria-label="Toggle menu"
            >
              <Menu className={`w-6 h-6 transition-all duration-300 ${mobileMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
              <X className={`absolute w-6 h-6 transition-all duration-300 ${mobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu - Slide Down */}
        <div
          className={`absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden transition-all duration-500 ease-out md:hidden ${
            mobileMenuOpen
              ? 'max-h-96 opacity-100 translate-y-0'
              : 'max-h-0 opacity-0 -translate-y-4'
          }`}
        >
          <div className="px-6 py-6 space-y-5">

            {/* User Card */}
            {user && (
              <div className="flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                      <span className="text-lg font-bold text-transparent bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
            )}

            {/* Admin Link */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 w-full px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl active:scale-98 transition-all duration-300"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {/* Logout or Login */}
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-5 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl active:scale-98 transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="block w-full text-center px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-lg hover:shadow-xl active:scale-98 transition-all duration-300"
              >
                Login
              </Link>
            )}

            {/* Theme Toggle in Mobile */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center space-x-3 w-full px-6 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-98 transition-all duration-300"
            >
              <div className="relative w-6 h-6">
                <Sun className={`absolute inset-0 text-yellow-500 transition-all duration-500 ${isDark ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
                <Moon className={`absolute inset-0 text-indigo-400 transition-all duration-500 ${isDark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
              </div>
              <span className="font-medium">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
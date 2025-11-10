// src/pages/Login.jsx
import { useState } from 'react';
import { login as apiLogin, register } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be 6+ characters';
    }

    // Register only
    if (isRegister) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const apiCall = isRegister ? register : apiLogin;
      const payload = isRegister
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password };

      const { data } = await apiCall(payload);

      const userData = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role
      };

      login(userData, data.token);
      toast.success(isRegister ? 'Account created!' : 'Welcome back!');

      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      const msg = err.response?.data?.msg || (isRegister ? 'Registration failed' : 'Invalid credentials');
      toast.error(msg);
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setErrors({});
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Link to="/" className="inline-block">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mkulima Hub
              </h1>
            </Link>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isRegister ? 'Join us today' : 'Sign in to continue'}
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50"
          >
            {/* Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-8">
              {['Sign In', 'Sign Up'].map((text, i) => (
                <button
                  key={text}
                  onClick={() => !isRegister === (i === 0) && switchMode()}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    (!isRegister && i === 0) || (isRegister && i === 1)
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isRegister && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center space-x-2 ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isRegister ? 'Creating...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                )}
              </motion.button>

              {errors.submit && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 py-2 rounded-lg"
                >
                  {errors.submit}
                </motion.p>
              )}
            </form>

            {/* Switch Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={switchMode}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
                >
                  {isRegister ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Dev Tip - Optional: Remove if not needed */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
                  <strong>NB:</strong> Use any email <code>admin role default </code> 
                </p>
              </div>
            )}
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8 text-xs text-gray-500 dark:text-gray-400"
          >
            © 2025 AgriSurvey. All rights reserved.
          </motion.p>
        </div>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', background: '#333', color: '#fff' },
        }}
      />
    </>
  );
};

export default Login;
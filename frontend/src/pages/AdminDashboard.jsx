// src/pages/AdminDashboard.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Analytics from '../components/Analytics';
import QuestionsAdmin from '../components/QuestionsAdmin';
import Submissions from '../components/Submissions';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">Admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100 mt-2">Manage surveys and view analytics</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {[
                { id: 'analytics', label: 'Analytics' },
                { id: 'questions', label: 'Manage Questions' },
                { id: 'submissions', label: 'Submissions' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'questions' && <QuestionsAdmin />}
            {activeTab === 'submissions' && <Submissions />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
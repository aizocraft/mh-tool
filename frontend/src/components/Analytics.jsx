// src/components/Analytics.jsx
import { useEffect, useState } from 'react';
import { getAnalytics } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await getAnalytics();
        setAnalytics(response.data);
      } catch (err) {
        setError(err.response?.data?.msg || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">Error loading analytics</div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <h3 className="text-lg font-semibold mb-2">Total Submissions</h3>
          <p className="text-3xl font-bold">{analytics.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <h3 className="text-lg font-semibold mb-2">Farmers</h3>
          <p className="text-3xl font-bold">
            {analytics.userTypes.find(u => u._id === 'Farmer')?.count || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <h3 className="text-lg font-semibold mb-2">Experts</h3>
          <p className="text-3xl font-bold">
            {analytics.userTypes.find(u => u._id === 'Agricultural Expert')?.count || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white">
          <h3 className="text-lg font-semibold mb-2">Admins</h3>
          <p className="text-3xl font-bold">
            {analytics.userTypes.find(u => u._id === 'Administrator')?.count || 0}
          </p>
        </div>
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Types Pie Chart */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.userTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.userTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Age Distribution Bar Chart */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Age Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.ages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Crop Loss Frequency */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Crop Loss Frequency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.cropLossFreq}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Advice Sources */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Advice Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.adviceSources}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Money Lost Analysis */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Money Lost Due to Wrong Advice</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.lostMoney}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.lostMoney.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Expert Consultation Capacity */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Expert Weekly Capacity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.weeklyFarmers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" fill="#8884d8" stroke="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enhanced Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* County Distribution */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">County Distribution</h3>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-2">County</th>
                  <th className="text-right py-2">Count</th>
                  <th className="text-right py-2">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {analytics.counties.map((county, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="py-2">{county._id || 'Unknown'}</td>
                    <td className="text-right py-2">{county.count}</td>
                    <td className="text-right py-2 text-gray-500">
                      {((county.count / analytics.total) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Farmer Insights */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Farmer Insights</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">AI Assistant Usefulness (1-5)</h4>
              <div className="space-y-2">
                {analytics.farmerAI.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rating {item._id}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...analytics.farmerAI.map(f => f.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">M-Pesa Payments</h4>
                <div className="space-y-1">
                  {analytics.payMpesa.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item._id}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Crop Guide Usage</h4>
                <div className="space-y-1">
                  {analytics.cropGuides.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item._id}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
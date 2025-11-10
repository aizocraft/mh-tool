// src/components/Submissions.jsx
import { useEffect, useState } from 'react';
import { getSubmissions, deleteSubmission, updateSubmission } from '../api';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmissions, setSelectedSubmissions] = useState(new Set());
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    userType: '',
    county: '',
    sort: '-submittedAt'
  });
  const [previewSubmission, setPreviewSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [filters]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getSubmissions(filters);
      setSubmissions(data.submissions);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    
    try {
      await deleteSubmission(id);
      setSubmissions(submissions.filter(s => s._id !== id));
      setSelectedSubmissions(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(id);
        return newSelected;
      });
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedSubmissions.size} submissions?`)) return;
    
    try {
      const deletePromises = Array.from(selectedSubmissions).map(id => deleteSubmission(id));
      await Promise.all(deletePromises);
      setSubmissions(submissions.filter(s => !selectedSubmissions.has(s._id)));
      setSelectedSubmissions(new Set());
      fetchSubmissions(); // Refresh to get updated pagination
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSubmissions(new Set(submissions.map(s => s._id)));
    } else {
      setSelectedSubmissions(new Set());
    }
  };

  const handleSelectSubmission = (id, checked) => {
    const newSelected = new Set(selectedSubmissions);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedSubmissions(newSelected);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 1 }) // Reset to first page when filters change
    }));
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const renderAnswer = (section, field, value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    
    return value || 'Not answered';
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search counties, topics..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User Type
            </label>
            <select
              value={filters.userType}
              onChange={(e) => handleFilterChange('userType', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">All Types</option>
              <option value="Farmer">Farmer</option>
              <option value="Agricultural Expert">Expert</option>
              <option value="Administrator">Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              County
            </label>
            <input
              type="text"
              value={filters.county}
              onChange={(e) => handleFilterChange('county', e.target.value)}
              placeholder="Filter by county..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="-submittedAt">Newest First</option>
              <option value="submittedAt">Oldest First</option>
              <option value="profile.county">County A-Z</option>
              <option value="-profile.county">County Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSubmissions.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 dark:text-blue-300">
              {selectedSubmissions.size} submission(s) selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Submissions Table */}
      <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                <th className="text-left py-4 px-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.size === submissions.length && submissions.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left py-4 px-4">User Type</th>
                <th className="text-left py-4 px-4">County</th>
                <th className="text-left py-4 px-4">Age</th>
                <th className="text-left py-4 px-4">Crop Loss Frequency</th>
                <th className="text-left py-4 px-4">Submitted</th>
                <th className="text-left py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr 
                  key={submission._id} 
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={() => setPreviewSubmission(submission)}
                >
                  <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.has(submission._id)}
                      onChange={(e) => handleSelectSubmission(submission._id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      {submission.profile?.userType}
                    </span>
                  </td>
                  <td className="py-4 px-4">{submission.profile?.county}</td>
                  <td className="py-4 px-4">{submission.profile?.age}</td>
                  <td className="py-4 px-4">{submission.problems?.cropLossFrequency}</td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatTimeAgo(submission.submittedAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setPreviewSubmission(submission)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(submission._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {submissions.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No submissions found matching your filters.
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} entries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-500 text-white rounded">
                  {pagination.page}
                </span>
                <button
                  onClick={() => handleFilterChange('page', pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submission Preview Modal */}
      {previewSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Submission Details
                </h3>
                <button
                  onClick={() => setPreviewSubmission(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                  {previewSubmission.profile?.userType}
                </span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                  {previewSubmission.profile?.county}
                </span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                  Submitted {formatTimeAgo(previewSubmission.submittedAt)}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Section */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Profile Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(previewSubmission.profile || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <p className="mt-1 text-gray-800 dark:text-gray-200">
                        {renderAnswer('profile', key, value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Problems Section */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Problems & Challenges</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(previewSubmission.problems || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <p className="mt-1 text-gray-800 dark:text-gray-200">
                        {renderAnswer('problems', key, value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role-specific Features */}
              {(previewSubmission.farmerFeatures || previewSubmission.expertFeatures || previewSubmission.adminFeatures) && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Role-specific Features</h4>
                  <div className="space-y-4">
                    {previewSubmission.farmerFeatures && (
                      <div>
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Farmer Features</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(previewSubmission.farmerFeatures).map(([key, value]) => (
                            <div key={key}>
                              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace(/([A-Z])/g, ' $1')}
                              </label>
                              <p className="mt-1 text-gray-800 dark:text-gray-200">
                                {renderAnswer('farmerFeatures', key, value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {previewSubmission.expertFeatures && (
                      <div>
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Expert Features</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(previewSubmission.expertFeatures).map(([key, value]) => (
                            <div key={key}>
                              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace(/([A-Z])/g, ' $1')}
                              </label>
                              <p className="mt-1 text-gray-800 dark:text-gray-200">
                                {renderAnswer('expertFeatures', key, value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {previewSubmission.adminFeatures && (
                      <div>
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Admin Features</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(previewSubmission.adminFeatures).map(([key, value]) => (
                            <div key={key}>
                              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace(/([A-Z])/g, ' $1')}
                              </label>
                              <p className="mt-1 text-gray-800 dark:text-gray-200">
                                {renderAnswer('adminFeatures', key, value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
              <button
                onClick={() => setPreviewSubmission(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDelete(previewSubmission._id);
                  setPreviewSubmission(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;
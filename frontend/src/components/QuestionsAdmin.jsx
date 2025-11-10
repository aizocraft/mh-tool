// src/components/QuestionsAdmin.jsx
import { useEffect, useState } from 'react';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../api';

const QuestionsAdmin = () => {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [questionLoading, setQuestionLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    section: 'profile',
    type: 'radio',
    label: '',
    options: [],
    required: false,
    conditional: ''
  });
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await getQuestions();
      setQuestions(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setQuestionLoading(true);
    try {
      const response = await createQuestion(newQuestion);
      setQuestions([...questions, response.data]);
      setNewQuestion({
        section: 'profile',
        type: 'radio',
        label: '',
        options: [],
        required: false,
        conditional: ''
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    setQuestionLoading(true);
    try {
      const response = await updateQuestion(editingQuestion._id, editingQuestion);
      setQuestions(questions.map(q => q._id === editingQuestion._id ? response.data : q));
      setEditingQuestion(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter(q => q._id !== id));
      setSelectedQuestions(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(id);
        return newSelected;
      });
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedQuestions.size} questions?`)) return;
    
    try {
      const deletePromises = Array.from(selectedQuestions).map(id => deleteQuestion(id));
      await Promise.all(deletePromises);
      setQuestions(questions.filter(q => !selectedQuestions.has(q._id)));
      setSelectedQuestions(new Set());
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedQuestions(new Set(questions.map(q => q._id)));
    } else {
      setSelectedQuestions(new Set());
    }
  };

  const handleSelectQuestion = (id, checked) => {
    const newSelected = new Set(selectedQuestions);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedQuestions(newSelected);
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, '']
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = newQuestion.options.filter((_, i) => i !== index);
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Create Question Form */}
      <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          {editingQuestion ? 'Edit Question' : 'Create New Question'}
        </h2>
        <form onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Section
              </label>
              <select
                value={editingQuestion ? editingQuestion.section : newQuestion.section}
                onChange={(e) => editingQuestion 
                  ? setEditingQuestion({...editingQuestion, section: e.target.value})
                  : setNewQuestion({...newQuestion, section: e.target.value})
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                required
              >
                <option value="profile">Profile</option>
                <option value="problems">Problems</option>
                <option value="farmer">Farmer</option>
                <option value="expert">Expert</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={editingQuestion ? editingQuestion.type : newQuestion.type}
                onChange={(e) => editingQuestion 
                  ? setEditingQuestion({...editingQuestion, type: e.target.value})
                  : setNewQuestion({...newQuestion, type: e.target.value})
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                required
              >
                <option value="radio">Radio</option>
                <option value="checkbox">Checkbox</option>
                <option value="dropdown">Dropdown</option>
                <option value="scale">Scale</option>
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Question Label
            </label>
            <input
              type="text"
              value={editingQuestion ? editingQuestion.label : newQuestion.label}
              onChange={(e) => editingQuestion 
                ? setEditingQuestion({...editingQuestion, label: e.target.value})
                : setNewQuestion({...newQuestion, label: e.target.value})
              }
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Enter question text..."
              required
            />
          </div>

          {(newQuestion.type === 'radio' || newQuestion.type === 'checkbox' || newQuestion.type === 'dropdown' || newQuestion.type === 'scale') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Options
              </label>
              <div className="space-y-2">
                {(editingQuestion ? editingQuestion.options : newQuestion.options).map((option, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        if (editingQuestion) {
                          const newOptions = [...editingQuestion.options];
                          newOptions[index] = e.target.value;
                          setEditingQuestion({...editingQuestion, options: newOptions});
                        } else {
                          updateOption(index, e.target.value);
                        }
                      }}
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Option
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editingQuestion ? editingQuestion.required : newQuestion.required}
                onChange={(e) => editingQuestion 
                  ? setEditingQuestion({...editingQuestion, required: e.target.checked})
                  : setNewQuestion({...newQuestion, required: e.target.checked})
                }
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Required</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Conditional Logic
              </label>
              <input
                type="text"
                value={editingQuestion ? editingQuestion.conditional : newQuestion.conditional}
                onChange={(e) => editingQuestion 
                  ? setEditingQuestion({...editingQuestion, conditional: e.target.value})
                  : setNewQuestion({...newQuestion, conditional: e.target.value})
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="profile.userType:Farmer"
              />
              <p className="text-xs text-gray-500 mt-1">Format: field.path:value</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={questionLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {questionLoading ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Create Question')}
            </button>
            {editingQuestion && (
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Questions List with Bulk Actions */}
      <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Existing Questions ({questions.length})
          </h2>
          
          {selectedQuestions.size > 0 && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedQuestions.size} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.size === questions.length && questions.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left py-3">Question</th>
                <th className="text-left py-3">Section</th>
                <th className="text-left py-3">Type</th>
                <th className="text-left py-3">Required</th>
                <th className="text-left py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-3">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.has(question._id)}
                      onChange={(e) => handleSelectQuestion(question._id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{question.label}</p>
                      {question.options && question.options.length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Options: {question.options.join(', ')}
                        </p>
                      )}
                      {question.conditional && (
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          Conditional: {question.conditional}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded capitalize">
                      {question.section}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded capitalize">
                      {question.type}
                    </span>
                  </td>
                  <td className="py-3">
                    {question.required ? (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded">
                        Required
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question._id)}
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

        {questions.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No questions found. Create your first question above.
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsAdmin;
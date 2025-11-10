// src/components/QuestionInput.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';  

// ... rest of your QuestionInput component code
const QuestionInput = ({ question, value, onChange, error }) => {
  const [localValue, setLocalValue] = useState(
    value ?? (question.type === 'checkbox' ? [] : '')
  );

  useEffect(() => {
    setLocalValue(value ?? (question.type === 'checkbox' ? [] : ''));
  }, [value, question.type]);

  const handleChange = (e) => {
    let newValue;
    switch (question.type) {
      case 'checkbox':
        const opt = e.target.value;
        newValue = localValue.includes(opt)
          ? localValue.filter(x => x !== opt)
          : [...localValue, opt];
        break;
      case 'scale':
        newValue = Number(e.target.value);
        break;
      case 'radio':
        newValue = e.target.value;
        break;
      default:
        newValue = e.target.value;
    }
    setLocalValue(newValue);
    onChange(question.label, newValue);
  };

  const handleScale = (val) => {
    const num = Number(val);
    setLocalValue(num);
    onChange(question.label, num);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
    >
      <label className="block text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
        {question.label}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Dropdown */}
      {question.type === 'dropdown' && (
        <motion.select
          value={localValue}
          onChange={handleChange}
          whileFocus={{ scale: 1.02 }}
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          <option value="">Select...</option>
          {question.options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </motion.select>
      )}

      {/* Radio */}
      {question.type === 'radio' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((opt, i) => (
            <motion.label
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                localValue === opt
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="radio"
                value={opt}
                checked={localValue === opt}
                onChange={handleChange}
                className="mr-3 h-5 w-5 text-blue-600"
              />
              <span className="font-medium">{opt}</span>
            </motion.label>
          ))}
        </div>
      )}

      {/* Checkbox */}
      {question.type === 'checkbox' && (
        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <motion.label
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                localValue.includes(opt)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="checkbox"
                value={opt}
                checked={localValue.includes(opt)}
                onChange={handleChange}
                className="mr-3 h-5 w-5 text-blue-600 rounded"
              />
              <span className="font-medium">{opt}</span>
            </motion.label>
          ))}
        </div>
      )}

      {/* Scale */}
      {question.type === 'scale' && (
        <div className="flex flex-wrap gap-3 justify-center">
          {question.options.map((opt, i) => {
            const num = Number(opt);
            const selected = localValue === num;
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => handleScale(opt)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center p-5 rounded-2xl border min-w-20 transition-all ${
                  selected
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 shadow-xl'
                    : 'border-gray-300 dark:border-gray-600 hover:shadow-md'
                }`}
              >
                <span className={`text-3xl font-bold ${selected ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  {opt}
                </span>
                {i === 0 && <span className="text-xs mt-1 text-gray-500">Low</span>}
                {i === question.options.length - 1 && <span className="text-xs mt-1 text-gray-500">High</span>}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Textarea */}
      {question.type === 'textarea' && (
        <motion.textarea
          value={localValue}
          onChange={handleChange}
          rows={4}
          whileFocus={{ scale: 1.01 }}
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Your answer..."
        />
      )}

      {/* Text */}
      {(!question.type || question.type === 'text') && (
        <motion.input
          type="text"
          value={localValue}
          onChange={handleChange}
          whileFocus={{ scale: 1.02 }}
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          placeholder="Type here..."
        />
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" /> {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default QuestionInput;
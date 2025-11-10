// src/components/Stepper.jsx
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const Stepper = ({ steps, currentStep, onStepClick }) => {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-12 px-2">
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-white/20 dark:bg-black/10 animate-pulse" />
      </div>

      {/* Steps */}
      <div className="flex justify-between mt-5">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;
          const canClick = stepNum <= currentStep;

          return (
            <motion.button
              key={step}
              onClick={() => canClick && onStepClick?.(stepNum)}
              disabled={!canClick}
              className="group flex flex-col items-center"
              whileHover={canClick ? { y: -2 } : {}}
              whileTap={canClick ? { scale: 0.95 } : {}}
            >
              <div
                className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-lg ${
                  isActive
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110 ring-4 ring-blue-500/30'
                    : isDone
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span>{stepNum}</span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeStep"
                    className="absolute inset-0 rounded-full bg-white/20"
                    initial={false}
                  />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium max-w-20 text-center transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : isDone
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`}
              >
                {step}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
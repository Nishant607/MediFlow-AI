import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-white border border-slate-200/90 shadow-clinic p-8 sm:p-12 text-center rounded-2xl flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100/80 flex items-center justify-center text-[#005A9C] mb-4 shadow-sm">
          <Icon className="w-7 h-7" />
        </div>
      )}
      {title && (
        <h3 className="text-base font-bold text-slate-800 font-display mb-1.5">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed mb-4">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </motion.div>
  );
};

export default EmptyState;

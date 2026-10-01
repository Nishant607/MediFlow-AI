import React from 'react';

const Badge = ({ variant = 'neutral', children, className = '', dot = false }) => {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    brand: 'bg-blue-50 text-[#005A9C] border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    brand: 'bg-[#005A9C]',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${
        variantStyles[variant] || variantStyles.neutral
      } ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotColors[variant] || dotColors.neutral
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;

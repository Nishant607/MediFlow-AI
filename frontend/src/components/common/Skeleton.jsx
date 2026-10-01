import React from 'react';

const Skeleton = ({ variant = 'text', className = '', count = 1 }) => {
  const getBaseClasses = () => {
    switch (variant) {
      case 'avatar':
        return 'w-10 h-10 rounded-full';
      case 'card':
        return 'w-full h-32 rounded-2xl';
      case 'stat':
        return 'w-full h-24 rounded-xl';
      case 'rect':
        return 'w-full h-12 rounded-xl';
      case 'text':
      default:
        return 'w-full h-4 rounded-md';
    }
  };

  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-slate-200/80 border border-slate-100 ${getBaseClasses()} ${className}`}
        />
      ))}
    </>
  );
};

export default Skeleton;

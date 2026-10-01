import React, { useState } from 'react';
import { Clock } from 'lucide-react';

/**
 * AdminComingSoon — Reusable "Coming Soon" pattern component.
 * Props:
 *   children       — the wrapped content to show (e.g. a nav item label, card content)
 *   type           — 'badge' (default) | 'card' | 'inline'
 *   showToast      — whether clicking shows a toast (default true)
 *   message        — custom message for toast
 */
const AdminComingSoon = ({
  children,
  type = 'badge',
  showToast = true,
  message = 'This feature is coming in a future update.',
  className = '',
}) => {
  const [toastVisible, setToastVisible] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showToast) return;
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  if (type === 'inline') {
    return (
      <span
        onClick={handleClick}
        className={`relative inline-flex items-center gap-1.5 cursor-not-allowed opacity-60 ${className}`}
        title={message}
      >
        {children}
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-500 tracking-wide uppercase leading-none">
          Soon
        </span>
        {toastVisible && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl animate-in fade-in slide-in-from-left-1">
            {message}
          </div>
        )}
      </span>
    );
  }

  if (type === 'card') {
    return (
      <div className={`relative ${className}`} onClick={handleClick}>
        <div className="opacity-40 pointer-events-none select-none">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 cursor-not-allowed">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-200/90 text-slate-600 border border-slate-300/80 shadow-sm backdrop-blur-xs">
            <Clock className="w-3.5 h-3.5" />
            Coming Soon
          </span>
          {toastVisible && (
            <span className="text-[11px] text-slate-500 font-medium mt-0.5">{message}</span>
          )}
        </div>
      </div>
    );
  }

  // default: badge (for sidebar nav items)
  return (
    <span
      onClick={handleClick}
      className={`relative flex items-center gap-1.5 cursor-not-allowed opacity-55 ${className}`}
      title={message}
    >
      {children}
      <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-500 tracking-wide uppercase leading-none flex-shrink-0">
        Soon
      </span>
      {toastVisible && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-[200] whitespace-nowrap bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none">
          {message}
        </div>
      )}
    </span>
  );
};

export default AdminComingSoon;

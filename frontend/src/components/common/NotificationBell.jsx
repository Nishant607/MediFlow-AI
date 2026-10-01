import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import {
  getMyNotifications,
  markNotificationRead,
  markAllRead,
} from '../../api/notificationsApi';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getMyNotifications();
      setNotifications(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkSingleRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-600 hover:text-[#005A9C] bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all focus:outline-none shadow-sm"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold text-white bg-rose-600 rounded-full shadow-sm">
              {unreadCount}
            </span>
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-clinic-lg z-[100] overflow-hidden border border-slate-200"
          >
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-display">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-blue-50 text-[#005A9C] text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-100">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[#005A9C] hover:underline font-semibold flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-84 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#005A9C]/30 border-t-[#005A9C] rounded-full animate-spin" />
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <Inbox className="w-8 h-8 text-slate-400 mb-1" />
                  No notifications found.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkSingleRead(notif.id, notif.is_read)}
                    className={`p-3.5 transition-all cursor-pointer text-xs space-y-1 ${
                      !notif.is_read
                        ? 'bg-blue-50/60 hover:bg-blue-50/90'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <p
                        className={`leading-snug ${
                          !notif.is_read
                            ? 'text-slate-900 font-semibold'
                            : 'text-slate-600'
                        }`}
                      >
                        {notif.message}
                      </p>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#005A9C] shrink-0 mt-1" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {formatDate(notif.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;

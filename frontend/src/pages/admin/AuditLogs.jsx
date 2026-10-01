import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ScrollText, 
  ArrowLeft, 
  Filter, 
  ShieldCheck, 
  Clock, 
  User, 
  Globe,
  AlertCircle
} from 'lucide-react';
import { getAuditLogs } from '../../api/auditApi';
import AdminLayout from '../../components/admin/AdminLayout';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

// All action choices from apps/audit/models.py AuditLog.ACTION_CHOICES
const ACTION_CHOICES = [
  { value: '', label: 'All Actions' },
  { value: 'LOGIN_SUCCESS', label: 'Login Success' },
  { value: 'LOGIN_FAILED', label: 'Login Failed' },
  { value: 'APPOINTMENT_BOOKED', label: 'Appointment Booked' },
  { value: 'APPOINTMENT_CANCELLED', label: 'Appointment Cancelled' },
  { value: 'DOCTOR_APPROVED', label: 'Doctor Approved' },
  { value: 'REPORT_UPLOADED', label: 'Report Uploaded' },
  { value: 'CONSULTATION_COMPLETED', label: 'Consultation Completed' },
  { value: 'INVOICE_PAID', label: 'Invoice Paid' },
  { value: 'KB_DOCUMENT_UPLOADED', label: 'KB Document Uploaded' },
  { value: 'KB_DOCUMENT_DELETED', label: 'KB Document Deleted' },
];

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async (filter) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAuditLogs(filter);
      const list = Array.isArray(data) ? data : data.results || [];
      setLogs(list);
    } catch (err) {
      console.error('Failed to load audit logs', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(actionFilter);
  }, [actionFilter]);

  const formatTimestamp = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1 hover:text-[#007ABF] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
              </Link>
              <span>/</span>
              <span className="text-[#007ABF]">Audit Logs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#007ABF]/10 border border-[#007ABF]/20 flex items-center justify-center">
                <ScrollText className="w-5 h-5 text-[#007ABF]" />
              </span>
              MediFlow Audit Logs
            </h1>
            <div className="w-8 h-1 rounded-full bg-[#007ABF] mt-2" />
            <p className="text-slate-500 text-sm mt-2">
              Most recent 100 system events. Filter by action type below.
            </p>
          </div>

          {/* Action filter dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              aria-label="Filter by action type"
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#007ABF] focus:ring-2 focus:ring-[#007ABF]/15 transition-colors shadow-sm"
            >
              {ACTION_CHOICES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Table Container */}
        <div className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 text-sm m-6 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8">
              <EmptyState 
                icon={ScrollText}
                title={`No audit log entries found${actionFilter ? ` for action "${actionFilter}"` : ''}`}
                description="System activities and compliance events will automatically log here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left">
                    <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap font-mono text-xs">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-medium">
                        {log.user_email || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                            log.action.includes('FAILED') || log.action.includes('CANCELLED')
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : log.action.includes('SUCCESS') || log.action.includes('APPROVED') || log.action.includes('PAID')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-[#007ABF] border border-blue-200'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {log.ip_address || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-slate-400 text-xs text-center">
          Showing up to 100 most recent entries. Filter by event type using the dropdown above.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AuditLogsPage;

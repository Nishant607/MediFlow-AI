import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Stethoscope,
  Clock,
  CalendarCheck2,
  Calendar,
  DollarSign,
  Receipt,
  Scissors,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  BellRing,
  UserCheck,
  ChevronRight,
  Activity,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAdminStats } from '../../api/adminApi';
import { listPendingDoctors, approveDoctor } from '../../api/doctorsApi';
import { triggerReminders } from '../../api/notificationsApi';
import { getAllInvoices } from '../../api/billingApi';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminComingSoon from '../../components/admin/AdminComingSoon';
import AnimatedNumber from '../../components/common/AnimatedNumber';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

/* ── Stat card ─────────────────────────────────────────────── */
const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, subtitle, comingSoon = false }) => {
  if (comingSoon) {
    return (
      <AdminComingSoon type="card" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 h-32 flex flex-col justify-between">
        <div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 mb-3 animate-pulse" />
          <div className="h-3 bg-slate-100 rounded w-24 mb-2 animate-pulse" />
          <div className="h-7 bg-slate-100 rounded w-10 animate-pulse" />
        </div>
        <div className="h-3 bg-slate-100 rounded w-32 animate-pulse" />
      </AdminComingSoon>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md p-5 flex flex-col justify-between transition-all h-32"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
          <div className="text-2xl xl:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value !== undefined && value !== null ? (
              typeof value === 'string' ? value : <AnimatedNumber value={Number(value) || 0} />
            ) : (
              '—'
            )}
          </div>
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-4.5 h-4.5 ${iconColor}`} style={{ width: 18, height: 18 }} />
        </div>
      </div>
      {subtitle && <p className="text-[11px] text-slate-400 mt-auto pt-2 border-t border-slate-100">{subtitle}</p>}
    </motion.div>
  );
};

/* ── Pending doctor row (restyle for sidebar shell) ─────────── */
const PendingRow = ({ doctor, onApprove, isApproving }) => {
  const user = doctor.user_detail || doctor.user || {};
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
      <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
        <Stethoscope className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">Dr. {user.full_name || 'Doctor'}</p>
        <p className="text-[11px] text-slate-400 truncate">{doctor.specialization} · {doctor.department_detail?.name || 'General'}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        disabled={isApproving}
        onClick={() => onApprove(doctor.id)}
        className="shrink-0 bg-[#00843D] hover:bg-[#006B31] text-white px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
      >
        {isApproving ? (
          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5" />
        )}
        {isApproving ? 'Approving…' : 'Approve'}
      </motion.button>
    </div>
  );
};

/* ── Main Dashboard ─────────────────────────────────────────── */
const AdminDashboard = () => {
  const { currentUser } = useAuth();

  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [approvingIds, setApprovingIds] = useState([]);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPendingDoctors = async () => {
    setLoadingPending(true);
    try {
      const data = await listPendingDoctors();
      setPendingDoctors(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load pending doctors', err);
    } finally {
      setLoadingPending(false);
    }
  };

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const data = await getAllInvoices();
      setInvoices(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load dashboard invoices', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPendingDoctors();
    fetchInvoices();
  }, []);

  /* ── Computed Analytics from Real Invoices ────────────────── */
  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      months.push({
        key: `${y}-${m}`,
        label: d.toLocaleDateString('en-IN', { month: 'short' }),
        count: 0,
      });
    }
    const map = {};
    months.forEach((m) => {
      map[m.key] = m;
    });
    invoices.forEach((inv) => {
      const dStr = inv.appointment_date || inv.created_at?.slice(0, 10);
      if (!dStr) return;
      const k = dStr.slice(0, 7);
      if (map[k]) {
        map[k].count += 1;
      }
    });
    return Object.values(map);
  }, [invoices]);

  const maxMonthlyCount = Math.max(...monthlyTrend.map((m) => m.count), 1);

  const specialtyStats = useMemo(() => {
    const map = {};
    invoices.forEach((inv) => {
      const spec = inv.doctor_detail?.specialization || 'General Consultation';
      map[spec] = (map[spec] || 0) + 1;
    });
    const total = invoices.length || 1;
    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [invoices]);

  const handleApproveDoctor = async (doctorId) => {
    setApprovingIds((p) => [...p, doctorId]);
    setError('');
    setActionMessage('');
    try {
      await approveDoctor(doctorId);
      setActionMessage('Doctor approved successfully!');
      fetchStats();
      fetchPendingDoctors();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve doctor.');
    } finally {
      setApprovingIds((p) => p.filter((id) => id !== doctorId));
    }
  };

  const handleTriggerReminders = async () => {
    setSendingReminders(true);
    setError('');
    setActionMessage('');
    try {
      const data = await triggerReminders();
      setActionMessage(data?.message || 'Reminders sent successfully!');
      setTimeout(() => setActionMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reminders.');
    } finally {
      setSendingReminders(false);
    }
  };

  /* ── stat card definitions ─────────────────────────────── */
  const statCards = [
    {
      title: 'Total Patients',
      value: stats?.total_patients,
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      subtitle: 'Registered profiles',
    },
    {
      title: 'Approved Doctors',
      value: stats?.total_approved_doctors,
      icon: Stethoscope,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      subtitle: 'Active specialists',
    },
    {
      title: 'Pending Approvals',
      value: stats?.pending_doctor_approvals,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      subtitle: 'Requires review',
    },
    {
      title: 'Total Appointments',
      value: stats?.total_appointments,
      icon: CalendarCheck2,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      subtitle: 'All-time bookings',
    },
    {
      title: "Today's Appointments",
      value: stats?.todays_appointments,
      icon: Calendar,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      subtitle: 'Scheduled today',
    },
    {
      title: 'Total Revenue',
      value: stats?.total_revenue != null ? `₹${stats.total_revenue}` : '₹0',
      icon: DollarSign,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      subtitle: 'Paid invoices',
    },
    {
      title: 'Pending Invoices',
      value: stats?.pending_invoices_count,
      icon: Receipt,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      subtitle: 'Awaiting payment',
    },
    { title: 'Surgeries', comingSoon: true, icon: Scissors },
    { title: 'Bed Occupancy', comingSoon: true, icon: BedDouble },
  ];

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px]">

        {/* ── Toast messages ──────────────────────────── */}
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {actionMessage}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* ── Quick Actions Row ───────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTriggerReminders}
            disabled={sendingReminders}
            className="inline-flex items-center gap-2 bg-[#0EA5C9] hover:bg-[#0B8BAA] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <BellRing className={`w-4 h-4 ${sendingReminders ? 'animate-spin' : ''}`} />
            {sendingReminders ? 'Sending…' : 'Send Reminders'}
          </button>
          <Link
            to="/admin/audit-logs"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            View Audit Logs
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            to="/admin/knowledge-base"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            Manage Knowledge Base
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── 1. STAT CARD ROW ──────────────────────── */}
        {loadingStats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {statCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>
        )}

        {/* ── 2 + 3. MIDDLE ROW: Pending Approvals widget + Diagnosis Insights ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* 2. Pending Doctor Approvals widget */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Pending Doctor Approvals</h3>
                  <p className="text-[11px] text-slate-400">Review and verify new practitioners</p>
                </div>
              </div>
              {pendingDoctors.length > 0 && (
                <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full border border-amber-200 font-bold">
                  {pendingDoctors.length}
                </span>
              )}
            </div>

            <div className="p-3">
              {loadingPending ? (
                <div className="space-y-2 p-2">
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                </div>
              ) : pendingDoctors.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <p className="text-sm font-semibold text-slate-600">All registrations verified</p>
                  <p className="text-xs text-slate-400">No pending approvals right now.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {pendingDoctors.map((doctor) => (
                    <PendingRow
                      key={doctor.id}
                      doctor={doctor}
                      onApprove={handleApproveDoctor}
                      isApproving={approvingIds.includes(doctor.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 pb-4 pt-1">
              <Link
                to="/admin/staff"
                className="text-[#0EA5C9] text-xs font-bold hover:underline inline-flex items-center gap-1"
              >
                View full staff directory
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 3. Clinical Specialization Distribution */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Specialization &amp; Clinical Volume</h3>
                  <p className="text-[11px] text-slate-400">Distribution across active departments</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00843D]" />
                Live Data
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-center">
              {loadingInvoices ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 rounded-xl" />
                  <Skeleton className="h-8 rounded-xl" />
                  <Skeleton className="h-8 rounded-xl" />
                </div>
              ) : specialtyStats.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center gap-2">
                  <Activity className="w-8 h-8 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">No consultation records</p>
                  <p className="text-xs text-slate-400">Department distribution will display as appointments conclude.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {specialtyStats.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">{item.count} {item.count === 1 ? 'visit' : 'visits'}</span>
                          <span className="font-bold text-[#0EA5C9] font-mono text-[11px]">{item.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#0EA5C9] to-teal-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 pb-4 pt-1">
              <Link
                to="/admin/billing"
                className="text-[#0EA5C9] text-xs font-bold hover:underline inline-flex items-center gap-1"
              >
                View detailed analytics &amp; revenue report
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── 4. BOTTOM ROW: Consultation Overview + Patients Overview ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* 4. Consultation Overview — Live Monthly Trend */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                  <CalendarCheck2 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Consultation Trajectory</h3>
                  <p className="text-[11px] text-slate-400">Monthly appointment trend</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wide border border-purple-200">
                6-Mo Trend
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-end">
              {loadingInvoices ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 rounded-xl" />
                </div>
              ) : monthlyTrend.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center gap-2">
                  <CalendarCheck2 className="w-8 h-8 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">No trajectory data</p>
                  <p className="text-xs text-slate-400">Appointment trajectory will display here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-1.5 h-24 pt-2">
                    {monthlyTrend.map((m) => {
                      const heightPercent = maxMonthlyCount > 0 ? (m.count / maxMonthlyCount) * 100 : 0;
                      return (
                        <div key={m.key} className="flex-1 flex flex-col items-center h-full justify-end group">
                          <span className="text-[9px] font-bold text-slate-400 group-hover:text-purple-600 transition-colors">
                            {m.count}
                          </span>
                          <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-16">
                            <div
                              className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                              style={{ height: `${Math.max(heightPercent, m.count > 0 ? 10 : 4)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500 mt-1">
                            {m.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 pb-4 pt-1 border-t border-slate-100">
              <Link
                to="/admin/billing"
                className="text-[#0EA5C9] text-xs font-bold hover:underline inline-flex items-center gap-1"
              >
                Open full revenue report
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 5. Patients Overview Table — Coming Soon */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Patients Overview</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                <Clock className="w-3 h-3" />
                Coming Soon
              </span>
            </div>

            {/* Table header */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Name', 'Last Appointment', 'Age', 'Date of Birth', 'Gender', 'Diagnosis', 'Status'].map(
                      (col) => (
                        <th
                          key={col}
                          className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center">
                      <div className="flex flex-col items-center gap-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                          <Users className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">
                          Detailed patient records table is coming in a future update.
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          No fabricated data — this table will show real patient records once the corresponding API endpoint is available.
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

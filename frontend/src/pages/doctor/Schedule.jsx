import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDoctorSchedule, cancelAppointment } from '../../api/appointmentsApi';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import AnimatedNumber from '../../components/common/AnimatedNumber';

/* ── helpers ─────────────────────────────────────────────── */
const getTodayString = () => new Date().toISOString().split('T')[0];

const getWeekDays = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0=Sun
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day + 6) % 7)); // shift to Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const toDateString = (d) => d.toISOString().split('T')[0];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const statusStyle = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'confirmed':
    case 'scheduled':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    default:
      return 'bg-amber-50 text-amber-700 border border-amber-200';
  }
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/* ── component ───────────────────────────────────────────── */
const DoctorSchedulePage = () => {
  const { currentUser } = useAuth();
  const isApproved = currentUser?.doctor_profile?.is_approved;

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const weekDays = getWeekDays(selectedDate);
  const todayStr = getTodayString();

  const fetchSchedule = async () => {
    if (!isApproved) return;
    setLoading(true);
    setError('');
    try {
      const data = await getDoctorSchedule(selectedDate);
      setAppointments(Array.isArray(data) ? data : data.results || []);
    } catch {
      setError('Failed to load schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate, isApproved]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      setActionMsg('Appointment cancelled successfully.');
      fetchSchedule();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel appointment.');
    }
  };

  /* stat counts */
  const confirmedCount = appointments.filter(
    (a) => ['confirmed', 'scheduled'].includes((a.status || '').toLowerCase())
  ).length;
  const cancelledCount = appointments.filter(
    (a) => (a.status || '').toLowerCase() === 'cancelled'
  ).length;

  return (
    <DoctorLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

        {/* ── PAGE HEADER ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Schedule</h1>
            <p className="text-sm text-slate-500 mt-0.5">View and manage your daily patient appointments</p>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-colors"
          />
        </div>

        {/* ── WEEK STRIP ──────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {weekDays.map((d, i) => {
            const ds = toDateString(d);
            const isActive = ds === selectedDate;
            const isToday = ds === todayStr;
            return (
              <button
                key={ds}
                onClick={() => setSelectedDate(ds)}
                className={`flex flex-col items-center min-w-[56px] px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0EA5C9] text-white border-[#0EA5C9] shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {DAY_LABELS[i]}
                </span>
                <span className="text-base font-extrabold mt-0.5 leading-none">
                  {d.getDate()}
                </span>
                {isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isActive ? 'bg-white' : 'bg-[#0EA5C9]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── STAT CARDS ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Today's Appointments",
              value: appointments.length,
              sub: 'For selected date',
              icon: Calendar,
              iconBg: 'bg-[#E0F4F9]',
              iconColor: 'text-[#0EA5C9]',
              delay: 0,
            },
            {
              label: 'Confirmed',
              value: confirmedCount,
              sub: 'Active bookings',
              icon: CheckCircle2,
              iconBg: 'bg-emerald-50',
              iconColor: 'text-emerald-500',
              delay: 0.06,
            },
            {
              label: 'Cancelled',
              value: cancelledCount,
              sub: 'For selected date',
              icon: XCircle,
              iconBg: 'bg-rose-50',
              iconColor: 'text-rose-500',
              delay: 0.12,
            },
          ].map(({ label, value, sub, icon: Icon, iconBg, iconColor, delay }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay }}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {label}
                </p>
                <p className="text-3xl font-extrabold text-slate-800">
                  <AnimatedNumber value={value} />
                </p>
                <p className="text-xs text-slate-400 mt-1">{sub}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── MESSAGES ────────────────────────────────────── */}
        {actionMsg && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{actionMsg}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* ── APPOINTMENTS LIST ────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Appointments —{' '}
              <span className="text-[#0EA5C9]">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </h2>
            <span className="text-xs font-bold text-slate-400">
              {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="p-6 space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
              </>
            ) : appointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No appointments for this date."
                description="Select another date from the week strip or date picker above."
              />
            ) : (
              appointments.map((appt, idx) => {
                const patientName =
                  appt.patient?.full_name || appt.patient_name || 'Patient';
                const isCancelled =
                  (appt.status || '').toLowerCase() === 'cancelled';

                return (
                  <motion.div
                    key={appt.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3"
                  >
                    {/* Row 1: Avatar + Name + Status */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0EA5C9]/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#0EA5C9]">
                            {getInitials(patientName)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{patientName}</p>
                          {appt.patient?.email && (
                            <p className="text-xs text-slate-400">{appt.patient.email}</p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${statusStyle(
                          appt.status
                        )}`}
                      >
                        {appt.status || 'Pending'}
                      </span>
                    </div>

                    {/* Row 2: Time / Date / Reason */}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      {appt.time && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {appt.time}
                        </span>
                      )}
                      {appt.date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {appt.date}
                        </span>
                      )}
                      {appt.reason && (
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          {appt.reason}
                        </span>
                      )}
                    </div>

                    {/* Row 3: Cancel button */}
                    {!isCancelled && (
                      <div className="pt-1">
                        <button
                          onClick={() => handleCancel(appt.id)}
                          className="text-xs font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorSchedulePage;

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Hourglass,
  ClipboardList,
  CalendarDays,
  RefreshCw,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDoctorSchedule, cancelAppointment, getMyPatientCount } from '../../api/appointmentsApi';
import AppointmentCard from '../../components/patient/AppointmentCard';
import PatientHistoryPanel from '../../components/doctor/PatientHistoryPanel';
import ConsultationForm from '../../components/doctor/ConsultationForm';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import AnimatedNumber from '../../components/common/AnimatedNumber';

/* ── Helpers ──────────────────────────────────────────────── */
const getTodayString = () => new Date().toISOString().split('T')[0];

const addDays = (dateStr, n) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    date: d.getDate(),
  };
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', icon: Sun };
  if (h < 17) return { text: 'Good Afternoon', icon: Sunset };
  return { text: 'Good Evening', icon: Moon };
};

const formatTime12 = (timeStr) => {
  if (!timeStr) return '';
  try {
    return new Date('1970-01-01T' + timeStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timeStr;
  }
};

/* ── Stat Card ────────────────────────────────────────────── */
const StatCard = ({ label, sub, value, icon: Icon, iconBg, iconColor, borderColor, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center gap-4 shadow-sm relative overflow-hidden"
  >
    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${borderColor}`} />
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-3xl font-extrabold text-slate-800 leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  </motion.div>
);

/* ── Main Component ───────────────────────────────────────── */
const DoctorDashboard = () => {
  const { currentUser } = useAuth();
  const isApproved = currentUser?.doctor_profile?.is_approved;

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [weekStart, setWeekStart] = useState(getTodayString()); // anchor for mini-calendar
  const [appointments, setAppointments] = useState([]);
  const [totalPatientsSeen, setTotalPatientsSeen] = useState(0);
  const [activeConsultationAppointment, setActiveConsultationAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchSchedule = async () => {
    if (!isApproved) return;
    setLoading(true);
    setError('');
    try {
      const data = await getDoctorSchedule(selectedDate);
      setAppointments(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError('Failed to fetch doctor schedule.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientCount = async () => {
    if (!isApproved) return;
    try {
      const res = await getMyPatientCount();
      setTotalPatientsSeen(res.total_patients_seen || 0);
    } catch (err) {
      console.error('Failed to fetch patient count', err);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate, isApproved]);

  useEffect(() => {
    fetchPatientCount();
  }, [isApproved]);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this patient appointment?')) return;
    try {
      await cancelAppointment(id);
      setActionMessage('Appointment cancelled.');
      fetchSchedule();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel appointment.');
    }
  };

  /* ── Derived values ───────────────────────────────────────── */
  const pendingCount = useMemo(
    () => appointments.filter((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length,
    [appointments]
  );
  const completedCount = useMemo(
    () => appointments.filter((a) => a.status === 'COMPLETED').length,
    [appointments]
  );
  const cancelledCount = useMemo(
    () => appointments.filter((a) => a.status === 'CANCELLED').length,
    [appointments]
  );

  // Sort appointments by time
  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((a, b) => {
        if (!a.appointment_time) return 1;
        if (!b.appointment_time) return -1;
        return a.appointment_time.localeCompare(b.appointment_time);
      }),
    [appointments]
  );

  // Timeline slot counts
  const morningCount = useMemo(
    () =>
      sortedAppointments.filter((a) => {
        const t = a.appointment_time;
        return t && t < '12:00';
      }).length,
    [sortedAppointments]
  );
  const afternoonCount = useMemo(
    () =>
      sortedAppointments.filter((a) => {
        const t = a.appointment_time;
        return t && t >= '12:00' && t < '17:00';
      }).length,
    [sortedAppointments]
  );
  const eveningCount = useMemo(
    () =>
      sortedAppointments.filter((a) => {
        const t = a.appointment_time;
        return t && t >= '17:00';
      }).length,
    [sortedAppointments]
  );

  /* ── Mini calendar: 7-day window ─────────────────────────── */
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const shiftWeek = (n) => setWeekStart((prev) => addDays(prev, n));

  const today = getTodayString();
  const greeting = getGreeting();
  const GreetIcon = greeting.icon;

  /* ── Formatted date for subtitle ─────────────────────────── */
  const longDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <DoctorLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-6xl mx-auto">

        {/* ── WELCOME HEADER STRIP ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0EA5C9]/5 via-white to-white border border-[#0EA5C9]/15 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#0EA5C9]/10 border border-[#0EA5C9]/20 flex items-center justify-center shrink-0">
              <GreetIcon className="w-5 h-5 text-[#0EA5C9]" />
            </span>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 leading-tight">
                {greeting.text}, Dr. {currentUser?.full_name || 'Doctor'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser?.doctor_profile?.specialization || 'MediFlow Clinician'} · {longDate}
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchSchedule()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0EA5C9] ${loading ? 'animate-spin' : ''}`} />
            Refresh Schedule
          </button>
        </motion.div>

        {/* ── STAT CARDS ROW (4 cards) ────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Today's Appointments"
            sub="Scheduled today"
            value={<AnimatedNumber value={appointments.length} />}
            icon={Calendar}
            iconBg="bg-[#E0F4F9]"
            iconColor="text-[#0EA5C9]"
            borderColor="bg-[#0EA5C9]"
            delay={0}
          />
          <StatCard
            label="Patients Treated"
            sub="Completed consultations"
            value={<AnimatedNumber value={totalPatientsSeen} />}
            icon={Users}
            iconBg="bg-violet-50"
            iconColor="text-violet-500"
            borderColor="bg-violet-400"
            delay={0.06}
          />
          <StatCard
            label="Account Status"
            sub={isApproved ? 'Active practitioner' : 'Awaiting admin approval'}
            value={
              <span className={`text-lg font-extrabold ${isApproved ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isApproved ? 'Verified' : 'Pending'}
              </span>
            }
            icon={Stethoscope}
            iconBg={isApproved ? 'bg-emerald-50' : 'bg-amber-50'}
            iconColor={isApproved ? 'text-emerald-500' : 'text-amber-500'}
            borderColor={isApproved ? 'bg-emerald-400' : 'bg-amber-400'}
            delay={0.12}
          />
          <StatCard
            label="Awaiting Patients"
            sub="Scheduled / Confirmed"
            value={<AnimatedNumber value={pendingCount} />}
            icon={Hourglass}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            borderColor="bg-amber-400"
            delay={0.18}
          />
        </div>

        {/* ── PENDING APPROVAL BANNER ─────────────────────────── */}
        {!isApproved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-3"
          >
            <div className="inline-flex p-4 rounded-full bg-amber-100 border border-amber-200 text-amber-600 mb-2">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-amber-700">Account Pending Approval</h3>
            <p className="text-sm text-amber-600/90 max-w-lg mx-auto">
              Your account is currently pending administrator verification. Full doctor features will unlock once approved.
            </p>
          </motion.div>
        )}

        {/* ── MAIN CONTENT (approved only) ────────────────────── */}
        {isApproved && (
          <div className="space-y-5">

            {/* Action / Error toasts */}
            {actionMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <span>{actionMessage}</span>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Active Consultation Panel */}
            <AnimatePresence>
              {activeConsultationAppointment && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6 border-2 border-[#0EA5C9]/30 p-6 rounded-2xl bg-[#F0FAFB]"
                >
                  <div className="flex items-center gap-3 border-b border-[#0EA5C9]/15 pb-4">
                    <span className="w-9 h-9 rounded-full bg-[#0EA5C9]/10 border border-[#0EA5C9]/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-[#0EA5C9] animate-pulse" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Active Clinical Consultation</h2>
                      <p className="text-xs text-slate-500">Review patient history, lab reports, AI summary, and issue digital prescriptions</p>
                    </div>
                  </div>
                  <PatientHistoryPanel
                    patientId={activeConsultationAppointment.patient?.id || activeConsultationAppointment.patient}
                  />
                  <ConsultationForm
                    appointment={activeConsultationAppointment}
                    onCompleted={() => {
                      setActiveConsultationAppointment(null);
                      fetchSchedule();
                      fetchPatientCount();
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── DAILY SCHEDULE SECTION ──────────────────────── */}
            <div className="bg-white shadow-sm rounded-2xl border border-slate-200/90 overflow-hidden">

              {/* Section Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-800">Daily Patient Schedule</h2>
                    <span className="bg-violet-50 border border-violet-200 text-violet-700 text-xs px-3 py-1 rounded-full font-bold">
                      {totalPatientsSeen} Patients Treated
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Scheduled appointments and consultations for selected date</p>
                </div>

                {/* Mini Week Calendar */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => shiftWeek(-1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  {weekDays.map((day) => {
                    const { day: dayName, date: dateNum } = formatDateLabel(day);
                    const isToday = day === today;
                    const isSelected = day === selectedDate;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(day)}
                        className={`flex flex-col items-center justify-center w-10 h-12 rounded-xl text-center transition-all font-bold text-xs ${
                          isSelected && isToday
                            ? 'bg-[#0EA5C9] text-white shadow-md'
                            : isSelected
                            ? 'bg-slate-800 text-white shadow-md'
                            : isToday
                            ? 'border-2 border-[#0EA5C9] text-[#0EA5C9] bg-white'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span className="text-[9px] uppercase leading-none mb-0.5">{dayName}</span>
                        <span className="text-base leading-none">{dateNum}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => shiftWeek(1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Appointment Status Summary Bar */}
              {!loading && appointments.length > 0 && (
                <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold mr-1">Today's Status:</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Completed: {completedCount}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F4F9] border border-[#0EA5C9]/30 text-[#0B6F87] text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5C9]" />
                    Scheduled: {pendingCount}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Cancelled: {cancelledCount}
                  </span>
                  <span className="ml-auto text-xs text-slate-500 font-bold">
                    {appointments.length} Total
                  </span>
                </div>
              )}

              {/* Timeline Header */}
              {!loading && sortedAppointments.length > 0 && (
                <div className="px-6 py-3 flex flex-wrap gap-3 border-b border-slate-100">
                  {morningCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      Morning · <strong className="text-slate-700">{morningCount}</strong>
                    </span>
                  )}
                  {afternoonCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Sunset className="w-3.5 h-3.5 text-orange-400" />
                      Afternoon · <strong className="text-slate-700">{afternoonCount}</strong>
                    </span>
                  )}
                  {eveningCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      Evening · <strong className="text-slate-700">{eveningCount}</strong>
                    </span>
                  )}
                </div>
              )}

              {/* Appointment Cards */}
              <div className="p-6">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-44 rounded-2xl" />
                    <Skeleton className="h-44 rounded-2xl" />
                  </div>
                ) : sortedAppointments.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title={`No appointments scheduled for ${selectedDate}.`}
                    description="Use the calendar above to inspect schedules for different clinic days."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedAppointments.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        isDoctorView={true}
                        onCancel={handleCancelAppointment}
                        onStartConsultation={(selectedAppt) =>
                          setActiveConsultationAppointment(selectedAppt)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── QUICK ACTIONS PANEL ──────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  to: '/doctor/patients',
                  icon: Users,
                  label: 'My Patients',
                  sub: 'View full patient roster',
                  color: 'text-violet-600',
                  bg: 'bg-violet-50',
                  border: 'border-violet-100',
                },
                {
                  to: '/doctor/consultations',
                  icon: ClipboardList,
                  label: 'All Consultations',
                  sub: 'Browse completed notes',
                  color: 'text-[#0EA5C9]',
                  bg: 'bg-[#E0F4F9]',
                  border: 'border-[#0EA5C9]/20',
                },
                {
                  to: '/doctor/schedule',
                  icon: CalendarDays,
                  label: 'Full Schedule',
                  sub: 'Manage availability & slots',
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                  border: 'border-emerald-100',
                },
              ].map(({ to, icon: Icon, label, sub, color, bg, border }) => (
                <motion.div
                  key={to}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.18 }}
                >
                  <Link
                    to={to}
                    className="flex items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 hover:shadow-md transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg} border ${border}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-[#0EA5C9] transition-colors">{label}</p>
                      <p className="text-xs text-slate-400">{sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 ml-auto shrink-0 group-hover:text-[#0EA5C9] transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </div>

          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;

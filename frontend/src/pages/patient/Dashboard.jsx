import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarPlus,
  Calendar,
  FileText,
  CreditCard,
  Bot,
  AlertOctagon,
  ArrowRight,
  User,
  HeartPulse,
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyAppointments } from '../../api/appointmentsApi';
import PageWrapper from '../../components/common/PageWrapper';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ClevelandClinicSections from '../../components/patient/ClevelandClinicSections';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/* ── Date and Time Formatters ── */
const formatApptDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dateStr;
  }
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

/* ── Daily Health Tips (Rotating by day of week) ── */
const HEALTH_TIPS = [
  'Stay hydrated — aim for at least 8 glasses of pure water today.',
  'A brisk 10-minute walk after meals aids digestion and steady metabolism.',
  'Prioritize 7–8 hours of sound sleep for cellular recovery and immunity.',
  'Take 5 minutes of focused breathing to soothe stress and stabilize heart rate.',
  'Incorporate fresh seasonal fruits and greens into each meal for vital micronutrients.',
  'Stay up to date with routine annual preventive health screenings.',
  'Unwind without screens 30 minutes before sleep for deeper restorative rest.',
];

const PatientDashboard = () => {
  const { currentUser } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setApptLoading(true);
      try {
        const [upcomingData, pastData] = await Promise.all([
          getMyAppointments('upcoming').catch(() => []),
          getMyAppointments('past').catch(() => []),
        ]);
        const upList = Array.isArray(upcomingData) ? upcomingData : upcomingData?.results || [];
        const pastList = Array.isArray(pastData) ? pastData : pastData?.results || [];
        setUpcomingAppointments(upList);
        setPastAppointments(pastList);
      } catch (err) {
        console.error('Failed to load appointments', err);
      } finally {
        setApptLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const upcomingCount = upcomingAppointments.length;
  const pastCount = pastAppointments.length;

  const sortedUpcoming = useMemo(() => {
    return [...upcomingAppointments].sort((a, b) => {
      const da = `${a.appointment_date || ''} ${a.appointment_time || ''}`;
      const db = `${b.appointment_date || ''} ${b.appointment_time || ''}`;
      return da.localeCompare(db);
    });
  }, [upcomingAppointments]);

  const dailyTip = useMemo(() => {
    const day = new Date().getDay();
    return HEALTH_TIPS[day % HEALTH_TIPS.length];
  }, []);

  return (
    <PageWrapper className="p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HERO BANNER - Exact Match to Reference Design */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-clinic overflow-hidden bg-[#E9E8EC]"
        >
          {/* Top Banner with Background Image & Doctor */}
          <div 
            className="relative w-full bg-no-repeat bg-right bg-cover sm:bg-contain lg:bg-cover min-h-[340px] sm:min-h-[380px] lg:min-h-[400px] flex items-center"
            style={{
              backgroundImage: "url('/hero_top_bg.png')",
              backgroundColor: '#E8E7EB',
            }}
          >
            {/* Subtle soft gradient on mobile/tablet to guarantee text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#EAE9ED] via-[#EAE9ED]/85 to-transparent sm:via-[#EAE9ED]/60 lg:via-transparent pointer-events-none" />

            {/* Left Content Column */}
            <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-xl">
              {/* Personalized Welcome Badge + Tagline */}
              <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-[#005A9C] border border-blue-200/70 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#007ABF] animate-pulse" />
                  Welcome, {currentUser?.full_name || 'Patient'}
                </span>
                <span className="text-xs sm:text-sm font-extrabold tracking-[0.22em] text-[#0084C7] uppercase font-sans">
                  CARING FOR LIFE
                </span>
              </div>

              {/* Big Serif Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-bold font-serif text-[#1F2B6C] leading-[1.15] mb-6 tracking-tight">
                Leading the Way <br />
                in Medical Excellence
              </h1>

              {/* Connected CTA Button: Scrolls down to Services */}
              <div>
                <a
                  href="#services-grid"
                  className="inline-flex items-center gap-2 bg-[#BFD2F8] hover:bg-[#A9C3F5] text-[#1F2B6C] px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs"
                >
                  <span>Our Services</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* DOCKED BOTTOM ACTION CARDS (3 Connected Buttons in Exact Color Palette) */}
          <div className="grid grid-cols-1 md:grid-cols-3 w-full border-t border-slate-200/90">
            {/* Card 1: Dark Navy Blue (#1F2B6C) */}
            <Link
              to="/patient/book-appointment"
              className="bg-[#1F2B6C] hover:bg-[#182358] text-white p-5 sm:p-6 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="font-bold text-sm sm:text-base block group-hover:translate-x-1 transition-transform">
                  Book an Appointment
                </span>
                <span className="text-[11px] text-white/70">
                  Select doctor &amp; preferred time slot
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-white/30 bg-white/10 text-white group-hover:scale-110 transition-transform shrink-0 ml-3">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </Link>

            {/* Card 2: Pastel Light Blue (#BFD2F8) */}
            <Link
              to="/patient/book-appointment"
              className="bg-[#BFD2F8] hover:bg-[#AAC5F5] text-[#1F2B6C] p-5 sm:p-6 transition-all flex items-center justify-between group cursor-pointer border-t md:border-t-0 md:border-l md:border-r border-blue-200"
            >
              <div>
                <span className="font-bold text-sm sm:text-base block group-hover:translate-x-1 transition-transform">
                  Our Doctors &amp; Specialists
                </span>
                <span className="text-[11px] text-[#1F2B6C]/70">
                  Browse clinical departments
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-[#1F2B6C]/25 bg-white/40 text-[#1F2B6C] group-hover:scale-110 transition-transform shrink-0 ml-3">
                <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </Link>

            {/* Card 3: Vibrant Cyan Blue (#159EEC) */}
            <Link
              to="/patient/billing"
              className="bg-[#159EEC] hover:bg-[#0D8CD5] text-white p-5 sm:p-6 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="font-bold text-sm sm:text-base block group-hover:translate-x-1 transition-transform">
                  Invoices &amp; Billing
                </span>
                <span className="text-[11px] text-white/80">
                  View consultation fees &amp; receipts
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-white/30 bg-white/15 text-white group-hover:scale-110 transition-transform shrink-0 ml-3">
                <CreditCard className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </Link>
          </div>
        </motion.div>

        {/* ── PERSONAL STATS STRIP ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18 }}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-clinic p-5 flex items-center gap-4 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-[#0EA5C9]" />
            <div className="w-11 h-11 rounded-xl bg-[#E0F4F9] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#0EA5C9]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Upcoming Visits</p>
              <p className="text-2xl font-extrabold text-slate-800">
                {apptLoading ? <span className="inline-block w-8 h-6 bg-slate-100 rounded animate-pulse" /> : upcomingCount}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Scheduled appointments</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18 }}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-clinic p-5 flex items-center gap-4 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-[#00843D]" />
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#00843D]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Past Consultations</p>
              <p className="text-2xl font-extrabold text-slate-800">
                {apptLoading ? <span className="inline-block w-8 h-6 bg-slate-100 rounded animate-pulse" /> : pastCount}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Completed visits</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18 }}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-clinic p-5 flex items-center gap-4 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-purple-500" />
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Billing &amp; Invoices</p>
              <Link
                to="/patient/billing"
                className="text-xs font-bold text-[#005A9C] hover:underline flex items-center gap-1 mt-1"
              >
                <span>View Invoices</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <p className="text-[11px] text-slate-400 mt-0.5">Check fees &amp; receipts</p>
            </div>
          </motion.div>
        </div>

        {/* ── UPCOMING APPOINTMENTS AT A GLANCE ────────────────── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-clinic p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#005A9C]/10 border border-[#005A9C]/20 flex items-center justify-center text-[#005A9C]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">
                  Upcoming Appointments at a Glance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your next scheduled consultations with clinical specialists
                </p>
              </div>
            </div>
            <Link
              to="/patient/appointments"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#005A9C] hover:text-[#00477D] transition-colors"
            >
              <span>View All ({upcomingCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {apptLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-36 rounded-2xl" />
              <Skeleton className="h-36 rounded-2xl" />
              <Skeleton className="h-36 rounded-2xl" />
            </div>
          ) : sortedUpcoming.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005A9C] mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No upcoming appointments</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                You don't have any appointments scheduled. Book a visit with one of our experienced doctors.
              </p>
              <Link
                to="/patient/book-appointment"
                className="inline-flex items-center gap-2 bg-[#005A9C] hover:bg-[#00477D] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <CalendarPlus className="w-4 h-4" />
                Book an Appointment
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedUpcoming.slice(0, 3).map((appt) => {
                const isConfirmed = appt.status === 'CONFIRMED' || appt.status === 'SCHEDULED';
                return (
                  <motion.div
                    key={appt.id}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.18 }}
                    className="bg-slate-50/70 hover:bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0EA5C9]" />
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-[#005A9C] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                          #{appt.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {appt.status || 'SCHEDULED'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        Dr. {appt.doctor_detail?.user_full_name || 'Specialist'}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Stethoscope className="w-3.5 h-3.5 text-[#0EA5C9] shrink-0" />
                        <span className="truncate">{appt.doctor_detail?.specialization || 'General Consultation'}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatApptDate(appt.appointment_date)}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatTime12(appt.appointment_time)}
                        </p>
                      </div>
                      <Link
                        to="/patient/appointments"
                        className="text-xs font-bold text-[#0EA5C9] hover:text-[#0B8BAA] hover:underline"
                      >
                        Details &rarr;
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── DAILY HEALTH TIP BANNER ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0EA5C9]/10 via-[#005A9C]/5 to-transparent border border-[#0EA5C9]/20 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-[#0EA5C9]/30 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-[#0EA5C9]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0EA5C9] bg-white px-2 py-0.5 rounded-full border border-[#0EA5C9]/20">
                Daily Health Tip
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-700">
              {dailyTip}
            </p>
          </div>
        </motion.div>

        {/* SECTION HEADER FOR CLINICAL SERVICES */}
        <div id="services-grid" className="pt-2 text-center max-w-xl mx-auto space-y-1.5 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-800 tracking-tight">
            Patient Care &amp; Clinical Services
          </h2>
          <div className="w-10 h-1 bg-[#007ABF] rounded-full mx-auto" />
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Access your appointments, diagnostic reports, AI support, and emergency services.
          </p>
        </div>

        {/* Action Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Card 1: Book an Appointment */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-clinic hover:shadow-clinic-hover flex flex-col justify-between space-y-5 transition-all"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005A9C] mb-4 shadow-sm">
                <CalendarPlus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Book an Appointment</h3>
              <div className="w-8 h-1 bg-[#005A9C] rounded-full my-2" />
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-1.5">
                Find specialists, choose your preferred date, and book available clinic slots.
              </p>
            </div>
            <Link
              to="/patient/book-appointment"
              className="inline-flex items-center gap-2 bg-[#005A9C] hover:bg-[#00477D] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow w-fit mt-2"
            >
              Book Now &rarr;
            </Link>
          </motion.div>

          {/* Card 2: My Appointments */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-clinic hover:shadow-clinic-hover flex flex-col justify-between space-y-5 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005A9C] shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <Badge variant="brand" dot>
                  {upcomingCount} Upcoming
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">My Appointments</h3>
              <div className="w-8 h-1 bg-[#005A9C] rounded-full my-2" />
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-1.5">
                View your upcoming doctor visits, past medical history, or cancel scheduled appointments.
              </p>
            </div>
            <Link
              to="/patient/appointments"
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-bold transition-all w-fit mt-2"
            >
              View Appointments &rarr;
            </Link>
          </motion.div>

          {/* Card 3: Medical Records */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-clinic hover:shadow-clinic-hover flex flex-col justify-between space-y-5 transition-all"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00843D] mb-4 shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Medical Records</h3>
              <div className="w-8 h-1 bg-[#00843D] rounded-full my-2" />
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-1.5">
                Upload lab reports, download medical files, and view your doctor prescriptions.
              </p>
            </div>
            <Link
              to="/patient/medical-records"
              className="inline-flex items-center gap-2 bg-[#00843D] hover:bg-[#006B31] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow w-fit mt-2"
            >
              View &amp; Upload Records &rarr;
            </Link>
          </motion.div>

          {/* Card 4: Billing & Invoices */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-clinic hover:shadow-clinic-hover flex flex-col justify-between space-y-5 transition-all"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 mb-4 shadow-sm">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Billing &amp; Invoices</h3>
              <div className="w-8 h-1 bg-purple-600 rounded-full my-2" />
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-1.5">
                Pay consultation fees, view transaction history, and download invoice details.
              </p>
            </div>
            <Link
              to="/patient/billing"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow w-fit mt-2"
            >
              View Invoices &rarr;
            </Link>
          </motion.div>

          {/* Card 5: AI Assistant */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-clinic hover:shadow-clinic-hover flex flex-col justify-between space-y-5 transition-all"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 mb-4 shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">AI Assistant</h3>
              <div className="w-8 h-1 bg-sky-600 rounded-full my-2" />
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-1.5">
                Ask about MediFlow policies, visiting hours, insurance coverage, and guidelines.
              </p>
            </div>
            <Link
              to="/patient/ai-assistant"
              className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow w-fit mt-2"
            >
              Chat with AI &rarr;
            </Link>
          </motion.div>

          {/* Card 6: Emergency Help */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-rose-50/70 p-6 sm:p-7 rounded-2xl border border-rose-200 shadow-clinic hover:shadow-clinic-hover flex flex-col justify-between space-y-5 transition-all"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 mb-4 shadow-sm">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-rose-800 font-display flex items-center gap-2">
                Emergency Help
              </h3>
              <div className="w-8 h-1 bg-rose-600 rounded-full my-2" />
              <p className="text-rose-900/80 text-xs sm:text-sm leading-relaxed mt-1.5">
                Access emergency department, ambulance, and helpline contact numbers instantly.
              </p>
            </div>
            <Link
              to="/patient/emergency"
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow w-fit mt-2"
            >
              View Emergency Contacts &rarr;
            </Link>
          </motion.div>
        </motion.div>

        {/* CLINIC SECTIONS & STORIES (Cleveland Clinic Style Experience) */}
        <ClevelandClinicSections />
      </div>
    </PageWrapper>
  );
};

export default PatientDashboard;

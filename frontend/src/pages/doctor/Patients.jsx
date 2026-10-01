import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  CheckCircle2,
  Search,
  FileText,
  X,
  AlertCircle,
  Eye,
  Clock,
  Phone,
  User,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDoctorSchedule, getMyPatientCount } from '../../api/appointmentsApi';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import PatientHistoryPanel from '../../components/doctor/PatientHistoryPanel';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import AnimatedNumber from '../../components/common/AnimatedNumber';

/* ── helpers ─────────────────────────────────────────────── */
const getTodayString = () => new Date().toISOString().split('T')[0];

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const statusStyle = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'SCHEDULED':
    case 'CONFIRMED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'COMPLETED':
      return 'bg-blue-50 text-[#0EA5C9] border-blue-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
};

const DoctorPatientsPage = () => {
  const { currentUser } = useAuth();
  const isApproved = currentUser?.doctor_profile?.is_approved;

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [appointments, setAppointments] = useState([]);
  const [totalPatientsSeen, setTotalPatientsSeen] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientForRecords, setSelectedPatientForRecords] = useState(null);

  const fetchScheduleAndCount = async () => {
    if (!isApproved) return;
    setLoading(true);
    setError('');
    try {
      const [scheduleData, countData] = await Promise.all([
        getDoctorSchedule(selectedDate),
        getMyPatientCount().catch(() => ({ total_patients_seen: 0 })),
      ]);

      const appts = Array.isArray(scheduleData)
        ? scheduleData
        : scheduleData.results || [];
      setAppointments(appts);
      setTotalPatientsSeen(countData?.total_patients_seen || 0);
    } catch (err) {
      console.error('Failed to fetch patient data', err);
      setError('Could not load patient directory. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleAndCount();
  }, [selectedDate, isApproved]);

  /* ── Filtered Patients ───────────────────────────────────── */
  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments;
    const q = searchQuery.toLowerCase();
    return appointments.filter((appt) => {
      const patientName =
        appt.patient_detail?.user_full_name ||
        appt.patient?.full_name ||
        appt.patient_name ||
        '';
      const patientPhone = appt.patient?.phone || '';
      const reason = appt.reason || '';
      return (
        patientName.toLowerCase().includes(q) ||
        patientPhone.toLowerCase().includes(q) ||
        reason.toLowerCase().includes(q)
      );
    });
  }, [appointments, searchQuery]);

  const scheduledCount = appointments.filter(
    (a) => (a.status || '').toUpperCase() === 'SCHEDULED'
  ).length;

  return (
    <DoctorLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

        {/* ── Page Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Patients</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Directory of assigned patients, clinical records &amp; medical history
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-colors"
            />
            <button
              onClick={fetchScheduleAndCount}
              title="Refresh directory"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── 3 Stat Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Patients */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Total Patients Treated
              </p>
              <p className="text-3xl font-extrabold text-slate-800">
                <AnimatedNumber value={totalPatientsSeen} />
              </p>
              <p className="text-xs text-slate-400 mt-1">Lifetime consultations</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </motion.div>

          {/* Today's Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Patients On Schedule
              </p>
              <p className="text-3xl font-extrabold text-slate-800">
                <AnimatedNumber value={appointments.length} />
              </p>
              <p className="text-xs text-slate-400 mt-1">For selected date</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#E0F4F9] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#0EA5C9]" />
            </div>
          </motion.div>

          {/* Confirmed / Scheduled */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Consultation Ready
              </p>
              <p className="text-3xl font-extrabold text-slate-800">
                <AnimatedNumber value={scheduledCount} />
              </p>
              <p className="text-xs text-slate-400 mt-1">Awaiting examination</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </motion.div>
        </div>

        {/* ── Error Banner ─────────────────────────────────── */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Patient Directory Container ──────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient by name, phone, or reason..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
              />
            </div>

            <span className="text-xs font-bold text-slate-400">
              {filteredAppointments.length} Patient{filteredAppointments.length !== 1 ? 's' : ''} Listed
            </span>
          </div>

          {/* Directory Content */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No patients found"
                description={
                  searchQuery
                    ? `No patient records matching "${searchQuery}".`
                    : 'No patients scheduled for this date. Change the date picker above to inspect other clinic days.'
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((appt, idx) => {
                  const patientId = appt.patient?.id || appt.patient;
                  const patientName =
                    appt.patient_detail?.user_full_name ||
                    appt.patient?.full_name ||
                    appt.patient_name ||
                    'Patient';
                  const patientPhone = appt.patient?.phone;
                  const gender = appt.patient?.gender;
                  const dob = appt.patient?.date_of_birth;

                  return (
                    <motion.div
                      key={appt.id || idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                    >
                      {/* Left: Avatar & Personal Info */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-[#0EA5C9]/10 border border-[#0EA5C9]/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#0EA5C9]">
                            {getInitials(patientName)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {patientName}
                            </p>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${statusStyle(
                                appt.status
                              )}`}
                            >
                              {appt.status || 'Scheduled'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                            {patientPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {patientPhone}
                              </span>
                            )}
                            {gender && (
                              <span className="capitalize text-slate-400">
                                {gender}
                              </span>
                            )}
                            {dob && (
                              <span className="text-slate-400">
                                DOB: {dob}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Appointment Details */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 md:border-l md:border-slate-200 md:pl-6">
                        {appt.appointment_time && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#0EA5C9]" />
                            <span className="font-semibold">{appt.appointment_time}</span>
                          </div>
                        )}
                        {appt.reason && (
                          <div className="flex items-center gap-1.5 max-w-xs text-slate-500 truncate">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{appt.reason}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Action Button */}
                      <div className="shrink-0 flex items-center gap-2">
                        {patientId ? (
                          <button
                            onClick={() =>
                              setSelectedPatientForRecords({
                                id: patientId,
                                name: patientName,
                              })
                            }
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#E0F4F9] text-[#0B7EA0] hover:bg-[#c9edf7] transition-all shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Medical Records
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No profile linked
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── MEDICAL RECORDS MODAL ────────────────────────── */}
        <AnimatePresence>
          {selectedPatientForRecords && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPatientForRecords(null)}
                className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.2 }}
                className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10"
              >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0EA5C9] text-white flex items-center justify-center font-bold text-sm">
                      {getInitials(selectedPatientForRecords.name)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {selectedPatientForRecords.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Patient ID #{selectedPatientForRecords.id} • Clinical Dossier
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPatientForRecords(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body: PatientHistoryPanel */}
                <div className="p-6 overflow-y-auto flex-1 bg-[#F8FAFC]">
                  <PatientHistoryPanel patientId={selectedPatientForRecords.id} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DoctorLayout>
  );
};

export default DoctorPatientsPage;

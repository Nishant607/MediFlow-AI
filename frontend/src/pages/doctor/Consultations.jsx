import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  Clock,
  CheckCircle2,
  Search,
  Calendar,
  FileText,
  Activity,
  AlertCircle,
  X,
  RefreshCw,
  Eye,
  Pill,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDoctorSchedule, getMyPatientCount } from '../../api/appointmentsApi';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import ConsultationForm from '../../components/doctor/ConsultationForm';
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
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'COMPLETED':
      return 'bg-blue-50 text-[#0EA5C9] border-blue-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
};

const DoctorConsultationsPage = () => {
  const { currentUser } = useAuth();
  const isApproved = currentUser?.doctor_profile?.is_approved;

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [appointments, setAppointments] = useState([]);
  const [totalPatientsSeen, setTotalPatientsSeen] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, SCHEDULED, COMPLETED
  const [activeSessionAppointment, setActiveSessionAppointment] = useState(null);
  const [selectedPatientForRecords, setSelectedPatientForRecords] = useState(null);

  const fetchData = async () => {
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
      console.error('Failed to load consultation data', err);
      setError('Could not fetch consultation sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, isApproved]);

  /* ── Filtered list ───────────────────────────────────────── */
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const status = (appt.status || '').toUpperCase();
      if (filterTab === 'SCHEDULED' && status !== 'SCHEDULED') return false;
      if (filterTab === 'COMPLETED' && status !== 'COMPLETED') return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const patientName =
        appt.patient_detail?.user_full_name ||
        appt.patient?.full_name ||
        appt.patient_name ||
        '';
      const reason = appt.reason || '';
      return (
        patientName.toLowerCase().includes(q) ||
        reason.toLowerCase().includes(q)
      );
    });
  }, [appointments, filterTab, searchQuery]);

  const scheduledCount = appointments.filter(
    (a) => (a.status || '').toUpperCase() === 'SCHEDULED'
  ).length;

  const completedCount = appointments.filter(
    (a) => (a.status || '').toUpperCase() === 'COMPLETED'
  ).length;

  return (
    <DoctorLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

        {/* ── Page Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Consultations
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Conduct examinations, review patient histories &amp; issue digital prescriptions
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
              onClick={fetchData}
              title="Refresh consultations"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── 3 Stat Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Consultations */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Total Consultations Done
              </p>
              <p className="text-3xl font-extrabold text-slate-800">
                <AnimatedNumber value={totalPatientsSeen} />
              </p>
              <p className="text-xs text-slate-400 mt-1">Completed clinical cases</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
            </div>
          </motion.div>

          {/* Ready For Consultation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Ready For Consultation
              </p>
              <p className="text-3xl font-extrabold text-slate-800">
                <AnimatedNumber value={scheduledCount} />
              </p>
              <p className="text-xs text-slate-400 mt-1">Waiting in today's queue</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#E0F4F9] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#0EA5C9]" />
            </div>
          </motion.div>

          {/* Completed Today */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Completed Today
              </p>
              <p className="text-3xl font-extrabold text-slate-800">
                <AnimatedNumber value={completedCount} />
              </p>
              <p className="text-xs text-slate-400 mt-1">Examined &amp; prescribed</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
          </motion.div>
        </div>

        {/* ── ACTIVE CONSULTATION WORKSPACE ────────────────── */}
        <AnimatePresence>
          {activeSessionAppointment && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              className="border-2 border-[#0EA5C9]/40 bg-[#F0FAFB] p-6 sm:p-7 rounded-3xl space-y-6 shadow-md"
            >
              {/* Active Session Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0EA5C9]/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0EA5C9] text-white flex items-center justify-center shadow-sm">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <h2 className="text-lg font-bold text-slate-900">
                        Active Consultation Session
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Patient:{' '}
                      <strong className="text-slate-800">
                        {activeSessionAppointment.patient_detail?.user_full_name ||
                          activeSessionAppointment.patient?.full_name ||
                          'Patient'}
                      </strong>{' '}
                      • {activeSessionAppointment.appointment_time}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveSessionAppointment(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Close Session
                </button>
              </div>

              {/* Patient History & Diagnostic AI */}
              <PatientHistoryPanel
                patientId={
                  activeSessionAppointment.patient?.id ||
                  activeSessionAppointment.patient
                }
              />

              {/* Consultation Rx Form */}
              <ConsultationForm
                appointment={activeSessionAppointment}
                onCompleted={() => {
                  setActiveSessionAppointment(null);
                  fetchData();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error Banner ─────────────────────────────────── */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* ── CONSULTATIONS QUEUE & DIRECTORY ──────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Toolbar with Filter Tabs and Search */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
              {[
                { key: 'ALL', label: `All (${appointments.length})` },
                { key: 'SCHEDULED', label: `Ready (${scheduledCount})` },
                { key: 'COMPLETED', label: `Completed (${completedCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterTab === tab.key
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient or chief complaint..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <EmptyState
                icon={Stethoscope}
                title="No consultations found"
                description={
                  searchQuery
                    ? `No patient records match "${searchQuery}".`
                    : 'No consultations match the selected filter for this date.'
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
                  const isScheduled =
                    (appt.status || '').toUpperCase() === 'SCHEDULED';
                  const isCompleted =
                    (appt.status || '').toUpperCase() === 'COMPLETED';

                  return (
                    <motion.div
                      key={appt.id || idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                    >
                      {/* Left: Avatar & Patient Info */}
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
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize border ${statusStyle(
                                appt.status
                              )}`}
                            >
                              {appt.status || 'Scheduled'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                            {appt.appointment_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#0EA5C9]" />
                                {appt.appointment_time}
                              </span>
                            )}
                            {appt.reason && (
                              <span className="flex items-center gap-1 text-slate-600 truncate max-w-xs sm:max-w-md">
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{appt.reason}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="shrink-0 flex items-center gap-2.5">
                        {isScheduled && (
                          <button
                            onClick={() => {
                              setActiveSessionAppointment(appt);
                              window.scrollTo({ top: 180, behavior: 'smooth' });
                            }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0EA5C9] hover:bg-[#0B7EA0] text-white shadow-sm hover:shadow transition-all"
                          >
                            <Stethoscope className="w-4 h-4" />
                            Start Consultation
                          </button>
                        )}

                        {isCompleted && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#0B7EA0] border border-blue-200 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Prescription Issued
                          </span>
                        )}

                        {patientId && (
                          <button
                            onClick={() =>
                              setSelectedPatientForRecords({
                                id: patientId,
                                name: patientName,
                              })
                            }
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            History
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── MODAL FOR PATIENT HISTORY / DOSSIER ───────────── */}
        <AnimatePresence>
          {selectedPatientForRecords && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPatientForRecords(null)}
                className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.2 }}
                className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10"
              >
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

export default DoctorConsultationsPage;

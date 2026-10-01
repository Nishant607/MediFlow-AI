import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Users,
  Sparkles,
  Search,
  Calendar,
  RefreshCw,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Clock,
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

const DoctorMedicalRecordsPage = () => {
  const { currentUser } = useAuth();
  const isApproved = currentUser?.doctor_profile?.is_approved;

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [appointments, setAppointments] = useState([]);
  const [totalPatientsSeen, setTotalPatientsSeen] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

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

      // Auto-select first patient if available
      if (appts.length > 0) {
        const first = appts[0];
        const pId = first.patient?.id || first.patient;
        if (pId) {
          setSelectedPatient({
            id: pId,
            name:
              first.patient_detail?.user_full_name ||
              first.patient?.full_name ||
              first.patient_name ||
              'Patient',
            phone: first.patient?.phone,
            gender: first.patient?.gender,
            dob: first.patient?.date_of_birth,
            time: first.appointment_time,
            reason: first.reason,
          });
        }
      } else {
        setSelectedPatient(null);
      }
    } catch (err) {
      console.error('Failed to load medical records data', err);
      setError('Could not retrieve medical records directory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, isApproved]);

  /* ── Filtered patient list ───────────────────────────────── */
  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments;
    const q = searchQuery.toLowerCase();
    return appointments.filter((appt) => {
      const name =
        appt.patient_detail?.user_full_name ||
        appt.patient?.full_name ||
        appt.patient_name ||
        '';
      const reason = appt.reason || '';
      return name.toLowerCase().includes(q) || reason.toLowerCase().includes(q);
    });
  }, [appointments, searchQuery]);

  return (
    <DoctorLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

        {/* ── Page Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Medical Records
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Access patient clinical records, diagnostic lab tests, history &amp; AI summaries
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
              title="Refresh records"
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
                Total Patients On File
              </p>
              <p className="text-3xl font-extrabold text-slate-800">
                <AnimatedNumber value={totalPatientsSeen} />
              </p>
              <p className="text-xs text-slate-400 mt-1">Verified patient dossiers</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#E0F4F9] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-[#0EA5C9]" />
            </div>
          </motion.div>

          {/* Patients On Schedule */}
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
              <p className="text-xs text-slate-400 mt-1">Available for medical review</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </motion.div>

          {/* AI Clinical Diagnostic Engine */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Clinical AI Diagnostics
              </p>
              <p className="text-lg font-extrabold text-slate-800 mt-1">Active</p>
              <p className="text-xs text-slate-400 mt-1">AI summary generator enabled</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
          </motion.div>
        </div>

        {/* ── Error Alert ──────────────────────────────────── */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* ── 2-COLUMN MEDICAL DOSSIER EXPLORER ────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Patient Directory Selector */}
          <div className="w-full lg:w-80 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden shrink-0">
            {/* Search Box */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter patients..."
                  className="bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Patients List */}
            <div className="p-3 max-h-[580px] overflow-y-auto space-y-1.5">
              {loading ? (
                <div className="space-y-2 p-2">
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="py-10 text-center px-4">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">
                    No patients on this date
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select another day using the date picker above.
                  </p>
                </div>
              ) : (
                filteredAppointments.map((appt) => {
                  const pId = appt.patient?.id || appt.patient;
                  const pName =
                    appt.patient_detail?.user_full_name ||
                    appt.patient?.full_name ||
                    appt.patient_name ||
                    'Patient';
                  const isSelected = selectedPatient?.id === pId;

                  return (
                    <button
                      key={appt.id}
                      onClick={() =>
                        setSelectedPatient({
                          id: pId,
                          name: pName,
                          phone: appt.patient?.phone,
                          gender: appt.patient?.gender,
                          dob: appt.patient?.date_of_birth,
                          time: appt.appointment_time,
                          reason: appt.reason,
                        })
                      }
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#E0F4F9] border-[#0EA5C9] shadow-xs'
                          : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected
                              ? 'bg-[#0EA5C9] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {getInitials(pName)}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-[#0B7EA0]' : 'text-slate-800'
                            }`}
                          >
                            {pName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {appt.appointment_time || 'Scheduled'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-[#0EA5C9] translate-x-0.5' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Full Patient Medical Dossier */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {selectedPatient?.id ? (
              <div className="space-y-6">
                {/* Patient Dossier Header */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0EA5C9] text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {getInitials(selectedPatient.name)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">
                          {selectedPatient.name}
                        </h2>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified Patient File
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        <span>Patient ID #{selectedPatient.id}</span>
                        {selectedPatient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {selectedPatient.phone}
                          </span>
                        )}
                        {selectedPatient.gender && (
                          <span className="capitalize text-slate-400">
                            Gender: {selectedPatient.gender}
                          </span>
                        )}
                        {selectedPatient.dob && (
                          <span className="text-slate-400">
                            DOB: {selectedPatient.dob}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedPatient.reason && (
                    <div className="text-xs bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 max-w-xs">
                      <span className="font-semibold text-slate-700 block text-[11px] mb-0.5">
                        Chief Complaint:
                      </span>
                      {selectedPatient.reason}
                    </div>
                  )}
                </div>

                {/* Patient History Panel (Lab Reports + Rx + AI Summary) */}
                <PatientHistoryPanel patientId={selectedPatient.id} />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-12 text-center">
                <EmptyState
                  icon={FileText}
                  title="No patient selected"
                  description="Choose a patient from the left directory to examine their medical records, lab tests, and past prescriptions."
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </DoctorLayout>
  );
};

export default DoctorMedicalRecordsPage;

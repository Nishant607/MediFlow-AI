import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Stethoscope,
  ChevronRight,
  LogOut,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDepartments } from '../../api/authApi';
import { listDoctors, getAvailableSlots } from '../../api/doctorsApi';
import { bookAppointment } from '../../api/appointmentsApi';
import DoctorCard from '../../components/patient/DoctorCard';
import SlotPicker from '../../components/patient/SlotPicker';
import PageWrapper from '../../components/common/PageWrapper';

const BookAppointment = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const getTodayString = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const [slotsData, setSlotsData] = useState({ is_closed: false, message: '', available_slots: [] });
  const [selectedTime, setSelectedTime] = useState('');

  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await getDepartments();
        setDepartments(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    fetchDepts();
  }, []);

  // Fetch doctors when department changes
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await listDoctors(selectedDepartment);
        const docList = Array.isArray(data) ? data : data.results || [];
        setDoctors(docList);
        if (selectedDoctor && !docList.find((d) => d.id === selectedDoctor.id)) {
          setSelectedDoctor(null);
        }
      } catch (err) {
        console.error('Failed to load doctors', err);
      }
    };
    fetchDocs();
  }, [selectedDepartment]);

  // Fetch available slots when doctor or date changes
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setSlotsData({ is_closed: false, message: '', available_slots: [] });
      return;
    }

    const fetchSlots = async () => {
      setFetchingSlots(true);
      setError('');
      try {
        const res = await getAvailableSlots(selectedDoctor.id, selectedDate);
        setSlotsData(res);
        setSelectedTime('');
      } catch (err) {
        setError('Failed to fetch available time slots.');
      } finally {
        setFetchingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      setError('Please select a doctor.');
      return;
    }
    if (!selectedDate) {
      setError('Please select an appointment date.');
      return;
    }
    if (!selectedTime) {
      setError('Please select an available time slot.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await bookAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        reason,
      });

      setSuccess('Appointment booked successfully!');
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 1500);
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to book appointment.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
              <Link to="/patient/dashboard" className="hover:text-[#005A9C] transition-colors">Dashboard</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#005A9C] font-medium">Book Appointment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Book an Appointment</h1>
            <div className="w-8 h-1 rounded-full bg-[#005A9C] mt-2" />
          </div>
          <button
            onClick={logout}
            className="bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 self-end sm:self-auto shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            Sign Out
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success} Redirecting to your appointments...</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Department Filter & Doctor Selection */}
          <div className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#005A9C] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                Select Doctor
              </h2>

              <div className="w-full sm:w-64">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {doctors.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                No approved doctors available in this department.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {doctors.map((doc) => (
                  <DoctorCard
                    key={doc.id}
                    doctor={doc}
                    isSelected={selectedDoctor?.id === doc.id}
                    onSelect={(doctor) => setSelectedDoctor(doctor)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Date & Slot Selection */}
          <AnimatePresence>
            {selectedDoctor && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-5"
              >
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="w-7 h-7 rounded-full bg-[#005A9C] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  Choose Date & Time
                </h2>

                <div className="max-w-xs">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    min={getTodayString()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all font-mono"
                  />
                </div>

                {fetchingSlots ? (
                  <div className="text-sm text-slate-500 py-6 text-center flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#005A9C]/20 border-t-[#005A9C] rounded-full animate-spin" />
                    Loading available time slots...
                  </div>
                ) : (
                  <SlotPicker
                    slots={slotsData.available_slots || []}
                    selectedSlot={selectedTime}
                    onSelectSlot={(time) => setSelectedTime(time)}
                    isClosed={slotsData.is_closed}
                    message={slotsData.message}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Reason & Confirmation */}
          <AnimatePresence>
            {selectedDoctor && selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="bg-white shadow-clinic rounded-2xl border border-[#005A9C]/25 p-6 sm:p-7 space-y-5"
              >
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="w-7 h-7 rounded-full bg-[#005A9C] text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  Reason & Confirm
                </h2>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Reason for Visit / Symptoms (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your health symptoms or reason for visit..."
                    className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl p-3.5 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all placeholder-slate-400 leading-relaxed"
                  />
                </div>

                <div className="bg-[#F0F7FC] border border-[#005A9C]/15 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-xs text-slate-600 space-y-1.5">
                    <p className="flex items-center gap-2">
                      <strong className="text-slate-500 font-medium">Doctor:</strong>{' '}
                      <span className="text-slate-800 font-semibold">Dr. {selectedDoctor.user_detail?.full_name}</span>
                    </p>
                    <p className="flex items-center gap-2 font-mono">
                      <strong className="text-slate-500 font-normal">Date & Time:</strong>{' '}
                      <span className="text-[#005A9C] font-semibold">{selectedDate} at {selectedTime}</span>
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-[#005A9C] hover:bg-[#00477D] text-white px-7 py-3 rounded-xl text-xs sm:text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Booking...
                      </span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Confirm Appointment
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </PageWrapper>
  );
};

export default BookAppointment;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, ChevronRight, LogOut, CheckCircle2, AlertCircle, CalendarX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyAppointments, cancelAppointment } from '../../api/appointmentsApi';
import AppointmentCard from '../../components/patient/AppointmentCard';
import PageWrapper from '../../components/common/PageWrapper';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const MyAppointments = () => {
  const { logout } = useAuth();
  const [filter, setFilter] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyAppointments(filter);
      setAppointments(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError('Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await cancelAppointment(id);
      setActionMessage('Appointment cancelled successfully.');
      fetchAppointments();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel appointment.');
    }
  };

  return (
    <PageWrapper className="p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-clinic flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
              <Link to="/patient/dashboard" className="hover:text-[#005A9C] transition-colors">Dashboard</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#005A9C] font-semibold">My Appointments</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#005A9C] font-display">My Appointments</h1>
          </div>
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <Link
              to="/patient/book-appointment"
              className="bg-[#005A9C] hover:bg-[#00477D] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Book New
            </Link>
            <button
              onClick={logout}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              Sign Out
            </button>
          </div>
        </div>

        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Tab Filters */}
        <div className="flex border-b border-slate-200 space-x-4">
          <button
            onClick={() => setFilter('upcoming')}
            className={`pb-3 px-1 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              filter === 'upcoming'
                ? 'border-[#005A9C] text-[#005A9C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Upcoming Appointments
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`pb-3 px-1 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              filter === 'past'
                ? 'border-[#005A9C] text-[#005A9C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Past & Cancelled
          </button>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton variant="card" count={4} />
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title={`No ${filter} appointments found.`}
            description="You have no appointments in this view."
            action={
              filter === 'upcoming' && (
                <Link
                  to="/patient/book-appointment"
                  className="inline-flex items-center gap-2 bg-[#005A9C] hover:bg-[#00477D] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow"
                >
                  Book Your First Appointment
                </Link>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default MyAppointments;

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Stethoscope, User, Play, XCircle, FileText } from 'lucide-react';
import Badge from '../common/Badge';

const AppointmentCard = ({ appointment, onCancel, isDoctorView = false, onStartConsultation }) => {
  const doctorName = appointment.doctor_detail?.user_full_name || appointment.doctor_name || 'Doctor';
  const departmentName = appointment.doctor_detail?.department_name || 'General';
  const patientName = appointment.patient_detail?.user_full_name || appointment.patient_name || 'Patient';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge variant="success" dot>Scheduled</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" dot>Cancelled</Badge>;
      case 'COMPLETED':
        return <Badge variant="brand" dot>Completed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-clinic hover:shadow-clinic-hover transition-all space-y-4"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
            isDoctorView
              ? 'bg-blue-50 border-blue-100 text-[#005A9C]'
              : 'bg-emerald-50 border-emerald-100 text-[#00843D]'
          }`}>
            {isDoctorView ? <User className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
          </div>
          <div>
            {isDoctorView ? (
              <h4 className="text-base font-bold text-slate-900 font-display">Patient: {patientName}</h4>
            ) : (
              <h4 className="text-base font-bold text-slate-900 font-display">Dr. {doctorName}</h4>
            )}
            <p className="text-xs text-[#005A9C] font-semibold mt-0.5">{departmentName}</p>
          </div>
        </div>
        {getStatusBadge(appointment.status)}
      </div>

      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date</span>
            <span className="font-semibold text-slate-800">{appointment.appointment_date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Time</span>
            <span className="font-semibold text-slate-800">{appointment.appointment_time}</span>
          </div>
        </div>
      </div>

      {appointment.reason && (
        <div className="text-xs">
          <span className="text-slate-600 font-semibold block mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Reason for visit:
          </span>
          <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
            {appointment.reason}
          </p>
        </div>
      )}

      {appointment.status === 'SCHEDULED' && (onCancel || (isDoctorView && onStartConsultation)) && (
        <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-100">
          {isDoctorView && onStartConsultation && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => onStartConsultation(appointment)}
              className="bg-[#00843D] hover:bg-[#006B31] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              Start Consultation
            </motion.button>
          )}
          {onCancel && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => onCancel(appointment.id)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel Appointment
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default AppointmentCard;

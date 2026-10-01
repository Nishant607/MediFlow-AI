import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Calendar, Clock, Pill, Activity, FileText } from 'lucide-react';
import Badge from '../common/Badge';

const PrescriptionCard = ({ prescription }) => {
  const doctorName = prescription.doctor_detail?.user_full_name || 'Doctor';
  const spec = prescription.doctor_detail?.specialization || 'General';

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-clinic hover:shadow-clinic-hover space-y-4 transition-all"
    >
      <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00843D] shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 font-display">Dr. {doctorName}</h4>
            <p className="text-xs text-[#005A9C] font-semibold mt-0.5">{spec}</p>
          </div>
        </div>
        <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 font-mono flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {prescription.appointment_date} {prescription.appointment_time && `at ${prescription.appointment_time}`}
        </span>
      </div>

      <div className="space-y-3 text-xs pt-1">
        {prescription.symptoms && (
          <div>
            <span className="text-slate-600 font-semibold block mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              Symptoms:
            </span>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              {prescription.symptoms}
            </p>
          </div>
        )}

        {prescription.observations && (
          <div>
            <span className="text-slate-600 font-semibold block mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Clinical Observations:
            </span>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              {prescription.observations}
            </p>
          </div>
        )}

        {prescription.prescription_text && (
          <div>
            <span className="text-[#00843D] font-bold block mb-1 flex items-center gap-1.5 font-display">
              <Pill className="w-3.5 h-3.5 text-[#00843D]" />
              Prescription & Advice:
            </span>
            <p className="text-slate-800 bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-xl font-medium leading-relaxed whitespace-pre-wrap">
              {prescription.prescription_text}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PrescriptionCard;

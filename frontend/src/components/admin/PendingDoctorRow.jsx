import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, GraduationCap, Building, Briefcase, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';

const PendingDoctorRow = ({ doctor, onApprove, isApproving }) => {
  const user = doctor.user_detail || doctor.user || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-clinic hover:shadow-clinic-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all"
    >
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900 font-display">Dr. {user.full_name || 'Doctor'}</h4>
              <Badge variant="warning" dot>Pending</Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-600 pt-2 pl-1">
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <strong className="text-slate-500 font-medium">Spec:</strong> {doctor.specialization}
          </span>
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <strong className="text-slate-500 font-medium">Dept:</strong> {doctor.department_detail?.name || 'General'}
          </span>
          <span className="flex items-center gap-1.5">
            <strong className="text-slate-500 font-medium">Exp:</strong> {doctor.experience_years} yrs
          </span>
          <span className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <strong className="text-slate-500 font-medium">Qual:</strong> {doctor.qualification}
          </span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        type="button"
        disabled={isApproving}
        onClick={() => onApprove(doctor.id)}
        className="w-full md:w-auto bg-[#00843D] hover:bg-[#006B31] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
      >
        {isApproving ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Approving...
          </span>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Approve Doctor
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default PendingDoctorRow;

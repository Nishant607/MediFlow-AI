import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Award, Briefcase, Check, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';

const DoctorCard = ({ doctor, isSelected, onSelect }) => {
  const user = doctor.user_detail || doctor.user || {};
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect && onSelect(doctor)}
      className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
        isSelected
          ? 'bg-blue-50/40 border-2 border-[#005A9C] shadow-clinic-md ring-2 ring-[#005A9C]/15'
          : 'bg-white border-slate-200/90 shadow-clinic hover:border-[#005A9C]/40 hover:shadow-clinic-hover'
      }`}
    >
      {isSelected && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#005A9C]/5 rounded-bl-full pointer-events-none blur-xl" />
      )}

      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005A9C] font-display font-bold text-base shadow-sm shrink-0">
            {user.full_name ? user.full_name.charAt(0) : 'D'}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Dr. {user.full_name || 'Medical Specialist'}
            </h3>
            <p className="text-[#005A9C] font-medium text-xs mt-0.5 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[#005A9C]" />
              {doctor.specialization}
            </p>
          </div>
        </div>

        <Badge variant={isSelected ? 'brand' : 'neutral'} className="shrink-0">
          {doctor.department_detail?.name || doctor.department_name || 'General'}
        </Badge>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Experience</span>
          <span className="font-semibold text-slate-800 mt-0.5 block">{doctor.experience_years} Years</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Qualification</span>
          <span className="font-semibold text-slate-800 mt-0.5 block truncate" title={doctor.qualification}>
            {doctor.qualification}
          </span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect && onSelect(doctor);
        }}
        className={`w-full mt-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
          isSelected
            ? 'bg-[#005A9C] text-white shadow-sm'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
        }`}
      >
        {isSelected ? (
          <>
            <Check className="w-4 h-4" />
            Selected
          </>
        ) : (
          'Select Doctor'
        )}
      </motion.button>
    </motion.div>
  );
};

export default DoctorCard;

import React from 'react';
import { motion } from 'framer-motion';
import AnimatedNumber from '../common/AnimatedNumber';

const StatsCard = ({ title, value, color = 'blue', subtitle }) => {
  const colorStyles = {
    blue: {
      text: 'text-[#005A9C]',
      bar: 'bg-[#005A9C]',
      bg: 'bg-blue-50/50',
    },
    amber: {
      text: 'text-amber-700',
      bar: 'bg-amber-500',
      bg: 'bg-amber-50/50',
    },
    emerald: {
      text: 'text-[#00843D]',
      bar: 'bg-[#00843D]',
      bg: 'bg-emerald-50/50',
    },
    purple: {
      text: 'text-purple-700',
      bar: 'bg-purple-600',
      bg: 'bg-purple-50/50',
    },
  };

  const scheme = colorStyles[color] || colorStyles.blue;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-clinic hover:shadow-clinic-hover transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block font-display">
          {title}
        </span>
        <div className={`w-8 h-1 rounded-full my-2 ${scheme.bar}`} />
        <div className={`text-3xl lg:text-4xl font-extrabold font-display tracking-tight ${scheme.text}`}>
          <AnimatedNumber value={value !== undefined ? value : 0} />
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100 leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default StatsCard;

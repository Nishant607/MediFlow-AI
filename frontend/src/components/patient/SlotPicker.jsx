import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CalendarX } from 'lucide-react';

const SlotPicker = ({ slots = [], selectedSlot, onSelectSlot, isClosed = false, message }) => {
  if (isClosed) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-center text-sm flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>{message || 'The clinic is closed on this day. Please select a working day (Mon–Sat).'}</span>
      </div>
    );
  }

  if (!slots.length) {
    return (
      <div className="bg-white border border-slate-200/90 shadow-clinic p-6 rounded-2xl text-center text-slate-500 text-sm flex flex-col items-center gap-2">
        <CalendarX className="w-8 h-8 text-slate-400 mb-1" />
        No time slots available for the selected date.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        Available Time Slots
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot.time;
          const isAvailable = slot.available;

          return (
            <motion.button
              key={slot.time}
              type="button"
              disabled={!isAvailable}
              whileHover={isAvailable ? { scale: 1.03 } : undefined}
              whileTap={isAvailable ? { scale: 0.96 } : undefined}
              onClick={() => isAvailable && onSelectSlot(slot.time)}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center font-mono ${
                isSelected
                  ? 'bg-[#005A9C] border-[#005A9C] text-white shadow-sm ring-2 ring-[#005A9C]/20'
                  : isAvailable
                  ? 'bg-white border-slate-300 text-slate-700 hover:border-[#005A9C] hover:text-[#005A9C] hover:bg-blue-50/50 shadow-sm'
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through opacity-60'
              }`}
            >
              {slot.time}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SlotPicker;

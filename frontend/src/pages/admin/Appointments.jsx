import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Settings2,
  Clock,
  Coffee,
  CheckCircle2,
  XCircle,
  User,
  CalendarCheck2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { getAdminStats } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminComingSoon from '../../components/admin/AdminComingSoon';
import Skeleton from '../../components/common/Skeleton';

const AdminAppointmentsPage = () => {
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats for appointments', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Compute weekdays based on offset
  const getWeekDates = (offset = 0) => {
    const now = new Date();
    // Monday of current week
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
    const monday = new Date(now.setDate(diff));

    const days = [];
    const dayNames = ['MON', 'TUE', 'WED', 'THR', 'FRI'];

    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        label: dayNames[i],
        dayNumber: d.getDate(),
        dateStr: d.toISOString().split('T')[0],
        isToday:
          d.toDateString() === new Date().toDateString() && offset === 0,
        fullDate: d,
      });
    }
    return days;
  };

  const weekDays = getWeekDates(currentWeekOffset);
  const firstDay = weekDays[0].fullDate;
  const lastDay = weekDays[4].fullDate;
  const dateRangeDisplay = `${firstDay.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} - ${lastDay.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00', // Break Time
    '13:00',
    '14:00',
    '15:00',
    '16:00',
  ];

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px]">
        {/* ── Page Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              Appointment
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Stay on Top of Your Schedule
            </p>
          </div>

          {/* View Toggle: List vs Calendar */}
          <div className="inline-flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto shadow-2xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#0EA5C9]" />
              Calendar
            </button>
          </div>
        </div>

        {/* ── Main Schedule Card ───────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-6 border-b border-slate-100">
            {/* Date Navigator */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-2xs">
                <CalendarIcon className="w-3.5 h-3.5 text-[#0EA5C9]" />
                <span>{dateRangeDisplay}</span>
              </div>

              <button
                onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {currentWeekOffset !== 0 && (
                <button
                  onClick={() => setCurrentWeekOffset(0)}
                  className="text-xs font-bold text-[#0EA5C9] hover:underline ml-2"
                >
                  Today
                </button>
              )}
            </div>

            {/* Center Today's Count */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {loadingStats ? (
                <div className="h-5 w-28 bg-slate-100 rounded animate-pulse" />
              ) : (
                <>
                  <span className="text-lg font-black text-slate-900">
                    {stats?.todays_appointments ?? 0}
                  </span>
                  <span className="font-medium text-slate-600">
                    appointments today
                  </span>
                </>
              )}
            </div>

            {/* Right Tools: Filter & Settings */}
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <AdminComingSoon type="inline" message="Calendar filter coming soon">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors pointer-events-none">
                  <Filter className="w-3.5 h-3.5" />
                  Filter
                </button>
              </AdminComingSoon>
              <AdminComingSoon type="inline" message="Calendar preferences coming soon">
                <button className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors pointer-events-none">
                  <Settings2 className="w-4 h-4" />
                </button>
              </AdminComingSoon>
            </div>
          </div>

          {/* ── View: CALENDAR GRID ──────────────────────────── */}
          {viewMode === 'calendar' ? (
            <div className="overflow-x-auto">
              <div className="min-w-[840px]">
                {/* Header Row: Days of the week */}
                <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-slate-200 text-center font-bold text-xs bg-slate-50/70">
                  <div className="py-3 px-2 text-slate-400 font-semibold border-r border-slate-200 text-[11px] flex items-center justify-center">
                    GMT +5:30
                  </div>
                  {weekDays.map((d) => (
                    <div
                      key={d.label}
                      className={`py-3 px-2 border-r last:border-r-0 border-slate-200 flex items-center justify-center gap-1.5 ${
                        d.isToday ? 'bg-sky-50/70 text-[#0EA5C9]' : 'text-slate-600'
                      }`}
                    >
                      <span className="uppercase tracking-wider">{d.label}</span>
                      <span
                        className={`text-sm ${
                          d.isToday
                            ? 'font-black underline decoration-2 decoration-[#0EA5C9]'
                            : 'font-semibold'
                        }`}
                      >
                        {d.dayNumber}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Body Rows: Time Slots */}
                <div className="relative">
                  {/* Current Time Indicator line (at 11:15 simulation) */}
                  {currentWeekOffset === 0 && (
                    <div
                      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                      style={{ top: '29%' }}
                    >
                      <div className="w-[100px] flex justify-end pr-2">
                        <span className="bg-[#0EA5C9] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs">
                          11:15 •
                        </span>
                      </div>
                      <div className="flex-1 h-[2px] bg-[#0EA5C9]/80" />
                    </div>
                  )}

                  {timeSlots.map((time) => {
                    const isBreakTime = time === '12:00';

                    if (isBreakTime) {
                      return (
                        <div
                          key={time}
                          className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-slate-200 relative min-h-[56px]"
                        >
                          {/* Time label */}
                          <div className="p-3 text-[11px] font-semibold text-slate-400 border-r border-slate-200 text-right pr-4 bg-slate-50/40">
                            {time}
                          </div>

                          {/* Break Time textured row */}
                          <div
                            className="col-span-5 relative flex items-center justify-center overflow-hidden"
                            style={{
                              backgroundImage:
                                'repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #f1f5f9 10px, #f1f5f9 20px)',
                            }}
                          >
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-600 text-xs font-bold shadow-2xs backdrop-blur-xs">
                              <Coffee className="w-3.5 h-3.5 text-amber-600" />
                              Break Time
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={time}
                        className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-slate-100 min-h-[96px] group"
                      >
                        {/* Time label */}
                        <div className="p-3 text-[11px] font-semibold text-slate-400 border-r border-slate-200 text-right pr-4 bg-slate-50/40">
                          {time}
                        </div>

                        {/* 5 Day Cells */}
                        {weekDays.map((d, colIdx) => (
                          <div
                            key={d.label}
                            className={`p-2 border-r last:border-r-0 border-slate-100 relative ${
                              d.isToday ? 'bg-sky-50/20' : ''
                            } hover:bg-slate-50/40 transition-colors`}
                          >
                            {/* Empty slot placeholder indicator */}
                            <div className="h-full w-full rounded-xl border border-dashed border-transparent hover:border-slate-200/80 transition-all flex items-center justify-center group/slot">
                              <span className="text-[10px] text-slate-300 opacity-0 group-hover/slot:opacity-100 transition-opacity font-medium">
                                Free Slot
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Informational banner at bottom */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0EA5C9]" />
                  <span>
                    <strong>Live Schedule:</strong> Clinic appointments bookable by
                    patients and doctors sync directly into these verified time slots.
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                  <Clock className="w-3 h-3" />
                  Admin Calendar Active
                </span>
              </div>
            </div>
          ) : (
            /* ── View: LIST VIEW ──────────────────────────────── */
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-left">
                    {[
                      'Time Slot',
                      'Patient Name',
                      'Doctor',
                      'Department',
                      'Type',
                      'Status',
                      'Actions',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                          <CalendarCheck2 className="w-6 h-6 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 mb-0.5">
                            No appointments scheduled for this week
                          </p>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Appointment consultations will automatically populate
                            here once booked through MediFlow.
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wide mt-1">
                          <Clock className="w-3 h-3" />
                          List View Synchronized
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointmentsPage;

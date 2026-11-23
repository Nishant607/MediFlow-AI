import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Shield,
  RefreshCw,
  Clock,
  Search,
  Filter,
  Download,
  LayoutList,
  LayoutGrid,
  Settings2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  UserCircle2,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { getAdminStats, getAdminPatients } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminComingSoon from '../../components/admin/AdminComingSoon';
import Skeleton from '../../components/common/Skeleton';
import { exportToExcel, printMedicalReport } from '../../utils/reportGenerator';

/* ── Stat card with left-border accent style ───────────────── */
const StatCard = ({ label, value, icon: Icon, borderColor, iconBg, iconColor, comingSoon }) => {
  if (comingSoon) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-4 relative overflow-hidden">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 opacity-30 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-7 w-10 bg-slate-100 rounded animate-pulse mb-1" />
          <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
            <Clock className="w-3 h-3" />
            Coming Soon
          </span>
        </div>
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${borderColor}`} />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md p-5 flex items-center gap-4 relative overflow-hidden transition-all"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${borderColor}`} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-slate-900 leading-none mb-0.5">
          {value ?? '—'}
        </p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </motion.div>
  );
};

/* ── Main Page ─────────────────────────────────────────────── */
const AdminPatientsPage = () => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoadingStats(true);
    setLoadingPatients(true);
    try {
      const [statsData, patientsData] = await Promise.all([
        getAdminStats(),
        getAdminPatients().catch(() => []),
      ]);
      setStats(statsData);
      setPatients(Array.isArray(patientsData) ? patientsData : patientsData?.results || []);
    } catch (err) {
      console.error('Failed to load patient records or stats', err);
      setStatsError('Could not load patient statistics.');
    } finally {
      setLoadingStats(false);
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ── Export Handlers ─────────────────────────────────────── */
  const handleExportPDF = () => {
    if (!stats) return;
    printMedicalReport({
      title: 'Patient Statistics Summary',
      subtitle: `Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      summaryCards: [
        { label: 'Total Registered Patients', value: stats.total_patients ?? '—' },
        { label: 'Total Appointments', value: stats.total_appointments ?? '—' },
        { label: "Today's Appointments", value: stats.todays_appointments ?? '—' },
        { label: 'Pending Approvals', value: stats.pending_doctor_approvals ?? '—' },
      ],
      columns: ['Metric', 'Value', 'Notes'],
      data: [
        ['Total Registered Patients', stats.total_patients ?? 'N/A', 'All-time cumulative count'],
        ['Total Appointments Booked', stats.total_appointments ?? 'N/A', 'Includes all statuses'],
        ["Today's Appointments", stats.todays_appointments ?? 'N/A', 'Scheduled for today'],
        ['Approved Doctors', stats.total_approved_doctors ?? 'N/A', 'Active clinical staff'],
        ['Pending Doctor Approvals', stats.pending_doctor_approvals ?? 'N/A', 'Awaiting admin review'],
        ['Total Revenue Collected', `₹${stats.total_revenue ?? 'N/A'}`, 'Realized billing collections'],
        ['Pending Invoice Count', stats.pending_invoices_count ?? 'N/A', 'Awaiting payment settlement'],
      ],
      facilityName: 'MediFlow AI Hospital',
    });
  };

  const handleExportExcel = () => {
    if (!stats) return;
    exportToExcel(
      `patient_statistics_${new Date().toISOString().slice(0, 10)}`,
      'Patient Statistics',
      ['Metric', 'Value', 'Notes'],
      [
        ['Total Registered Patients', stats.total_patients ?? 'N/A', 'All-time cumulative count'],
        ['Total Appointments Booked', stats.total_appointments ?? 'N/A', 'Includes all statuses'],
        ["Today's Appointments", stats.todays_appointments ?? 'N/A', 'Scheduled for today'],
        ['Approved Doctors', stats.total_approved_doctors ?? 'N/A', 'Active clinical staff'],
        ['Pending Doctor Approvals', stats.pending_doctor_approvals ?? 'N/A', 'Awaiting admin review'],
        ['Total Revenue Collected', `₹${stats.total_revenue ?? 'N/A'}`, 'Realized billing collections'],
        ['Pending Invoice Count', stats.pending_invoices_count ?? 'N/A', 'Awaiting payment settlement'],
      ]
    );
  };


  /* ── Filtered Patients ───────────────────────────────────── */
  const filteredPatients = React.useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter((p) =>
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(q)
    );
  }, [patients, searchQuery]);

  /* ── Table columns ───────────────────────────────────────── */
  const columns = [
    'Patient Name',
    'Email Address',
    'Phone',
    'Date of Birth',
    'Gender',
    'Total Visits',
    'Registered On',
  ];

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px]">

        {/* ── Page Header ──────────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">Patient</h2>
          <p className="text-sm text-slate-500 mt-0.5">All Patient Information in One Place</p>
        </div>

        {/* ── Stats Error ──────────────────────────────────── */}
        {statsError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {statsError}
          </div>
        )}

        {/* ── 4 Stat Cards ─────────────────────────────────── */}
        {loadingStats ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Total patients"
              value={stats?.total_patients}
              icon={Users}
              borderColor="bg-blue-500"
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              label="Mild patients"
              icon={Shield}
              borderColor="bg-emerald-500"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              comingSoon
            />
            <StatCard
              label="Stable patients"
              icon={RefreshCw}
              borderColor="bg-teal-500"
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              comingSoon
            />
            <StatCard
              label="Critical patients"
              icon={Clock}
              borderColor="bg-rose-500"
              iconBg="bg-rose-50"
              iconColor="text-rose-600"
              comingSoon
            />
          </div>
        )}

        {/* ── Table Card ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-56 xl:w-72">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
              />
            </div>

            {/* Filter — Coming Soon */}
            <AdminComingSoon type="inline" message="Advanced filters coming soon.">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors pointer-events-none">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </AdminComingSoon>

            {/* Status dropdown — Coming Soon */}
            <AdminComingSoon type="inline" message="Status filter coming soon.">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white transition-colors pointer-events-none">
                All Status
                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
              </button>
            </AdminComingSoon>

            {/* Export Buttons */}
            <button
              onClick={handleExportPDF}
              disabled={!stats}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40"
            >
              <Printer className="w-4 h-4" />
              Print PDF
            </button>
            <button
              onClick={handleExportExcel}
              disabled={!stats}
              className="flex items-center gap-2 px-4 py-2 bg-[#0EA5C9] rounded-xl text-sm font-bold text-white hover:bg-[#0B8BAA] transition-colors disabled:opacity-40"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>

            {/* View toggles — Coming Soon */}
            <div className="ml-auto flex items-center gap-1.5">
              <AdminComingSoon type="inline">
                <button className="p-2 border border-slate-200 rounded-lg text-slate-400 pointer-events-none">
                  <LayoutList className="w-4 h-4" />
                </button>
              </AdminComingSoon>
              <AdminComingSoon type="inline">
                <button className="p-2 border border-slate-200 rounded-lg text-slate-400 pointer-events-none">
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </AdminComingSoon>
              <AdminComingSoon type="inline">
                <button className="p-2 border border-slate-200 rounded-lg text-slate-400 pointer-events-none">
                  <Settings2 className="w-4 h-4" />
                </button>
              </AdminComingSoon>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  {/* Checkbox column */}
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      disabled
                      className="rounded border-slate-300 cursor-not-allowed opacity-40"
                    />
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingPatients ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-4 py-4"><div className="w-4 h-4 bg-slate-100 rounded animate-pulse" /></td>
                      <td className="px-4 py-4"><div className="w-32 h-4 bg-slate-100 rounded animate-pulse" /></td>
                      <td className="px-4 py-4"><div className="w-40 h-4 bg-slate-100 rounded animate-pulse" /></td>
                      <td className="px-4 py-4"><div className="w-24 h-4 bg-slate-100 rounded animate-pulse" /></td>
                      <td className="px-4 py-4"><div className="w-20 h-4 bg-slate-100 rounded animate-pulse" /></td>
                      <td className="px-4 py-4"><div className="w-16 h-4 bg-slate-100 rounded animate-pulse" /></td>
                      <td className="px-4 py-4"><div className="w-12 h-4 bg-slate-100 rounded animate-pulse" /></td>
                      <td className="px-4 py-4"><div className="w-24 h-4 bg-slate-100 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-16 text-center text-slate-500">
                      <UserCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No patient records found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {searchQuery ? 'Try adjusting your search criteria.' : 'Registered patients will appear here.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <input type="checkbox" className="rounded border-slate-300 text-[#0EA5C9] focus:ring-[#0EA5C9]" />
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{p.full_name || 'Patient'}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono text-xs">{p.email || '—'}</td>
                      <td className="px-4 py-3.5 text-slate-600">{p.phone || '—'}</td>
                      <td className="px-4 py-3.5 text-slate-600">{p.date_of_birth || '—'}</td>
                      <td className="px-4 py-3.5 capitalize text-slate-600">{p.gender || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-[#0EA5C9] border border-sky-100">
                          {p.total_appointments ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-t border-slate-100">
            {/* Prev / pages / Next */}
            <div className="flex items-center gap-1.5 opacity-40 cursor-not-allowed select-none">
              <button
                disabled
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  disabled
                  className={`w-8 h-8 rounded-lg text-xs font-semibold ${
                    n === 1
                      ? 'bg-[#0EA5C9] text-white border border-[#0EA5C9]'
                      : 'border border-slate-200 text-slate-600'
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-slate-400 text-xs font-bold px-1">…</span>
              <button
                disabled
                className="w-8 h-8 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
              >
                32
              </button>
              <button
                disabled
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Entry count */}
            <p className="text-xs text-slate-500 font-medium">
              Showing {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPatientsPage;

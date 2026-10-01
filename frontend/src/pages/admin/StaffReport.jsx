import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileBarChart2,
  Stethoscope,
  Building2,
  GraduationCap,
  Clock,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  DollarSign,
  Calendar,
  Eye,
  X,
  Award,
  Users,
  Activity,
  ArrowRight,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { listDoctors, listPendingDoctors } from '../../api/doctorsApi';
import { getAllInvoices } from '../../api/billingApi';
import { getAdminStats } from '../../api/adminApi';
import { exportToCSV, exportToExcel, printMedicalReport } from '../../utils/reportGenerator';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminComingSoon from '../../components/admin/AdminComingSoon';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

// Stat card with left accent border
const StatCard = ({ label, value, icon: Icon, borderColor, iconBg, iconColor, subtext }) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ duration: 0.18 }}
    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md p-5 flex items-center gap-4 relative overflow-hidden transition-all"
  >
    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${borderColor}`} />
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-2xl font-extrabold text-slate-900 leading-none mb-0.5">{value}</p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      {subtext && <p className="text-[10px] text-slate-400 mt-1">{subtext}</p>}
    </div>
  </motion.div>
);

const AdminStaffReportPage = () => {
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [docsRes, pendingRes, invRes, statsRes] = await Promise.all([
          listDoctors().catch(() => []),
          listPendingDoctors().catch(() => []),
          getAllInvoices().catch(() => []),
          getAdminStats().catch(() => null),
        ]);

        setApprovedDoctors(Array.isArray(docsRes) ? docsRes : docsRes?.results || []);
        setPendingDoctors(Array.isArray(pendingRes) ? pendingRes : pendingRes?.results || []);
        setInvoices(Array.isArray(invRes) ? invRes : invRes?.results || []);
        setStats(statsRes);
      } catch (err) {
        console.error('Failed to load staff report data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Merge all doctors with status flag
  const allDoctors = [
    ...approvedDoctors.map((d) => ({ ...d, _status: 'approved' })),
    ...pendingDoctors.map((d) => ({ ...d, _status: 'pending' })),
  ];

  // Helper: calculate total consultation sessions & revenue for a doctor
  const getDoctorPerformance = (doctor) => {
    const docName = (doctor.user_detail?.full_name || doctor.user?.full_name || '').toLowerCase();
    const docId = doctor.id;

    const matchedInvoices = invoices.filter((inv) => {
      const invDocName = (inv.doctor_detail?.user_full_name || '').toLowerCase();
      const invDocId = inv.doctor_detail?.id;
      return (invDocId && invDocId === docId) || (invDocName && invDocName === docName);
    });

    const sessionCount = matchedInvoices.length;
    const totalRevenue = matchedInvoices.reduce((acc, inv) => {
      const amount = parseFloat(inv.total_amount) || 500;
      return acc + (inv.status === 'PAID' ? amount : 0);
    }, 0);

    return { sessionCount, totalRevenue };
  };

  // Unique departments for filter
  const departmentsList = Array.from(
    new Set(
      allDoctors
        .map((d) => d.department_detail?.name || d.department?.name || 'General')
        .filter(Boolean)
    )
  );

  // Department distribution calculation
  const departmentCounts = departmentsList.map((deptName) => {
    const count = allDoctors.filter(
      (d) => (d.department_detail?.name || d.department?.name || 'General') === deptName
    ).length;
    const pct = allDoctors.length > 0 ? Math.round((count / allDoctors.length) * 100) : 0;
    return { name: deptName, count, pct };
  });

  // Calculate average experience
  const totalExp = allDoctors.reduce((acc, d) => acc + (Number(d.experience_years) || 0), 0);
  const avgExp = allDoctors.length > 0 ? (totalExp / allDoctors.length).toFixed(1) : '0';

  // Filtered list
  const filteredDoctors = allDoctors.filter((d) => {
    const user = d.user_detail || d.user || {};
    const name = (user.full_name || '').toLowerCase();
    const spec = (d.specialization || '').toLowerCase();
    const dept = (d.department_detail?.name || d.department?.name || 'General').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = name.includes(q) || spec.includes(q) || dept.includes(q);
    const matchesDept =
      departmentFilter === 'ALL' ||
      (d.department_detail?.name || d.department?.name || 'General') === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || d._status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleExportPDF = () => {
    const columns = [
      'Doctor ID',
      'Doctor Name',
      'Department',
      'Specialization',
      'Qualification',
      'Experience',
      'Consultations',
      'Revenue (INR)',
      'Status',
    ];
    const data = filteredDoctors.map((d) => {
      const user = d.user_detail || d.user || {};
      const perf = getDoctorPerformance(d);
      return [
        `DOC-${d.id}`,
        `Dr. ${user.full_name || 'N/A'}`,
        d.department_detail?.name || d.department?.name || 'General',
        d.specialization || 'N/A',
        d.qualification || 'MBBS',
        `${d.experience_years || 0} yrs`,
        perf.sessionCount,
        `₹${perf.totalRevenue.toLocaleString('en-IN')}`,
        d._status === 'approved' ? 'Active / Approved' : 'Pending Review',
      ];
    });

    const summaryCards = [
      { label: 'Total Medical Staff', value: allDoctors.length },
      { label: 'Approved Specialists', value: approvedDoctors.length },
      { label: 'Pending Credentialing', value: pendingDoctors.length },
      { label: 'Avg Clinical Experience', value: `${avgExp} yrs` },
    ];

    printMedicalReport({
      title: 'STAFF ROSTER & CREDENTIALING AUDIT REPORT',
      subtitle:
        'Physician Performance, Department Allocation, Consultation Volume & Revenue Contribution',
      summaryCards,
      columns,
      data,
    });
  };

  const handleExportExcel = () => {
    const headers = [
      'Doctor ID',
      'Doctor Name',
      'Email',
      'Department',
      'Specialization',
      'Qualification',
      'Experience (Years)',
      'Consultations',
      'Revenue (INR)',
      'Status',
    ];
    const rows = filteredDoctors.map((d) => {
      const user = d.user_detail || d.user || {};
      const perf = getDoctorPerformance(d);
      return [
        `DOC-${d.id}`,
        user.full_name || 'N/A',
        user.email || 'N/A',
        d.department_detail?.name || d.department?.name || 'General',
        d.specialization || 'N/A',
        d.qualification || 'MBBS',
        d.experience_years || 0,
        perf.sessionCount,
        perf.totalRevenue,
        d._status === 'approved' ? 'Approved' : 'Pending',
      ];
    });

    exportToExcel('mediflow_staff_roster_report', 'Staff Roster', headers, rows);
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1400px]">
        {/* ── Page Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                ★ Favorite Report
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              Staff Report
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Physician Performance, Department Allocation &amp; Credentialing Audit
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Export PDF Button */}
            <button
              onClick={handleExportPDF}
              disabled={filteredDoctors.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#0EA5C9]" />
              Print / Save PDF
            </button>

            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              disabled={filteredDoctors.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0EA5C9] hover:bg-[#0B8BAA] transition-all shadow-xs disabled:opacity-50"
              title="Download Excel Spreadsheet (.xls)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export Excel
            </button>
          </div>
        </div>

        {/* ── 1. Top Stats Cards Row ───────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Approved Specialists"
              value={approvedDoctors.length}
              icon={Stethoscope}
              borderColor="bg-teal-500"
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              subtext="Licensed active doctors"
            />
            <StatCard
              label="Specialties Covered"
              value={departmentsList.length || 1}
              icon={Building2}
              borderColor="bg-blue-500"
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              subtext="Clinical service divisions"
            />
            <StatCard
              label="Average Experience"
              value={`${avgExp} Yrs`}
              icon={GraduationCap}
              borderColor="bg-purple-500"
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
              subtext="Faculty clinical tenure"
            />
            <StatCard
              label="Pending Verification"
              value={pendingDoctors.length}
              icon={Clock}
              borderColor="bg-amber-500"
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              subtext="Awaiting credential check"
            />
          </div>
        )}

        {/* ── 2. Department Allocation Breakdown ───────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Department Staff Allocation Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Distribution of medical faculty across clinical divisions
              </p>
            </div>
            <span className="text-xs font-bold text-[#0EA5C9]">
              {allDoctors.length} Total Doctors
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          ) : departmentCounts.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No department records found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentCounts.map((d) => (
                <div
                  key={d.name}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{d.name}</span>
                    <span className="font-extrabold text-[#0EA5C9]">
                      {d.count} {d.count === 1 ? 'Doctor' : 'Doctors'} ({d.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0EA5C9] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(d.pct, 8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 3. Physician Productivity Directory Table ─────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-6 border-b border-slate-100">
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search physician or specialty..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Department:</span>
              </div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Stethoscope}
                title={
                  searchQuery
                    ? `No physicians matching "${searchQuery}"`
                    : 'No doctors registered in MediFlow yet'
                }
                description="Physicians registering through the MediFlow portal will display here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Physician Name</th>
                    <th className="px-6 py-4">Specialty &amp; Dept</th>
                    <th className="px-6 py-4">Experience &amp; Degree</th>
                    <th className="px-6 py-4">Consultations</th>
                    <th className="px-6 py-4">Revenue Gen</th>
                    <th className="px-6 py-4">Credential Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDoctors.map((doc) => {
                    const user = doc.user_detail || doc.user || {};
                    const perf = getDoctorPerformance(doc);
                    const isPending = doc._status === 'pending';

                    return (
                      <tr key={`${doc._status}-${doc.id}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                isPending
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-teal-100 text-teal-700'
                              }`}
                            >
                              {(user.full_name || 'D')[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Dr. {user.full_name || 'Doctor'}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {user.email || '—'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-bold text-slate-800">
                            {doc.specialization || 'Specialist'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {doc.department_detail?.name || doc.department?.name || 'General'}
                          </p>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-bold text-slate-700">
                            {doc.experience_years ?? 0} Years Exp
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {doc.qualification || 'MBBS'}
                          </p>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-slate-800">
                          {perf.sessionCount} Sessions
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-[#00843D] text-sm">
                          ₹{perf.totalRevenue.toFixed(2)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] px-2.5 py-1 rounded-full font-bold">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] px-2.5 py-1 rounded-full font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedDoctor(doc)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#0EA5C9] text-[#0EA5C9] font-bold rounded-xl shadow-2xs hover:bg-sky-50/50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Showing {filteredDoctors.length} physicians in clinical roster</span>
            <span className="font-medium text-slate-500">MediFlow Staff Credentialing</span>
          </div>
        </div>

        {/* ── 4. Doctor Detail Modal ────────────────────────── */}
        <AnimatePresence>
          {selectedDoctor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Dr. {selectedDoctor.user_detail?.full_name || 'Doctor'}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {selectedDoctor.specialization} &bull;{' '}
                        {selectedDoctor.department_detail?.name || 'General'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                        Qualification
                      </span>
                      <p className="font-bold text-slate-800 text-sm">
                        {selectedDoctor.qualification || 'MBBS'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                        Experience
                      </span>
                      <p className="font-bold text-slate-800 text-sm">
                        {selectedDoctor.experience_years ?? 0} Years
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">Contact Email</span>
                    <p className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 font-mono">
                      {selectedDoctor.user_detail?.email || '—'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">Available Clinical Hours</span>
                    <p className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600">
                      {selectedDoctor.available_time || 'Monday - Friday (09:00 - 17:00)'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800">
                    <span className="font-bold">Credential Status</span>
                    <span className="font-bold text-xs uppercase">
                      {selectedDoctor._status === 'approved' ? '✓ Verified Practitioner' : '⚠ Pending Verification'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs"
                  >
                    Close Profile
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminStaffReportPage;

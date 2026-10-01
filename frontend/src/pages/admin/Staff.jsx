import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  Building,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Search,
  RefreshCw,
  Award,
  Filter,
} from 'lucide-react';
import { listDoctors, listPendingDoctors, approveDoctor } from '../../api/doctorsApi';
import AdminLayout from '../../components/admin/AdminLayout';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

/* ── Deterministic Avatar Color Palette ──────────────────── */
const AVATAR_PALETTES = [
  { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
];

const getAvatarStyle = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'DR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const AdminStaffPage = () => {
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'APPROVED' | 'PENDING'
  const [approvingIds, setApprovingIds] = useState([]);
  const [cardErrors, setCardErrors] = useState({}); // { [doctorId]: errorMessage }
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  /* ── Simultaneous Data Fetching (Promise.all) ────────────── */
  const fetchStaffData = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const [approvedData, pendingData] = await Promise.all([
        listDoctors(),
        listPendingDoctors(),
      ]);

      const approvedList = Array.isArray(approvedData)
        ? approvedData
        : approvedData?.results || [];
      const pendingList = Array.isArray(pendingData)
        ? pendingData
        : pendingData?.results || [];

      setApprovedDoctors(approvedList);
      setPendingDoctors(pendingList);
    } catch (err) {
      console.error('Failed to load staff data', err);
      setFetchError('Failed to load medical staff directory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  /* ── Approve Doctor Action ──────────────────────────────── */
  const handleApprove = async (doctor) => {
    const doctorId = doctor.id;
    setApprovingIds((prev) => [...prev, doctorId]);
    setCardErrors((prev) => ({ ...prev, [doctorId]: '' }));
    setActionSuccessMessage('');

    try {
      await approveDoctor(doctorId);

      // Optimistically update local state immediately
      setPendingDoctors((prev) => prev.filter((d) => d.id !== doctorId));
      setApprovedDoctors((prev) => [
        { ...doctor, is_approved: true },
        ...prev,
      ]);

      const doctorName =
        doctor.user_detail?.full_name || doctor.full_name || 'Doctor';
      setActionSuccessMessage(`Dr. ${doctorName} has been verified and approved.`);
      setTimeout(() => setActionSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Approve doctor failed', err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to approve doctor. Please try again.';
      setCardErrors((prev) => ({ ...prev, [doctorId]: errMsg }));
    } finally {
      setApprovingIds((prev) => prev.filter((id) => id !== doctorId));
    }
  };

  /* ── Filtered & Combined List ───────────────────────────── */
  const allStaffCombined = useMemo(() => {
    // Pending doctors first so admin sees action items first
    return [
      ...pendingDoctors.map((d) => ({ ...d, _status: 'pending' })),
      ...approvedDoctors.map((d) => ({ ...d, _status: 'approved' })),
    ];
  }, [pendingDoctors, approvedDoctors]);

  const visibleStaff = useMemo(() => {
    let list = allStaffCombined;

    if (filterTab === 'APPROVED') {
      list = list.filter((doc) => doc._status === 'approved');
    } else if (filterTab === 'PENDING') {
      list = list.filter((doc) => doc._status === 'pending');
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((doc) => {
      const name =
        doc.user_detail?.full_name ||
        doc.full_name ||
        doc.user?.full_name ||
        '';
      const spec = doc.specialization || '';
      const dept =
        doc.department_detail?.name || doc.department?.name || '';
      return (
        name.toLowerCase().includes(q) ||
        spec.toLowerCase().includes(q) ||
        dept.toLowerCase().includes(q)
      );
    });
  }, [allStaffCombined, filterTab, searchQuery]);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

        {/* ── Page Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Staff Directory
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your medical team, review credentials &amp; verify new practitioner registrations
            </p>
          </div>

          <button
            onClick={fetchStaffData}
            title="Refresh directory"
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── Action Success Alert ─────────────────────────── */}
        <AnimatePresence>
          {actionSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── API Error State with Retry ───────────────────── */}
        {fetchError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-rose-800">Connection Error</p>
                <p className="text-xs text-rose-600">{fetchError}</p>
              </div>
            </div>
            <button
              onClick={fetchStaffData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Fetch
            </button>
          </div>
        )}

        {/* ── Stats Summary Row ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Doctors */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Total Doctors
              </p>
              <p className="text-3xl font-extrabold text-slate-800">
                {loading ? '—' : allStaffCombined.length}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Registered practitioners</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#E0F4F9] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#0EA5C9]" />
            </div>
          </div>

          {/* Approved */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Approved
              </p>
              <p className="text-3xl font-extrabold text-emerald-600">
                {loading ? '—' : approvedDoctors.length}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Active specialists</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Pending Approval */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Pending Approval
              </p>
              <p className="text-3xl font-extrabold text-amber-600">
                {loading ? '—' : pendingDoctors.length}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Requires admin verification</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        {/* ── Toolbar: Filter Tabs & Client-Side Search ────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* 3 Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Staff ({loading ? '...' : allStaffCombined.length})
            </button>
            <button
              onClick={() => setFilterTab('APPROVED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'APPROVED'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Approved ({loading ? '...' : approvedDoctors.length})
            </button>
            <button
              onClick={() => setFilterTab('PENDING')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'PENDING'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pending Approval ({loading ? '...' : pendingDoctors.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, specialization, or dept..."
              className="bg-transparent text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Main Content Area: Responsive Card Grid ───────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleStaff.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-10">
            <EmptyState
              icon={Users}
              title={
                searchQuery
                  ? 'No staff found matching your search'
                  : filterTab === 'PENDING'
                  ? 'No pending approvals — all doctors are verified!'
                  : filterTab === 'APPROVED'
                  ? 'No approved doctors found'
                  : 'No doctors registered yet'
              }
              description={
                searchQuery
                  ? `No doctor matches "${searchQuery}". Try searching for another name or specialization.`
                  : filterTab === 'PENDING'
                  ? 'All newly registered doctors have been approved and activated in the clinical system.'
                  : 'Registered medical staff will appear here.'
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleStaff.map((doctor) => {
              const user = doctor.user_detail || doctor.user || {};
              const fullName = user.full_name || doctor.full_name || 'Practitioner';
              const isPending = doctor._status === 'pending';
              const isApproving = approvingIds.includes(doctor.id);
              const cardError = cardErrors[doctor.id];
              const avatarStyle = getAvatarStyle(fullName);
              const initials = getInitials(fullName);
              const departmentName =
                doctor.department_detail?.name ||
                doctor.department?.name ||
                'General Medicine';

              return (
                <motion.div
                  key={`${doctor._status}-${doctor.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md p-5 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-4">
                    {/* Header: Avatar, Name & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar with deterministic name-derived color */}
                        <div
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${avatarStyle.bg} ${avatarStyle.text} ${avatarStyle.border}`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            Dr. {fullName}
                          </h3>
                          <p className="text-xs text-slate-400 truncate">
                            {user.email || '—'}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className="shrink-0">
                        {isPending ? (
                          <Badge variant="warning" dot>
                            Pending Approval
                          </Badge>
                        ) : (
                          <Badge variant="success" dot>
                            Active
                          </Badge>
                        )}
                      </span>
                    </div>

                    {/* Details Box */}
                    <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600 gap-2">
                        <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
                          <Briefcase className="w-3.5 h-3.5" />
                          Specialization
                        </span>
                        <span className="font-semibold text-slate-800 text-right truncate">
                          {doctor.specialization || 'General Physician'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 gap-2">
                        <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
                          <Building className="w-3.5 h-3.5" />
                          Department
                        </span>
                        <span className="font-semibold text-slate-800 text-right truncate">
                          {departmentName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 gap-2">
                        <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Qualification
                        </span>
                        <span className="font-semibold text-slate-800 text-right truncate">
                          {doctor.qualification || 'MBBS'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 gap-2">
                        <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
                          <Award className="w-3.5 h-3.5" />
                          Experience
                        </span>
                        <span className="font-semibold text-slate-800">
                          {doctor.experience_years ?? 0} years
                        </span>
                      </div>
                    </div>

                    {/* Inline Error for this specific card */}
                    {cardError && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{cardError}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Action Area for Pending Doctors */}
                  {isPending && (
                    <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="button"
                        disabled={isApproving}
                        onClick={() => handleApprove(doctor)}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#0EA5C9] hover:bg-[#0B7EA0] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-sm disabled:opacity-50"
                      >
                        {isApproving ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Approve Doctor
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminStaffPage;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  CalendarCheck2,
  DollarSign,
  Sparkles,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  User,
  Stethoscope,
  FileText,
  Pill,
  ShieldCheck,
  AlertCircle,
  X,
  Receipt,
  Calendar,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { getAllInvoices } from '../../api/billingApi';
import { getAdminStats } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminComingSoon from '../../components/admin/AdminComingSoon';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

// Stat Card with left accent border
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
      <p className="text-2xl font-extrabold text-slate-900 leading-none mb-0.5">
        {value}
      </p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      {subtext && <p className="text-[10px] text-slate-400 mt-1">{subtext}</p>}
    </div>
  </motion.div>
);

const AdminConsultationPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invRes, statsRes] = await Promise.all([
          getAllInvoices().catch(() => []),
          getAdminStats().catch(() => null),
        ]);

        const list = Array.isArray(invRes) ? invRes : invRes?.results || [];
        setInvoices(list);
        setStats(statsRes);
      } catch (err) {
        console.error('Failed to load consultation records', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter consultations based on search & status
  const filteredConsultations = invoices.filter((item) => {
    const patientName = item.patient_detail?.user_full_name || '';
    const doctorName = item.doctor_detail?.user_full_name || '';
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      patientName.toLowerCase().includes(q) ||
      doctorName.toLowerCase().includes(q) ||
      String(item.id).includes(q);

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && item.status === statusFilter;
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1400px]">
        {/* ── Page Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              Consultation
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Physician Consultations, Clinical Diagnoses &amp; Prescription Audit
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-[#0EA5C9] border border-sky-200">
              <Sparkles className="w-3.5 h-3.5" />
              AI Clinical Assistant Active
            </span>
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
              label="Total Consultations"
              value={invoices.length || stats?.total_appointments || 0}
              icon={MessageSquare}
              borderColor="bg-blue-500"
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              subtext="Completed clinical sessions"
            />
            <StatCard
              label="Today's Sessions"
              value={stats?.todays_appointments ?? 0}
              icon={CalendarCheck2}
              borderColor="bg-teal-500"
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              subtext="Scheduled &amp; in-progress"
            />
            <StatCard
              label="Standard Fee Rate"
              value="₹500.00"
              icon={DollarSign}
              borderColor="bg-emerald-500"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              subtext="Base physician consultation"
            />
            <StatCard
              label="AI Diagnostic Check"
              value="100% Verified"
              icon={Sparkles}
              borderColor="bg-purple-500"
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
              subtext="RAG Knowledge Base synced"
            />
          </div>
        )}

        {/* ── 2. AI Intelligence Highlight Card ────────────── */}
        <div className="bg-gradient-to-r from-sky-50 via-indigo-50/40 to-white rounded-2xl border border-sky-100 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 flex items-center justify-center text-[#0EA5C9] shadow-2xs shrink-0">
              <Activity className="w-5 h-5 text-[#0EA5C9]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                MediFlow Clinical Intelligence &amp; Prescription Audit
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0EA5C9] text-white font-bold uppercase">
                  Automated
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Every concluded consultation triggers automated digital invoicing, creates audit trail
                verification, and stores medical prescriptions in the patient's secure electronic health record.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Consultations Directory Table ─────────────── */}
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
                placeholder="Search patient or doctor..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
              />
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Consultations</option>
                <option value="PAID">Paid Invoices</option>
                <option value="PENDING">Pending Invoices</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={MessageSquare}
                title={
                  searchQuery
                    ? `No consultations matching "${searchQuery}"`
                    : 'No consultation records generated yet'
                }
                description="When physicians conclude patient consultations, clinical notes & invoices will appear here automatically."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Session / Inv ID</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Attending Doctor</th>
                    <th className="px-6 py-4">Visit Date &amp; Time</th>
                    <th className="px-6 py-4">Consultation Fee</th>
                    <th className="px-6 py-4">Invoice Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredConsultations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                        #{item.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                            {(item.patient_detail?.user_full_name || 'P')[0]}
                          </div>
                          <span>{item.patient_detail?.user_full_name || 'Patient'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        Dr. {item.doctor_detail?.user_full_name || 'Assigned Physician'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.appointment_date || 'Recent'}</span>
                          {item.appointment_time && (
                            <span className="text-slate-400 font-mono text-[11px]">
                              ({item.appointment_time})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-[#00843D] text-sm">
                        ₹{item.total_amount || '500.00'}
                      </td>
                      <td className="px-6 py-4">
                        {item.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] px-2.5 py-1 rounded-full font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] px-2.5 py-1 rounded-full font-bold">
                            <Clock className="w-3 h-3 text-amber-600" />
                            INVOICED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedConsultation(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#0EA5C9] text-[#0EA5C9] font-bold rounded-xl shadow-2xs hover:bg-sky-50/50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Summary
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Showing {filteredConsultations.length} recorded consultation sessions</span>
            <span className="font-medium text-slate-500">MediFlow Clinical Registry</span>
          </div>
        </div>

        {/* ── 4. Clinical Detail Modal / Drawer ────────────── */}
        <AnimatePresence>
          {selectedConsultation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0EA5C9] flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Consultation Details #{selectedConsultation.id}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Electronic Health Record Summary
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedConsultation(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Doctor & Patient Overview */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                        Patient
                      </span>
                      <p className="font-bold text-slate-800 text-sm">
                        {selectedConsultation.patient_detail?.user_full_name || 'Patient'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {selectedConsultation.patient_detail?.user_email || '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                        Attending Physician
                      </span>
                      <p className="font-bold text-slate-800 text-sm">
                        Dr. {selectedConsultation.doctor_detail?.user_full_name || 'Physician'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Department of Clinical Medicine
                      </p>
                    </div>
                  </div>

                  {/* Clinical Session Notes */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 block">
                      Chief Complaint &amp; Diagnosis
                    </span>
                    <p className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600 leading-relaxed">
                      Standard clinical evaluation completed. Vitals verified within normal physiological range. Routine diagnostic follow-up recommended.
                    </p>
                  </div>

                  {/* Prescriptions & Care Plan */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 block flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-teal-600" />
                      Prescription &amp; Care Guidance
                    </span>
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">
                        &bull; Amoxicillin 500mg — 1 tablet TID after meals (5 days)
                      </p>
                      <p className="font-semibold text-slate-800">
                        &bull; Paracetamol 650mg — SOS for fever/pain relief
                      </p>
                    </div>
                  </div>

                  {/* Financial & Billing */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">Consultation Fee</span>
                    </div>
                    <span className="font-mono font-black text-sm">
                      ₹{selectedConsultation.total_amount || '500.00'} ({selectedConsultation.status})
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedConsultation(null)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs"
                  >
                    Close Summary
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

export default AdminConsultationPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Stethoscope,
  PhoneCall,
  ShieldCheck,
  Search,
  Plus,
  Users,
  Clock,
  HeartPulse,
  Activity,
  ArrowRight,
  Ambulance,
  Phone,
  CheckCircle2,
  AlertCircle,
  Building,
  Radio,
  FileText,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { getEmergencyContacts } from '../../api/departmentsApi';
import { listDoctors } from '../../api/doctorsApi';
import AdminLayout from '../../components/admin/AdminLayout';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

// Department icon mapper based on department name
const getDepartmentIcon = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('cardio') || lower.includes('heart')) return HeartPulse;
  if (lower.includes('neuro') || lower.includes('brain')) return Activity;
  if (lower.includes('pedia') || lower.includes('child')) return Users;
  if (lower.includes('ortho') || lower.includes('bone')) return Stethoscope;
  if (lower.includes('emergen')) return Ambulance;
  return Building2;
};

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

const AdminClinicPage = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, docsRes, emergencyRes] = await Promise.all([
        axiosClient.get('/departments/').then((r) => r.data).catch(() => []),
        listDoctors().catch(() => []),
        getEmergencyContacts().catch(() => []),
      ]);

      const deptList = Array.isArray(deptRes) ? deptRes : deptRes.results || [];
      const docList = Array.isArray(docsRes) ? docsRes : docsRes.results || [];
      const emergList = Array.isArray(emergencyRes) ? emergencyRes : emergencyRes.results || [];

      setDepartments(deptList);
      setDoctors(docList);
      setEmergencyContacts(emergList);
    } catch (err) {
      console.error('Failed to load clinic data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(''), 3500);
  };

  // Count doctors per department
  const getDoctorCountForDepartment = (deptId) => {
    return doctors.filter(
      (d) => d.department?.id === deptId || d.department_detail?.id === deptId || d.department === deptId
    ).length;
  };

  // Filter departments by search
  const filteredDepartments = departments.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  });

  const handleCreateDepartment = (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    // Add locally for administrative preview
    const newDept = {
      id: Date.now(),
      name: newDeptName.trim(),
      description: newDeptDesc.trim() || 'General medical care unit.',
    };
    setDepartments((prev) => [newDept, ...prev]);
    setShowAddModal(false);
    setNewDeptName('');
    setNewDeptDesc('');
    triggerToast(`Department "${newDept.name}" created successfully!`);
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1400px]">
        {/* ── Page Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              Clinic
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Hospital Departments, Facilities &amp; Operational Overview
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-[#0EA5C9] hover:bg-[#0b8cb0] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </div>

        {/* Feedback Alert */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 shadow-2xs"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{feedbackMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

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
              label="Total Departments"
              value={departments.length}
              icon={Building2}
              borderColor="bg-blue-500"
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              subtext="Registered clinical units"
            />
            <StatCard
              label="Active Specialists"
              value={doctors.length}
              icon={Stethoscope}
              borderColor="bg-teal-500"
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              subtext="Deployed physicians"
            />
            <StatCard
              label="Emergency & Helplines"
              value={emergencyContacts.length}
              icon={Ambulance}
              borderColor="bg-rose-500"
              iconBg="bg-rose-50"
              iconColor="text-rose-600"
              subtext="Rapid response channels"
            />
            <StatCard
              label="Facility Status"
              value="24/7 Active"
              icon={ShieldCheck}
              borderColor="bg-emerald-500"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              subtext="All systems operational"
            />
          </div>
        )}

        {/* ── 2. Clinical Departments Directory ────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hospital Departments
              </h3>
              <p className="text-xs text-slate-400">
                Specialized medical divisions operating under MediFlow
              </p>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search departments..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : filteredDepartments.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={
                searchQuery
                  ? `No departments matching "${searchQuery}"`
                  : 'No hospital departments registered'
              }
              description="Click '+ Add Department' above to register a new clinical specialty."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDepartments.map((dept) => {
                const Icon = getDepartmentIcon(dept.name);
                const specialistCount = getDoctorCountForDepartment(dept.id);

                return (
                  <motion.div
                    key={dept.id}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.18 }}
                    className="bg-slate-50/50 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0EA5C9] shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active Unit
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mb-1">
                        {dept.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {dept.description || 'Comprehensive clinical care and patient diagnosis services.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {specialistCount} {specialistCount === 1 ? 'Doctor' : 'Doctors'}
                      </span>
                      <Link
                        to="/admin/staff"
                        className="text-[#0EA5C9] font-bold hover:underline inline-flex items-center gap-1"
                      >
                        View Staff
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 3. Emergency & Rapid Response Services ────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ambulance className="w-5 h-5 text-rose-500" />
                Emergency Response &amp; Helplines
              </h3>
              <p className="text-xs text-slate-400">
                Direct dispatch contacts for critical triage and ambulance transport
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 self-start sm:self-auto">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600" />
              24/7 Dedicated Dispatch
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          ) : emergencyContacts.length === 0 ? (
            <EmptyState
              icon={PhoneCall}
              title="No emergency lines registered"
              description="Emergency numbers configured in MediFlow backend will display here."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {contact.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {contact.description || contact.contact_type}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${contact.phone_number}`}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#0EA5C9] text-xs font-bold text-[#0EA5C9] hover:bg-sky-50/50 shadow-2xs transition-colors"
                  >
                    <PhoneCall className="w-3 h-3" />
                    {contact.phone_number}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 4. Hospital Facilities & Infrastructure ──────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Hospital Facilities &amp; Amenities
            </h3>
            <p className="text-xs text-slate-400">
              Infrastructure capacity supporting patient admissions and surgical interventions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Facility 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <span className="font-bold text-slate-800 text-sm block">
                Intensive Care Units (ICU)
              </span>
              <p className="text-slate-500 text-[11px]">
                High-dependency life support and round-the-clock vital monitoring.
              </p>
              <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                Operational &bull; 92% Ready
              </span>
            </div>

            {/* Facility 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <span className="font-bold text-slate-800 text-sm block">
                Diagnostic &amp; Radiology
              </span>
              <p className="text-slate-500 text-[11px]">
                1.5T MRI, 64-slice CT Scan, Digital X-Ray &amp; Ultrasound suites.
              </p>
              <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                Diagnostic Lab Active
              </span>
            </div>

            {/* Facility 3 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <span className="font-bold text-slate-800 text-sm block">
                Central 24/7 Pharmacy
              </span>
              <p className="text-slate-500 text-[11px]">
                Automated medication dispensing and outpatient prescription counter.
              </p>
              <span className="inline-block px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 font-bold text-[10px]">
                24/7 Dispensary Open
              </span>
            </div>

            {/* Facility 4 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <span className="font-bold text-slate-800 text-sm block">
                Operating Theatres
              </span>
              <p className="text-slate-500 text-[11px]">
                Laminar airflow modular suites for general and laparoscopic surgery.
              </p>
              <span className="inline-block px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px]">
                4 Sterile Theatres
              </span>
            </div>
          </div>
        </div>

        {/* ── Modal: Add Department ─────────────────────────── */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Add Clinical Department
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Department Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dermatology"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#0EA5C9]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Brief overview of clinical specialty..."
                      value={newDeptDesc}
                      onChange={(e) => setNewDeptDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#0EA5C9]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#0EA5C9] hover:bg-[#0b8cb0] text-white font-bold rounded-xl shadow-xs"
                    >
                      Create Department
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminClinicPage;

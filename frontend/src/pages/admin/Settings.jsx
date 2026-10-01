import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  ShieldAlert,
  User,
  CheckCircle2,
  Info,
  Save,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Bell,
  ScrollText,
  Users,
  Receipt,
  AlertCircle,
  Camera,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import useProfilePhoto from '../../hooks/useProfilePhoto';

/* ── Toggle Switch Component ──────────────────────────────── */
const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
      checked ? 'bg-[#0EA5C9]' : 'bg-slate-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const AdminSettingsPage = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const storageKey = `mediflow_settings_admin_${currentUser?.email || 'default'}`;

  // Profile photo hook
  const { photoUrl, uploading, uploadError, handlePhotoChange, removePhoto } =
    useProfilePhoto(currentUser?.email);
  const photoInputRef = useRef(null);

  // Name splitting with crash-safe fallback
  const rawFullName = currentUser?.full_name || 'Admin User';
  const nameParts = rawFullName.trim().split(' ');
  const defaultFirstName = nameParts[0] || 'Admin';
  const defaultLastName = nameParts.slice(1).join(' ') || '';

  // 1. Hospital Facility Settings State
  const [facilityName, setFacilityName] = useState('MediFlow AI Healthcare');
  const [emergencyPhone, setEmergencyPhone] = useState('+1-123-556-5523');
  const [supportEmail, setSupportEmail] = useState('support@mediflow.ai');
  const [facilityAddress, setFacilityAddress] = useState('Main Medical Block, Tower A, Health City');
  const [operatingHours, setOperatingHours] = useState('24/7 Emergency & Inpatient Services; OPD 08:00 - 20:00');

  // 2. Administrator Account Profile State
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [adminTitle, setAdminTitle] = useState('Hospital Super Administrator');
  const [phone, setPhone] = useState('+91 98765 43210');

  // 3. Clinical Governance & Operations State
  const [requireDoctorApproval, setRequireDoctorApproval] = useState(true);
  const [autoTriageEmergency, setAutoTriageEmergency] = useState(true);
  const [enableAuditLogs, setEnableAuditLogs] = useState(true);
  const [defaultCurrency] = useState('INR (₹)');

  // 4. Hospital System Alerts & Notifications State
  const [alertUrgentEmergency, setAlertUrgentEmergency] = useState(true);
  const [alertDoctorRegister, setAlertDoctorRegister] = useState(true);
  const [alertHighValueInvoice, setAlertHighValueInvoice] = useState(true);
  const [alertDailyDigest, setAlertDailyDigest] = useState(true);

  // 5. Toast Feedback
  const [toastMessage, setToastMessage] = useState('');

  // Load persisted preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.facilityName) setFacilityName(parsed.facilityName);
        if (parsed.emergencyPhone) setEmergencyPhone(parsed.emergencyPhone);
        if (parsed.supportEmail) setSupportEmail(parsed.supportEmail);
        if (parsed.facilityAddress) setFacilityAddress(parsed.facilityAddress);
        if (parsed.operatingHours) setOperatingHours(parsed.operatingHours);
        if (parsed.firstName) setFirstName(parsed.firstName);
        if (parsed.lastName !== undefined) setLastName(parsed.lastName);
        if (parsed.adminTitle) setAdminTitle(parsed.adminTitle);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.requireDoctorApproval !== undefined) setRequireDoctorApproval(parsed.requireDoctorApproval);
        if (parsed.autoTriageEmergency !== undefined) setAutoTriageEmergency(parsed.autoTriageEmergency);
        if (parsed.enableAuditLogs !== undefined) setEnableAuditLogs(parsed.enableAuditLogs);
        if (parsed.alertUrgentEmergency !== undefined) setAlertUrgentEmergency(parsed.alertUrgentEmergency);
        if (parsed.alertDoctorRegister !== undefined) setAlertDoctorRegister(parsed.alertDoctorRegister);
        if (parsed.alertHighValueInvoice !== undefined) setAlertHighValueInvoice(parsed.alertHighValueInvoice);
        if (parsed.alertDailyDigest !== undefined) setAlertDailyDigest(parsed.alertDailyDigest);
      }
    } catch (e) {
      console.error('Failed to load admin settings', e);
    }
  }, [storageKey]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Save Settings Handler
  const handleSave = (e) => {
    e.preventDefault();
    const updatedFullName = `${firstName} ${lastName}`.trim() || 'Admin User';

    const payload = {
      facilityName,
      emergencyPhone,
      supportEmail,
      facilityAddress,
      operatingHours,
      firstName,
      lastName,
      fullName: updatedFullName,
      adminTitle,
      phone,
      requireDoctorApproval,
      autoTriageEmergency,
      enableAuditLogs,
      alertUrgentEmergency,
      alertDoctorRegister,
      alertHighValueInvoice,
      alertDailyDigest,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      if (currentUser && setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          full_name: updatedFullName,
        });
      }
      triggerToast('Hospital facility & administrator settings saved successfully!');
    } catch (err) {
      console.error(err);
      triggerToast('Could not save settings.');
    }
  };

  // Reset to Defaults
  const handleReset = () => {
    setFacilityName('MediFlow AI Healthcare');
    setEmergencyPhone('+1-123-556-5523');
    setSupportEmail('support@mediflow.ai');
    setFacilityAddress('Main Medical Block, Tower A, Health City');
    setOperatingHours('24/7 Emergency & Inpatient Services; OPD 08:00 - 20:00');
    setFirstName(defaultFirstName);
    setLastName(defaultLastName);
    setAdminTitle('Hospital Super Administrator');
    setPhone('+91 98765 43210');
    setRequireDoctorApproval(true);
    setAutoTriageEmergency(true);
    setEnableAuditLogs(true);
    setAlertUrgentEmergency(true);
    setAlertDoctorRegister(true);
    setAlertHighValueInvoice(true);
    setAlertDailyDigest(true);
    try {
      localStorage.removeItem(storageKey);
      if (currentUser && setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          full_name: rawFullName,
        });
      }
      triggerToast('System settings reset to default values.');
    } catch (err) {
      console.error(err);
    }
  };

  // Crash-safe initials
  const initials = `${(firstName || 'A')[0] || 'A'}${(lastName || '')[0] || ''}`.toUpperCase();

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px]">

        {/* ── Page Header ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Hospital System Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure hospital facility parameters, operating policies, clinical governance rules, and alerts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#E0F4F9] text-[#0B7EA0] border border-[#0EA5C9]/20">
              <Shield className="w-3.5 h-3.5 text-[#0EA5C9]" />
              Super Administrator Console
            </span>
          </div>
        </div>

        {/* ── Toast Notification ────────────────────────────── */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 2-Column Responsive Layout ────────────────────── */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ══════════ COLUMN 1: ADMIN IDENTITY & QUICK PORTALS ══════════ */}
          <div className="lg:col-span-1 space-y-6">

            {/* Admin Profile Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
              <div className="text-center space-y-3">
                {/* ── Photo Upload Area ── */}
                <div className="relative w-24 h-24 mx-auto">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0EA5C9] to-sky-400 text-white text-3xl font-extrabold flex items-center justify-center shadow-md border-4 border-white">
                      {initials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploading}
                    title="Upload profile photo"
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#0EA5C9] text-white flex items-center justify-center shadow-md hover:bg-[#0B7EA0] transition-colors disabled:opacity-60"
                  >
                    {uploading ? (
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
                )}
                {photoUrl && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove photo
                  </button>
                )}

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {firstName} {lastName}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{currentUser?.email || 'admin@mediflow.ai'}</p>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    <Shield className="w-3.5 h-3.5" />
                    {adminTitle}
                  </div>
                </div>
              </div>

              {/* Facility Details Box */}
              <div className="border-t border-slate-100 pt-5 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    Facility
                  </span>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">{facilityName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-4 h-4 text-slate-400" />
                    Emergency
                  </span>
                  <span className="font-semibold text-slate-800">{emergencyPhone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Receipt className="w-4 h-4 text-slate-400" />
                    Currency
                  </span>
                  <span className="font-bold text-slate-800">{defaultCurrency}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400">
                    <ScrollText className="w-4 h-4 text-slate-400" />
                    Audit Status
                  </span>
                  <span className="font-bold text-emerald-600">Continuous Logging</span>
                </div>
              </div>
            </div>

            {/* Administrative Quick Portals */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Operational Portals
              </h3>

              <Link
                to="/admin/staff"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-[#E0F4F9]/50 border border-slate-200/70 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#0EA5C9] transition-colors">
                      Staff Directory &amp; Approvals
                    </p>
                    <p className="text-[11px] text-slate-400">Verify &amp; manage hospital doctors</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0EA5C9] transition-colors" />
              </Link>

              <Link
                to="/admin/audit-logs"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-[#E0F4F9]/50 border border-slate-200/70 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0EA5C9] flex items-center justify-center font-bold">
                    <ScrollText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#0EA5C9] transition-colors">
                      Security &amp; Regulatory Audit Logs
                    </p>
                    <p className="text-[11px] text-slate-400">Review clinical event logs &amp; IP traces</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0EA5C9] transition-colors" />
              </Link>
            </div>

          </div>

          {/* ══════════ COLUMN 2 & 3: FORMS & CONTROLS ══════════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Section 1: Hospital Facility Configuration */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0EA5C9]" />
                  Hospital &amp; Healthcare Facility Profile
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure facility branding, official contact channels, and emergency helplines
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Facility / Hospital Name
                  </label>
                  <input
                    type="text"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    24/7 Emergency Helpline
                  </label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Official Support Email
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Campus Address / Block
                  </label>
                  <input
                    type="text"
                    value={facilityAddress}
                    onChange={(e) => setFacilityAddress(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Facility Operating Hours Schedule
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                />
              </div>
            </div>

            {/* Section 2: Administrator Profile */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0EA5C9]" />
                  Administrator Identity &amp; Designation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your hospital administrator identity and executive designation
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Administrator Email (Verified)
                  </label>
                  <input
                    type="email"
                    value={currentUser?.email || 'admin@mediflow.ai'}
                    disabled
                    className="w-full bg-slate-50 border border-slate-200 text-slate-400 text-sm rounded-xl px-3.5 py-2.5 cursor-not-allowed select-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Administrative Designation
                  </label>
                  <select
                    value={adminTitle}
                    onChange={(e) => setAdminTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                  >
                    <option value="Hospital Super Administrator">Hospital Super Administrator</option>
                    <option value="Clinical Operations Lead">Clinical Operations Lead</option>
                    <option value="Chief Medical Officer">Chief Medical Officer (CMO)</option>
                    <option value="Hospital Managing Director">Hospital Managing Director</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Direct Contact Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                />
              </div>
            </div>

            {/* Section 3: Clinical Governance & Operations Policies */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#0EA5C9]" />
                  Clinical Governance &amp; Operating Policies
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure hospital authorization rules and consultation priority workflows
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Mandatory Doctor Verification Gate
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Require administrator signoff before newly registered doctors can attend patients
                    </p>
                  </div>
                  <ToggleSwitch checked={requireDoctorApproval} onChange={setRequireDoctorApproval} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Emergency Triage Auto-Prioritization
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Automatically position emergency patient consults at the top of doctors' queues
                    </p>
                  </div>
                  <ToggleSwitch checked={autoTriageEmergency} onChange={setAutoTriageEmergency} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Regulatory Audit Trail Logging
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Log all clinical and administrative actions continuously for healthcare compliance
                    </p>
                  </div>
                  <ToggleSwitch checked={enableAuditLogs} onChange={setEnableAuditLogs} />
                </div>
              </div>
            </div>

            {/* Section 4: System Alerts & Broadcaster */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#0EA5C9]" />
                  System Notifications &amp; Alert Broadcaster
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Control high-priority notifications dispatched to hospital administrators
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Urgent Emergency Department Alerts</p>
                    <p className="text-[11px] text-slate-500">High-priority alerts for critical ER triage admissions</p>
                  </div>
                  <ToggleSwitch checked={alertUrgentEmergency} onChange={setAlertUrgentEmergency} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">New Practitioner Registration Pending</p>
                    <p className="text-[11px] text-slate-500">Alerts when doctors register and require license approval</p>
                  </div>
                  <ToggleSwitch checked={alertDoctorRegister} onChange={setAlertDoctorRegister} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">High-Value Invoice Settlements</p>
                    <p className="text-[11px] text-slate-500">Notifications when major billing collections are settled</p>
                  </div>
                  <ToggleSwitch checked={alertHighValueInvoice} onChange={setAlertHighValueInvoice} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Daily Hospital Census &amp; Occupancy Digest</p>
                    <p className="text-[11px] text-slate-500">Daily automated summary of bed occupancy, revenue &amp; appointments</p>
                  </div>
                  <ToggleSwitch checked={alertDailyDigest} onChange={setAlertDailyDigest} />
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All facility settings are strictly enforced across hospital departments.</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  Reset Defaults
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#0EA5C9] hover:bg-[#0B8BAA] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow"
                >
                  <Save className="w-4 h-4" />
                  Save System Settings
                </button>
              </div>
            </div>

          </div>
        </form>

      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;

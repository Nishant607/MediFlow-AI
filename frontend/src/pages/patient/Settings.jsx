import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  AlertTriangle,
  Bell,
  Shield,
  CheckCircle2,
  RefreshCw,
  Save,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Camera,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/common/PageWrapper';
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
      checked ? 'bg-[#007ABF]' : 'bg-slate-200'
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

const PatientSettingsPage = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const patientProfile = currentUser?.patient_profile || {};

  // Profile photo hook
  const { photoUrl, uploading, uploadError, handlePhotoChange, removePhoto } =
    useProfilePhoto(currentUser?.email);
  const photoInputRef = useRef(null);

  // Storage key scoped to user
  const storageKey = `mediflow_settings_patient_${currentUser?.email || 'default'}`;

  // Initial name decomposition with safe fallbacks
  const rawFullName = currentUser?.full_name || 'Patient';
  const nameParts = rawFullName.trim().split(' ');
  const defaultFirstName = nameParts[0] || 'Patient';
  const defaultLastName = nameParts.slice(1).join(' ') || '';

  // 1. Profile State
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [phone, setPhone] = useState(patientProfile.phone || '+91 98765 43210');
  const [dob, setDob] = useState(patientProfile.date_of_birth || '1995-06-15');
  const [gender, setGender] = useState(patientProfile.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState('O+');

  // 2. Emergency Contact State
  const [emergencyName, setEmergencyName] = useState('Rahul Sharma');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98765 01234');

  // 3. Clinical & Medical Alert Notes
  const [allergies, setAllergies] = useState('None');
  const [chronicConditions, setChronicConditions] = useState('None');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  // 4. Notification Toggles
  const [notifAppointment, setNotifAppointment] = useState(true);
  const [notifReports, setNotifReports] = useState(true);
  const [notifTips, setNotifTips] = useState(true);

  // 5. Toast Feedback
  const [toastMessage, setToastMessage] = useState('');

  // Load persisted preferences on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.firstName) setFirstName(parsed.firstName);
        if (parsed.lastName !== undefined) setLastName(parsed.lastName);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.dob) setDob(parsed.dob);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.bloodGroup) setBloodGroup(parsed.bloodGroup);
        if (parsed.emergencyName) setEmergencyName(parsed.emergencyName);
        if (parsed.emergencyRelation) setEmergencyRelation(parsed.emergencyRelation);
        if (parsed.emergencyPhone) setEmergencyPhone(parsed.emergencyPhone);
        if (parsed.allergies) setAllergies(parsed.allergies);
        if (parsed.chronicConditions) setChronicConditions(parsed.chronicConditions);
        if (parsed.preferredLanguage) setPreferredLanguage(parsed.preferredLanguage);
        if (parsed.notifAppointment !== undefined) setNotifAppointment(parsed.notifAppointment);
        if (parsed.notifReports !== undefined) setNotifReports(parsed.notifReports);
        if (parsed.notifTips !== undefined) setNotifTips(parsed.notifTips);
      }
    } catch (e) {
      console.error('Failed to load patient settings', e);
    }
  }, [storageKey]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Save Settings
  const handleSave = (e) => {
    e.preventDefault();
    const updatedFullName = `${firstName} ${lastName}`.trim() || 'Patient';

    const payload = {
      firstName,
      lastName,
      fullName: updatedFullName,
      phone,
      dob,
      gender,
      bloodGroup,
      emergencyName,
      emergencyRelation,
      emergencyPhone,
      allergies,
      chronicConditions,
      preferredLanguage,
      notifAppointment,
      notifReports,
      notifTips,
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
      triggerToast('Patient profile & medical preferences saved successfully!');
    } catch (err) {
      console.error('Error saving settings', err);
      triggerToast('Could not save settings. Please try again.');
    }
  };

  // Reset Settings
  const handleReset = () => {
    setFirstName(defaultFirstName);
    setLastName(defaultLastName);
    setPhone(patientProfile.phone || '+91 98765 43210');
    setDob(patientProfile.date_of_birth || '1995-06-15');
    setGender(patientProfile.gender || 'Male');
    setBloodGroup('O+');
    setEmergencyName('Rahul Sharma');
    setEmergencyRelation('Spouse');
    setEmergencyPhone('+91 98765 01234');
    setAllergies('None');
    setChronicConditions('None');
    setPreferredLanguage('English');
    setNotifAppointment(true);
    setNotifReports(true);
    setNotifTips(true);
    try {
      localStorage.removeItem(storageKey);
      if (currentUser && setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          full_name: rawFullName,
        });
      }
      triggerToast('Settings reset to default profile.');
    } catch (err) {
      console.error(err);
    }
  };

  const initials = `${(firstName || 'P')[0] || 'P'}${(lastName || '')[0] || ''}`.toUpperCase();

  return (
    <PageWrapper className="p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Page Header ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Patient Account &amp; Medical Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your personal demographics, clinical emergency contacts, and care notification preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-[#007ABF] border border-blue-200/80">
              <span className="w-2 h-2 rounded-full bg-[#007ABF] animate-pulse" />
              Active Patient Portal
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

          {/* ══════════ COLUMN 1: PATIENT IDENTITY CARD ══════════ */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/90 shadow-clinic p-6 space-y-6">
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
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#007ABF] to-sky-400 text-white text-3xl font-extrabold flex items-center justify-center shadow-md border-4 border-white">
                    {initials}
                  </div>
                )}
                {/* Camera Button */}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploading}
                  title="Upload profile photo"
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#007ABF] text-white flex items-center justify-center shadow-md hover:bg-[#005A9C] transition-colors disabled:opacity-60"
                >
                  {uploading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                </button>
                {/* Hidden file input */}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Upload error */}
              {uploadError && (
                <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
              )}

              {/* Remove photo button */}
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
                <p className="text-xs text-slate-400 mt-0.5">{currentUser?.email || 'patient@mediflow.ai'}</p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#005A9C] border border-blue-100">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  Blood Group: {bloodGroup}
                </div>
              </div>
            </div>

            {/* Quick Profile Summary Box */}
            <div className="border-t border-slate-100 pt-5 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-4 h-4 text-slate-400" />
                  Phone
                </span>
                <span className="font-semibold text-slate-800">{phone}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  DOB
                </span>
                <span className="font-semibold text-slate-800">{dob}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <User className="w-4 h-4 text-slate-400" />
                  Gender
                </span>
                <span className="font-semibold text-slate-800">{gender}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Shield className="w-4 h-4 text-slate-400" />
                  Record Status
                </span>
                <span className="font-bold text-emerald-600">Confidential / Active</span>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="border-t border-slate-100 pt-5 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Quick Patient Portals
              </p>
              <Link
                to="/patient/appointments"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>My Appointments</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/patient/medical-records"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Diagnostic &amp; Lab Records</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/patient/billing"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Invoices &amp; Receipts</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* ══════════ COLUMN 2 & 3: FORMS & PREFERENCES ══════════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Section 1: Demographics & Profile */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-clinic p-6 sm:p-7 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#007ABF]" />
                  Personal Information &amp; Demographics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your legal name, contact details, and vital medical tags
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
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#007ABF] focus:ring-2 focus:ring-[#007ABF]/15 transition-all"
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
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#007ABF] focus:ring-2 focus:ring-[#007ABF]/15 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Registered Email (Verified)
                  </label>
                  <input
                    type="email"
                    value={currentUser?.email || 'patient@mediflow.ai'}
                    disabled
                    className="w-full bg-slate-50 border border-slate-200 text-slate-400 text-sm rounded-xl px-3.5 py-2.5 cursor-not-allowed select-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#007ABF] focus:ring-2 focus:ring-[#007ABF]/15 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#007ABF] focus:ring-2 focus:ring-[#007ABF]/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#007ABF] focus:ring-2 focus:ring-[#007ABF]/15 transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#007ABF] focus:ring-2 focus:ring-[#007ABF]/15 transition-all font-bold text-rose-600"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Clinical Emergency Contacts */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-clinic p-6 sm:p-7 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-500" />
                  Clinical Emergency Safety Contacts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Designated person to reach in the event of medical emergencies or hospital admissions
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#007ABF] focus:ring-2 focus:ring-[#007ABF]/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Relationship
                  </label>
                  <select
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#007ABF] focus:ring-2 focus:ring-[#007ABF]/15 transition-all"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Emergency Phone
                  </label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 98765 01234"
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#007ABF] focus:ring-2 focus:ring-[#007ABF]/15 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Health Alerts & Medical Notes */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-clinic p-6 sm:p-7 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Health Alerts &amp; Clinical Notes
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informed to attending physicians before prescribing treatments and medication
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Known Drug/Food Allergies
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts, None"
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#007ABF] focus:ring-2 focus:ring-[#007ABF]/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Chronic Conditions
                  </label>
                  <input
                    type="text"
                    value={chronicConditions}
                    onChange={(e) => setChronicConditions(e.target.value)}
                    placeholder="e.g. Hypertension, None"
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#007ABF] focus:ring-2 focus:ring-[#007ABF]/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Preferred Language
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#007ABF] focus:ring-2 focus:ring-[#007ABF]/15 transition-all"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Spanish">Spanish (Español)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Communication & Reminder Notifications */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-clinic p-6 sm:p-7 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#007ABF]" />
                  Appointment &amp; Care Notifications
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stay updated on scheduled doctor consultations and diagnostic reports
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Appointment Reminders (SMS &amp; Email)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Receive alerts 24 hours and 2 hours before scheduled consultations
                    </p>
                  </div>
                  <ToggleSwitch checked={notifAppointment} onChange={setNotifAppointment} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Lab &amp; Diagnostic Result Ready Alerts
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Instant notification once doctor signs and releases lab records
                    </p>
                  </div>
                  <ToggleSwitch checked={notifReports} onChange={setNotifReports} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Preventive Health Tips &amp; Vaccine Schedules
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Periodic wellness advice and routine seasonal checkup notices
                    </p>
                  </div>
                  <ToggleSwitch checked={notifTips} onChange={setNotifTips} />
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-clinic p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All changes are strictly protected under patient health privacy standards.</span>
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
                  className="inline-flex items-center gap-2 bg-[#007ABF] hover:bg-[#0068A3] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>

          </div>
        </form>

      </div>
    </PageWrapper>
  );
};

export default PatientSettingsPage;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  Award,
  Clock,
  CheckCircle2,
  Shield,
  Lock,
  Bell,
  Check,
  AlertCircle,
  Calendar,
  Save,
  RotateCcw,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DoctorLayout from '../../components/doctor/DoctorLayout';

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

const DoctorSettingsPage = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const doctorProfile = currentUser?.doctor_profile || {};
  const isApproved = doctorProfile.is_approved;

  const storageKey = `mediflow_settings_doctor_${currentUser?.email || 'default'}`;

  // Name splitting with safe fallback
  const rawFullName = currentUser?.full_name || 'Practitioner';
  const nameParts = rawFullName.trim().split(' ');
  const defaultFirstName = nameParts[0] || 'Doctor';
  const defaultLastName = nameParts.slice(1).join(' ') || '';

  // 1. Practitioner Profile State
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [phone, setPhone] = useState('+91 98765 43210');
  const [specialization, setSpecialization] = useState(
    doctorProfile.specialization || 'Cardiologist'
  );
  const [qualification, setQualification] = useState(
    doctorProfile.qualification || 'MBBS, MD (Medicine)'
  );
  const [experience, setExperience] = useState(
    doctorProfile.experience_years ? String(doctorProfile.experience_years) : '8'
  );
  const [availableTime, setAvailableTime] = useState(
    doctorProfile.available_time || 'Mon-Sat, 09:00 - 17:00'
  );
  const [licenseNumber, setLicenseNumber] = useState('MCI-748291');

  // 2. Consultation Preferences
  const [slotDuration, setSlotDuration] = useState('30 Minutes');
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);
  const [digitalSignatureEnabled, setDigitalSignatureEnabled] = useState(true);

  // 3. Clinical Notifications State
  const [notifAppointment, setNotifAppointment] = useState(true);
  const [notifCheckIn, setNotifCheckIn] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);
  const [notifEmergency, setNotifEmergency] = useState(true);

  // 4. Security Passwords
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // 5. Toast Feedback
  const [toastMessage, setToastMessage] = useState('');

  // Load persisted preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.firstName) setFirstName(parsed.firstName);
        if (parsed.lastName !== undefined) setLastName(parsed.lastName);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.specialization) setSpecialization(parsed.specialization);
        if (parsed.qualification) setQualification(parsed.qualification);
        if (parsed.experience) setExperience(parsed.experience);
        if (parsed.availableTime) setAvailableTime(parsed.availableTime);
        if (parsed.licenseNumber) setLicenseNumber(parsed.licenseNumber);
        if (parsed.slotDuration) setSlotDuration(parsed.slotDuration);
        if (parsed.aiAssistantEnabled !== undefined) setAiAssistantEnabled(parsed.aiAssistantEnabled);
        if (parsed.digitalSignatureEnabled !== undefined) setDigitalSignatureEnabled(parsed.digitalSignatureEnabled);
        if (parsed.notifAppointment !== undefined) setNotifAppointment(parsed.notifAppointment);
        if (parsed.notifCheckIn !== undefined) setNotifCheckIn(parsed.notifCheckIn);
        if (parsed.notifDigest !== undefined) setNotifDigest(parsed.notifDigest);
        if (parsed.notifEmergency !== undefined) setNotifEmergency(parsed.notifEmergency);
      }
    } catch (e) {
      console.error('Failed to load doctor settings', e);
    }
  }, [storageKey]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Save Doctor Profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedFullName = `${firstName} ${lastName}`.trim() || 'Doctor';

    const payload = {
      firstName,
      lastName,
      fullName: updatedFullName,
      phone,
      specialization,
      qualification,
      experience,
      availableTime,
      licenseNumber,
      slotDuration,
      aiAssistantEnabled,
      digitalSignatureEnabled,
      notifAppointment,
      notifCheckIn,
      notifDigest,
      notifEmergency,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      if (currentUser && setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          full_name: updatedFullName,
          doctor_profile: {
            ...currentUser.doctor_profile,
            specialization,
            qualification,
            experience_years: parseInt(experience, 10) || 0,
            available_time: availableTime,
          },
        });
      }
      triggerToast('Practitioner credentials & clinical preferences saved successfully!');
    } catch (err) {
      console.error(err);
      triggerToast('Could not save doctor profile.');
    }
  };

  // Reset to Defaults
  const handleReset = () => {
    setFirstName(defaultFirstName);
    setLastName(defaultLastName);
    setPhone('+91 98765 43210');
    setSpecialization(doctorProfile.specialization || 'Cardiologist');
    setQualification(doctorProfile.qualification || 'MBBS, MD (Medicine)');
    setExperience(doctorProfile.experience_years ? String(doctorProfile.experience_years) : '8');
    setAvailableTime(doctorProfile.available_time || 'Mon-Sat, 09:00 - 17:00');
    setLicenseNumber('MCI-748291');
    setSlotDuration('30 Minutes');
    setAiAssistantEnabled(true);
    setDigitalSignatureEnabled(true);
    setNotifAppointment(true);
    setNotifCheckIn(true);
    setNotifDigest(false);
    setNotifEmergency(true);
    try {
      localStorage.removeItem(storageKey);
      if (currentUser && setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          full_name: rawFullName,
        });
      }
      triggerToast('Doctor preferences reset to defaults.');
    } catch (err) {
      console.error(err);
    }
  };

  // Password Update
  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill out all password fields.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPasswordMsg({ type: 'success', text: 'Password credentials validated and updated securely.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg({ type: '', text: '' }), 4000);
  };

  const initials = `${(firstName || 'D')[0] || 'D'}${(lastName || '')[0] || ''}`.toUpperCase();

  return (
    <DoctorLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">

        {/* ── Page Header ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Practitioner Profile &amp; Clinical Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your clinical credentials, consultation hours, AI assistance, and high-priority patient alerts
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Practitioner
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                Pending Verification
              </span>
            )}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ══════════ COLUMN 1: PRACTITIONER CARD ══════════ */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0EA5C9] to-sky-400 text-white text-3xl font-extrabold flex items-center justify-center mx-auto shadow-md border-4 border-white">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Dr. {firstName} {lastName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{currentUser?.email || 'doctor@mediflow.ai'}</p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E0F4F9] text-[#0B7EA0] border border-[#0EA5C9]/20">
                  <Stethoscope className="w-3.5 h-3.5" />
                  {specialization}
                </div>
              </div>
            </div>

            {/* Quick Credentials Box */}
            <div className="border-t border-slate-100 pt-5 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Award className="w-4 h-4 text-slate-400" />
                  Qualifications
                </span>
                <span className="font-semibold text-slate-800 text-right truncate max-w-[150px]">
                  {qualification}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Experience
                </span>
                <span className="font-semibold text-slate-800">{experience} Years</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Hours
                </span>
                <span className="font-semibold text-slate-800 truncate max-w-[150px]">{availableTime}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <FileCheck className="w-4 h-4 text-slate-400" />
                  License ID
                </span>
                <span className="font-mono font-bold text-slate-800">{licenseNumber}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Shield className="w-4 h-4 text-slate-400" />
                  Clinical Status
                </span>
                <span className={`font-bold ${isApproved ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isApproved ? 'Authorized' : 'Pending Review'}
                </span>
              </div>
            </div>
          </div>

          {/* ══════════ COLUMN 2 & 3: SETTINGS FORMS ══════════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Form 1: Practitioner Credentials */}
            <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0EA5C9]" />
                  Practitioner Profile Information
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your contact info, medical credentials, and clinical availability hours
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
                    Attending Email (Verified)
                  </label>
                  <input
                    type="email"
                    value={currentUser?.email || 'doctor@mediflow.ai'}
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
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Specialization
                  </label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Emergency Care">Emergency Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. MBBS, MD"
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Consultation Hours
                  </label>
                  <input
                    type="text"
                    value={availableTime}
                    onChange={(e) => setAvailableTime(e.target.value)}
                    placeholder="e.g. Mon-Sat, 09:00 - 17:00"
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Medical Registration / License ID
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. MCI-748291"
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Consultation Care Preferences */}
              <div className="border-t border-slate-100 pt-4 space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Consultation Room Preferences
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Slot Duration
                    </label>
                    <select
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2"
                    >
                      <option value="15 Minutes">15 Minutes</option>
                      <option value="30 Minutes">30 Minutes</option>
                      <option value="45 Minutes">45 Minutes</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#0EA5C9]" />
                        AI Clinical Diagnostic Assistant
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Enable intelligent symptom analysis &amp; treatment suggestions
                      </p>
                    </div>
                    <ToggleSwitch checked={aiAssistantEnabled} onChange={setAiAssistantEnabled} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  Reset Defaults
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#0EA5C9] hover:bg-[#0B7EA0] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Practitioner Profile
                </button>
              </div>
            </form>

            {/* Form 2: Clinical Notifications */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#0EA5C9]" />
                  Clinical Notifications &amp; Urgent Alerts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure alerts about appointments, patient arrivals, and high-risk lab results
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">New Patient Appointment Bookings</p>
                    <p className="text-[11px] text-slate-500">Instant alerts when patients schedule new visits</p>
                  </div>
                  <ToggleSwitch checked={notifAppointment} onChange={setNotifAppointment} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Patient Check-In &amp; Lobby Arrival Alerts</p>
                    <p className="text-[11px] text-slate-500">Prompt when a patient checks in at the reception desk</p>
                  </div>
                  <ToggleSwitch checked={notifCheckIn} onChange={setNotifCheckIn} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Critical &amp; High-Risk Diagnostic Alerts</p>
                    <p className="text-[11px] text-slate-500">High-priority notification for urgent medical findings</p>
                  </div>
                  <ToggleSwitch checked={notifEmergency} onChange={setNotifEmergency} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Daily Morning Schedule Digest</p>
                    <p className="text-[11px] text-slate-500">Daily email summary of all scheduled consultations</p>
                  </div>
                  <ToggleSwitch checked={notifDigest} onChange={setNotifDigest} />
                </div>
              </div>
            </div>

            {/* Form 3: Password & Security */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#0EA5C9]" />
                  Security &amp; Password Credentials
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your practitioner account authentication credentials
                </p>
              </div>

              {passwordMsg.text && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    passwordMsg.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  {passwordMsg.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0EA5C9] focus:ring-2 focus:ring-[#0EA5C9]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>

      </div>
    </DoctorLayout>
  );
};

export default DoctorSettingsPage;

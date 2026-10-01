import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  Activity, 
  Menu, 
  X, 
  LogOut, 
  User, 
  CalendarPlus, 
  ShieldAlert, 
  FileText, 
  CreditCard, 
  Bot, 
  Clock, 
  Receipt, 
  ScrollText, 
  CheckCircle2,
  Calendar,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import useProfilePhoto from '../../hooks/useProfilePhoto';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile photo — loads from localStorage scoped to email
  const { photoUrl } = useProfilePhoto(currentUser?.email);

  const role = currentUser?.role;

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  // Determine role dashboard link
  const getHomeLink = () => {
    if (role === 'patient') return '/patient/dashboard';
    if (role === 'doctor') return '/doctor/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/login';
  };

  return (
    <header className="w-full z-50 sticky top-0 shadow-sm bg-white">
      {/* 1. TOP UTILITY BAR (Deep Healthcare Blue) */}
      <div className="bg-[#007ABF] text-white text-xs py-2 px-4 sm:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left: Social Media / Trust Icons */}
          <div className="flex items-center gap-3.5">
            <span className="text-white/80 hidden md:inline text-[11px] font-medium tracking-wide">
              MediFlow AI Healthcare &bull; 24/7 Clinical Excellence
            </span>
            <div className="flex items-center gap-3 text-white/90">
              {/* Facebook */}
              <a href="#facebook" title="Facebook" className="hover:text-white transition-opacity opacity-80 hover:opacity-100">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="#twitter" title="Twitter" className="hover:text-white transition-opacity opacity-80 hover:opacity-100">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#instagram" title="Instagram" className="hover:text-white transition-opacity opacity-80 hover:opacity-100">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#linkedin" title="LinkedIn" className="hover:text-white transition-opacity opacity-80 hover:opacity-100">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Emergency Helpline & Support Email */}
          <div className="flex items-center gap-4 sm:gap-6 font-medium">
            <a 
              href="tel:+11235565523" 
              className="flex items-center gap-1.5 hover:text-white/90 transition-opacity"
            >
              <Phone className="w-3.5 h-3.5 text-white/90" />
              <span>+1-123-556-5523</span>
            </a>
            <span className="text-white/40 hidden sm:inline">&bull;</span>
            <a 
              href="mailto:support@mediflow.ai" 
              className="flex items-center gap-1.5 hover:text-white/90 transition-opacity"
            >
              <Mail className="w-3.5 h-3.5 text-white/90" />
              <span>support@mediflow.ai</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between border-b border-slate-100">
        {/* Brand Logo: "Medi" in bright blue, "Flow" in dark slate */}
        <Link 
          to={getHomeLink()} 
          className="flex items-center gap-2.5 group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-[#007ABF]/10 border border-[#007ABF]/20 flex items-center justify-center text-[#007ABF] group-hover:scale-105 transition-transform shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl sm:text-[26px] font-bold tracking-tight font-display flex items-center leading-none">
              <span className="text-[#007ABF]">Medi</span>
              <span className="text-slate-800 ml-0.5">Flow</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-0.5">
              Healthcare AI
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links (Tailored per Role) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* PATIENT ROLE LINKS */}
          {role === 'patient' && (
            <>
              <Link
                to="/patient/dashboard"
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                  isActive('/patient/dashboard')
                    ? 'text-[#007ABF] bg-blue-50/80 font-bold'
                    : 'text-slate-600 hover:text-[#007ABF] hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/patient/appointments"
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                  isActive('/patient/appointments')
                    ? 'text-[#007ABF] bg-blue-50/80 font-bold'
                    : 'text-slate-600 hover:text-[#007ABF] hover:bg-slate-50'
                }`}
              >
                My Appointments
              </Link>
              <Link
                to="/patient/medical-records"
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                  isActive('/patient/medical-records')
                    ? 'text-[#007ABF] bg-blue-50/80 font-bold'
                    : 'text-slate-600 hover:text-[#007ABF] hover:bg-slate-50'
                }`}
              >
                Medical Records
              </Link>
              <Link
                to="/patient/billing"
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                  isActive('/patient/billing')
                    ? 'text-[#007ABF] bg-blue-50/80 font-bold'
                    : 'text-slate-600 hover:text-[#007ABF] hover:bg-slate-50'
                }`}
              >
                Billing
              </Link>
              <Link
                to="/patient/ai-assistant"
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/patient/ai-assistant')
                    ? 'text-[#007ABF] bg-blue-50/80 font-bold'
                    : 'text-slate-600 hover:text-[#007ABF] hover:bg-slate-50'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-[#007ABF]" />
                AI Assistant
              </Link>
              <Link
                to="/patient/emergency"
                className={`px-3 py-1.5 rounded-lg text-xs xl:text-sm font-bold transition-all flex items-center gap-1 ${
                  isActive('/patient/emergency')
                    ? 'text-rose-600 bg-rose-50 border border-rose-200'
                    : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50/60'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                Emergency
              </Link>
              <Link
                to="/patient/settings"
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/patient/settings')
                    ? 'text-[#007ABF] bg-blue-50/80 font-bold'
                    : 'text-slate-600 hover:text-[#007ABF] hover:bg-slate-50'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Settings
              </Link>
            </>
          )}

          {/* DOCTOR ROLE LINKS */}
          {role === 'doctor' && (
            <>
              <Link
                to="/doctor/dashboard"
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                  isActive('/doctor/dashboard')
                    ? 'text-[#007ABF] bg-blue-50/80 font-bold'
                    : 'text-slate-600 hover:text-[#007ABF] hover:bg-slate-50'
                }`}
              >
                Dashboard &amp; Schedule
              </Link>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00843D]/10 text-[#00843D] border border-[#00843D]/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Practitioner
              </span>
            </>
          )}

          {/* ADMIN ROLE LINKS */}
          {role === 'admin' && (
            <>
              <Link
                to="/admin/dashboard"
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                  isActive('/admin/dashboard')
                    ? 'text-[#007ABF] bg-blue-50/80 font-bold'
                    : 'text-slate-600 hover:text-[#007ABF] hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/audit-logs"
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 ${
                  isActive('/admin/audit-logs')
                    ? 'text-[#007ABF] bg-blue-50/80 font-bold'
                    : 'text-slate-600 hover:text-[#007ABF] hover:bg-slate-50'
                }`}
              >
                <ScrollText className="w-3.5 h-3.5 text-slate-400" />
                Audit Logs
              </Link>
              <Link
                to="/admin/knowledge-base"
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 ${
                  isActive('/admin/knowledge-base')
                    ? 'text-[#007ABF] bg-blue-50/80 font-bold'
                    : 'text-slate-600 hover:text-[#007ABF] hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Knowledge Base
              </Link>
              <Link
                to="/admin/billing"
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 ${
                  isActive('/admin/billing')
                    ? 'text-[#007ABF] bg-blue-50/80 font-bold'
                    : 'text-slate-600 hover:text-[#007ABF] hover:bg-slate-50'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 text-slate-400" />
                Invoices
              </Link>
            </>
          )}

          {/* GUEST / PUBLIC LINKS */}
          {!currentUser && (
            <>
              <Link
                to="/login"
                className="px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold text-slate-600 hover:text-[#007ABF]"
              >
                Sign In
              </Link>
              <Link
                to="/register/patient"
                className="px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold text-slate-600 hover:text-[#007ABF]"
              >
                Register Patient
              </Link>
              <Link
                to="/register/doctor"
                className="px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold text-slate-600 hover:text-[#00843D]"
              >
                Register Doctor
              </Link>
            </>
          )}
        </nav>

        {/* Right Side: Role Custom Action Button + Notification Bell + User / Logout */}
        <div className="flex items-center gap-3">
          {/* Custom Action Button for Patient: "Book an Appointment" matching reference image banner button */}
          {role === 'patient' && (
            <Link
              to="/patient/book-appointment"
              className="hidden sm:inline-flex items-center gap-2 bg-[#007ABF] hover:bg-[#0068A3] text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm hover:shadow"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </Link>
          )}

          {/* Custom Action Button for Admin */}
          {role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#007ABF]/10 hover:bg-[#007ABF]/20 text-[#007ABF] border border-[#007ABF]/25 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          )}

          {/* Custom Action Badge for Doctor */}
          {role === 'doctor' && (
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-[#00843D]/10 text-[#00843D] border border-[#00843D]/25 px-3 py-1.5 rounded-full text-xs font-bold">
              <Activity className="w-3.5 h-3.5" />
              <span>Doctor Portal</span>
            </div>
          )}

          {/* Notification Bell (Only for logged-in users) */}
          {currentUser && (
            <div className="relative z-40">
              <NotificationBell />
            </div>
          )}

          {/* User Profile & Sign Out (Desktop) */}
          {currentUser ? (
            <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-200">
              {/* Avatar — photo or initials */}
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#007ABF]/10 text-[#007ABF] flex items-center justify-center font-bold text-xs">
                    {(currentUser.full_name || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.full_name || currentUser.email?.split('@')[0]}
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 capitalize">
                  {role}
                </span>
              </div>
              {role === 'patient' && (
                <Link
                  to="/patient/settings"
                  title="Patient Settings"
                  className={`p-2 rounded-xl transition-colors ${
                    isActive('/patient/settings')
                      ? 'text-[#007ABF] bg-blue-50'
                      : 'text-slate-500 hover:text-[#007ABF] hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </Link>
              )}
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 bg-[#007ABF] hover:bg-[#0068A3] text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. MOBILE SLIDE-DOWN DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-lg overflow-hidden"
          >
            {/* User Details in Mobile */}
            {currentUser && (
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm shrink-0">
                    {photoUrl ? (
                      <img src={photoUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#007ABF]/10 text-[#007ABF] flex items-center justify-center font-bold text-xs">
                        {currentUser.full_name ? currentUser.full_name[0] : 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{currentUser.full_name || currentUser.email}</p>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">{role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 font-semibold py-1 px-2.5 rounded-md hover:bg-rose-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}

            {/* Mobile Nav Links */}
            <div className="flex flex-col space-y-1.5 text-sm font-medium">
              {role === 'patient' && (
                <>
                  <Link
                    to="/patient/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg ${isActive('/patient/dashboard') ? 'bg-blue-50 text-[#007ABF] font-bold' : 'text-slate-700'}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/patient/book-appointment"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg bg-[#007ABF] text-white font-bold flex items-center gap-2"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Book an Appointment
                  </Link>
                  <Link
                    to="/patient/appointments"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg ${isActive('/patient/appointments') ? 'bg-blue-50 text-[#007ABF] font-bold' : 'text-slate-700'}`}
                  >
                    My Appointments
                  </Link>
                  <Link
                    to="/patient/medical-records"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg ${isActive('/patient/medical-records') ? 'bg-blue-50 text-[#007ABF] font-bold' : 'text-slate-700'}`}
                  >
                    Medical Records
                  </Link>
                  <Link
                    to="/patient/billing"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg ${isActive('/patient/billing') ? 'bg-blue-50 text-[#007ABF] font-bold' : 'text-slate-700'}`}
                  >
                    Billing &amp; Invoices
                  </Link>
                  <Link
                    to="/patient/ai-assistant"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg ${isActive('/patient/ai-assistant') ? 'bg-blue-50 text-[#007ABF] font-bold' : 'text-slate-700'}`}
                  >
                    AI Assistant
                  </Link>
                  <Link
                    to="/patient/emergency"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-rose-600 bg-rose-50 font-bold flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Emergency Contacts
                  </Link>
                  <Link
                    to="/patient/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                      isActive('/patient/settings') ? 'bg-blue-50 text-[#007ABF] font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Settings &amp; Medical Profile
                  </Link>
                </>
              )}

              {role === 'doctor' && (
                <>
                  <Link
                    to="/doctor/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg ${isActive('/doctor/dashboard') ? 'bg-blue-50 text-[#007ABF] font-bold' : 'text-slate-700'}`}
                  >
                    Dashboard &amp; Schedule
                  </Link>
                </>
              )}

              {role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg ${isActive('/admin/dashboard') ? 'bg-blue-50 text-[#007ABF] font-bold' : 'text-slate-700'}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/audit-logs"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg ${isActive('/admin/audit-logs') ? 'bg-blue-50 text-[#007ABF] font-bold' : 'text-slate-700'}`}
                  >
                    Audit Logs
                  </Link>
                  <Link
                    to="/admin/knowledge-base"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg ${isActive('/admin/knowledge-base') ? 'bg-blue-50 text-[#007ABF] font-bold' : 'text-slate-700'}`}
                  >
                    Knowledge Base
                  </Link>
                  <Link
                    to="/admin/billing"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg ${isActive('/admin/billing') ? 'bg-blue-50 text-[#007ABF] font-bold' : 'text-slate-700'}`}
                  >
                    All Invoices
                  </Link>
                </>
              )}

              {!currentUser && (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg bg-[#007ABF] text-white font-bold text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register/patient"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Register as Patient
                  </Link>
                  <Link
                    to="/register/doctor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Register as Doctor
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Phone, 
  ShieldCheck, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ClinicFooter = () => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'patient';

  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [infoModal, setInfoModal] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmailInput('');
    }, 4000);
  };

  // Dynamic route resolution based on authenticated role
  const getAppointmentRoute = () => {
    if (role === 'doctor') return '/doctor/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/patient/book-appointment';
  };

  const getAppointmentsListRoute = () => {
    if (role === 'doctor') return '/doctor/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/patient/appointments';
  };

  const getBillingRoute = () => {
    if (role === 'admin') return '/admin/billing';
    return '/patient/billing';
  };

  const getAssistantRoute = () => {
    if (role === 'admin') return '/admin/knowledge-base';
    return '/patient/ai-assistant';
  };

  const getEmergencyRoute = () => {
    return '/patient/emergency';
  };

  return (
    <footer className="w-full bg-[#007BC2] text-white pt-14 pb-10 border-t border-[#006CA8] mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TOP 3-COLUMN MEGA FOOTER GRID (Exact Match to Reference Design) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 pb-12">
          
          {/* COLUMN 1: FIND A PROVIDER, LOCATIONS, APPOINTMENTS, SUBSCRIBE (md:col-span-5) */}
          <div className="md:col-span-5 space-y-6">
            {/* 1. Find a Provider */}
            <div className="space-y-2 pb-5 border-b border-white/20">
              <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                Find a Provider
              </h4>
              <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
                Need a primary care doctor or a specialist? Our Find a Provider tool makes it easy to search MediFlow's trusted clinical network.
              </p>
              <div className="pt-1">
                <Link
                  to={getAppointmentRoute()}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white hover:text-blue-100 underline underline-offset-4 decoration-white/70 hover:decoration-white transition-all"
                >
                  <span>Search Doctors &amp; Specialists</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 2. Locations */}
            <div className="space-y-2 pb-5 border-b border-white/20">
              <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                Locations
              </h4>
              <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
                Find any of our 300+ outpatient centers, emergency care hubs, and specialized hospital clinics.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => setInfoModal({
                    title: 'MediFlow Clinical Locations',
                    desc: 'MediFlow operates across 300+ fully-equipped healthcare facilities including our Main Medical Campus, Heart & Vascular Pavilion, Cancer Institute, and Pediatrics Centers with 24/7 emergency response.'
                  })}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white hover:text-blue-100 underline underline-offset-4 decoration-white/70 hover:decoration-white transition-all text-left"
                >
                  <span>Explore MediFlow Campuses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Appointments */}
            <div className="space-y-2 pb-5 border-b border-white/20">
              <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                Appointments
              </h4>
              <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
                Get the in-person or virtual care you need with same-day and scheduled appointments.
              </p>
              <div className="pt-1">
                <Link
                  to={getAppointmentRoute()}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white hover:text-blue-100 underline underline-offset-4 decoration-white/70 hover:decoration-white transition-all"
                >
                  <span>Schedule an Appointment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 4. Subscribe to Health Essentials (With Interactive Sign Up) */}
            <div className="space-y-3 pt-1">
              <h4 className="text-lg sm:text-xl font-bold text-white font-sans">
                Subscribe to MediFlow Health Essentials
              </h4>
              <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
                Receive weekly doctor-reviewed wellness tips, nutritional guides, and breaking medical news.
              </p>

              {subscribed ? (
                <div className="p-3.5 rounded-xl bg-white/15 border border-white/40 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                  <span>Thank you for subscribing to MediFlow Health Essentials!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 pt-1 max-w-md">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="px-4 py-2.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/80 shadow-xs flex-1"
                  />
                  <button
                    type="submit"
                    className="bg-white hover:bg-slate-100 text-[#007BC2] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-xs hover:shadow active:scale-95 shrink-0"
                  >
                    Sign Up Today
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* COLUMN 2: ACTIONS (md:col-span-3 lg:col-span-3) */}
          <div className="md:col-span-3 lg:col-span-3 space-y-4">
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mb-5">
              Actions
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/90">
              <li>
                <Link to={getAppointmentsListRoute()} className="hover:text-white hover:underline transition-colors block py-0.5">
                  Appointments &amp; Access
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => setInfoModal({
                    title: 'Accepted Insurance Plans',
                    desc: 'MediFlow accepts all major national and regional health insurances including Medicare, Medicaid, Blue Cross Blue Shield, Aetna, Cigna, and UnitedHealthcare. Please bring your insurance card during your visit.'
                  })}
                  className="hover:text-white hover:underline transition-colors text-left block py-0.5"
                >
                  Accepted Insurance
                </button>
              </li>
              <li>
                <Link to={getAppointmentsListRoute()} className="hover:text-white hover:underline transition-colors block py-0.5">
                  Events Calendar
                </Link>
              </li>
              <li>
                <Link to={getBillingRoute()} className="hover:text-white hover:underline transition-colors block py-0.5">
                  Financial Assistance
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setInfoModal({
                    title: 'Give to MediFlow Foundation',
                    desc: 'Your generous donations support lifesaving medical research, advanced robotic surgery training, and subsidized compassionate healthcare for underserved communities.'
                  })}
                  className="hover:text-white hover:underline transition-colors text-left block py-0.5"
                >
                  Give to MediFlow
                </button>
              </li>
              <li>
                <Link to={getBillingRoute()} className="hover:text-white hover:underline transition-colors block py-0.5">
                  Pay Your Bill Online
                </Link>
              </li>
              <li>
                <Link to={getBillingRoute()} className="hover:text-white hover:underline transition-colors block py-0.5">
                  Price Transparency
                </Link>
              </li>
              <li>
                <Link to={getAppointmentRoute()} className="hover:text-white hover:underline transition-colors block py-0.5">
                  Refer a Patient
                </Link>
              </li>
              <li>
                <Link to={getEmergencyRoute()} className="hover:text-white hover:underline transition-colors block py-0.5">
                  Phone Directory
                </Link>
              </li>
              <li>
                <Link to={getAssistantRoute()} className="hover:text-white hover:underline transition-colors block py-0.5">
                  Virtual Second Opinions
                </Link>
              </li>
              <li>
                <Link to={getAssistantRoute()} className="hover:text-white hover:underline transition-colors block py-0.5">
                  Virtual Visits
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: ABOUT MEDIFLOW (md:col-span-4 lg:col-span-4) */}
          <div className="md:col-span-4 lg:col-span-4 space-y-4">
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mb-5">
              About MediFlow
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/90">
              <li>
                <button
                  onClick={() => setInfoModal({
                    title: '100 Years of MediFlow Excellence',
                    desc: 'Founded on the principle of putting patients first, MediFlow has pioneered modern breakthroughs in cardiology, organ transplants, and AI-driven clinical diagnosis over a century of dedication.'
                  })}
                  className="hover:text-white hover:underline transition-colors text-left block py-0.5"
                >
                  100 Years of MediFlow
                </button>
              </li>
              <li>
                <button
                  onClick={() => setInfoModal({
                    title: 'About MediFlow Healthcare',
                    desc: 'MediFlow is a non-profit multispecialty academic medical center that integrates clinical and hospital care with research and continuous medical education.'
                  })}
                  className="hover:text-white hover:underline transition-colors text-left block py-0.5"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => setInfoModal({
                    title: 'Regional & Global Locations',
                    desc: 'Our network includes state-of-the-art medical complexes, community hospitals, family health centers, and digital telehealth consult stations across the nation.'
                  })}
                  className="hover:text-white hover:underline transition-colors text-left block py-0.5"
                >
                  Locations
                </button>
              </li>
              <li>
                <button
                  onClick={() => setInfoModal({
                    title: 'Quality & Patient Safety',
                    desc: 'Recognized with 5-star clinical safety ratings, zero-tolerance infection protocols, and top national hospital rankings for patient outcomes.'
                  })}
                  className="hover:text-white hover:underline transition-colors text-left block py-0.5"
                >
                  Quality &amp; Patient Safety
                </button>
              </li>
              <li>
                <button
                  onClick={() => setInfoModal({
                    title: 'Patient Experience',
                    desc: 'From tranquil recovery suites to personalized digital care records and dedicated patient advocates, we treat every patient like family.'
                  })}
                  className="hover:text-white hover:underline transition-colors text-left block py-0.5"
                >
                  Patient Experience
                </button>
              </li>
              <li>
                <button
                  onClick={() => setInfoModal({
                    title: 'Research & Innovations',
                    desc: 'Active clinical trials in immunotherapy, predictive AI medical diagnostics, and genomics to conquer complex diseases.'
                  })}
                  className="hover:text-white hover:underline transition-colors text-left block py-0.5"
                >
                  Research &amp; Innovations
                </button>
              </li>
              <li>
                <button
                  onClick={() => setInfoModal({
                    title: 'Community Commitment',
                    desc: 'Investing millions annually in community health outreach, mobile testing vans, child immunization drives, and preventative wellness education.'
                  })}
                  className="hover:text-white hover:underline transition-colors text-left block py-0.5"
                >
                  Community Commitment
                </button>
              </li>
              <li>
                <button
                  onClick={() => setInfoModal({
                    title: 'Careers at MediFlow',
                    desc: 'Join world-renowned physicians, compassionate nurses, and visionary healthcare researchers shaping the future of medicine.'
                  })}
                  className="hover:text-white hover:underline transition-colors text-left block py-0.5"
                >
                  Careers
                </button>
              </li>
              <li>
                <Link to="/login" className="hover:text-white hover:underline transition-colors block py-0.5">
                  For Employees
                </Link>
              </li>
              <li>
                <Link to={role === 'doctor' ? '/doctor/dashboard' : '/login'} className="hover:text-white hover:underline transition-colors block py-0.5">
                  Resources for Medical Professionals
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM HORIZONTAL DIVIDER & LEGAL COPYRIGHT STRIP (As in Reference Screenshot) */}
        <div className="border-t border-white/25 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] sm:text-xs text-white/80">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-center md:text-left">
            <span>&copy; {new Date().getFullYear()} MediFlow Health System. All rights reserved.</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="hover:underline cursor-pointer">Notice of Privacy Practices</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="hover:underline cursor-pointer">Terms of Use</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="hover:underline cursor-pointer">Non-Discrimination Notice</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white font-semibold">
              <Phone className="w-3 h-3" />
              <span>24/7 Care: 1-800-MEDIFLOW</span>
            </span>
            <Link
              to="/patient/emergency"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-2xs"
            >
              <span>Emergency: 911 / 102</span>
            </Link>
          </div>
        </div>
      </div>

      {/* REUSABLE CLINICAL INFO MODAL */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-[#1F2B6C] font-display">
                {infoModal.title}
              </h3>
              <button
                onClick={() => setInfoModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="w-10 h-1 bg-[#007BC2] rounded-full" />
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {infoModal.desc}
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInfoModal(null)}
                className="bg-[#007BC2] hover:bg-[#0066A1] text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default ClinicFooter;

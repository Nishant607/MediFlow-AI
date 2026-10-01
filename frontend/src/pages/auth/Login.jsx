import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  AlertCircle,
  Stethoscope, 
  Droplet, 
  HeartPulse, 
  Syringe, 
  BriefcaseMedical, 
  FlaskConical, 
  Accessibility, 
  ClipboardList, 
  Pill, 
  Microscope, 
  Ambulance, 
  Bed
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'patient') navigate('/patient/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 12 orbiting icons for the circular constellation on the right panel
  const circleIcons = [
    { icon: Droplet, label: 'Blood/Fluid', angle: -90, color: '#0098A6' },
    { icon: HeartPulse, label: 'Vitals', angle: -60, color: '#0284C7' },
    { icon: Syringe, label: 'Vaccination', angle: -30, color: '#0098A6' },
    { icon: BriefcaseMedical, label: 'First Aid', angle: 0, color: '#0098A6', isBadge: true },
    { icon: FlaskConical, label: 'Laboratory', angle: 30, color: '#0284C7' },
    { icon: Accessibility, label: 'Care', angle: 60, color: '#0098A6' },
    { icon: ClipboardList, label: 'Records', angle: 90, color: '#0284C7' },
    { icon: Pill, label: 'Pharmacy', angle: 120, color: '#0098A6' },
    { icon: Microscope, label: 'Diagnostics', angle: 150, color: '#0284C7' },
    { icon: Ambulance, label: 'Emergency', angle: 180, color: '#0098A6', isBadge: true },
    { icon: Bed, label: 'Inpatient', angle: 210, color: '#0284C7' },
    { icon: Stethoscope, label: 'Consultation', angle: 240, color: '#0098A6' },
  ];

  const radius = 130; // Radius for circular orbit in px

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Background Split: Left half solid teal, Right half clean light gray */}
      <div className="fixed inset-0 -z-10 flex">
        <div className="w-1/2 h-full bg-[#0098A6]" />
        <div className="w-1/2 h-full bg-[#F4F7F9]" />
      </div>

      {/* Top Split Branding Typography */}
      <header className="w-full pt-8 pb-4 px-4 sm:px-8">
        <div className="w-full max-w-6xl mx-auto flex items-end">
          {/* Left half: "MEDI" in crisp white text */}
          <div className="w-1/2 text-right pr-1">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white select-none">
              MEDI
            </h1>
          </div>

          {/* Right half: "FLOW" in teal text with "LOGIN" below */}
          <div className="w-1/2 text-left pl-1 flex flex-col justify-end">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#0098A6] select-none leading-none">
              FLOW
            </h1>
            <span className="text-xs sm:text-sm md:text-base font-bold text-slate-400 tracking-[0.25em] uppercase mt-1 pl-1 select-none">
              LOGIN
            </span>
          </div>
        </div>
      </header>

      {/* Main Container with Centered Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-2">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row relative"
          style={{ minHeight: '520px' }}
        >
          {/* Subtle Skyline/Architectural Watermark across the bottom */}
          <div className="absolute bottom-0 inset-x-0 h-28 pointer-events-none opacity-[0.06] overflow-hidden flex items-end z-0">
            <svg viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
              <path d="M0 120H1200V80H1150V60H1130V80H1080V40H1040V80H1000V90H950V70H920V90H880V50H840V90H800V30H760V90H720V60H690V90H640V45H600V90H560V35H520V90H480V70H450V90H400V25H360V90H320V55H280V90H240V75H200V90H160V40H120V90H80V65H50V90H0V120Z" fill="#0098A6" />
              <line x1="0" y1="118" x2="1200" y2="118" stroke="#0098A6" strokeWidth="2" />
            </svg>
          </div>

          {/* LEFT PANEL: Login Form (Pure White) */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative z-10 bg-white">
            {/* Header Brand */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#007380] uppercase">
                MEDIFLOW
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide mt-0.5">
                Management Service
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg mb-5 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Mobile Field with Floating Border-Notched Label */}
              <fieldset className="border border-slate-300 rounded-md px-3 pt-1 pb-1.5 focus-within:border-[#0098A6] focus-within:ring-1 focus-within:ring-[#0098A6]/20 transition-all bg-white">
                <legend className="text-[11px] font-medium text-slate-500 px-1.5 select-none">
                  Email Address
                </legend>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-1"
                />
              </fieldset>

              {/* Password Field with Eye Toggle */}
              <fieldset className="border border-slate-300 rounded-md px-3 pt-1 pb-1.5 focus-within:border-[#0098A6] focus-within:ring-1 focus-within:ring-[#0098A6]/20 transition-all bg-white">
                <legend className="text-[11px] font-medium text-slate-500 px-1.5 select-none">
                  Password
                </legend>
                <div className="flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none ml-2"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </fieldset>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 pb-1 text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#0098A6] focus:ring-[#0098A6] accent-[#0098A6]"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert('Please contact the hospital IT desk or administrator to reset your password.')}
                  className="text-slate-500 hover:text-[#0098A6] font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0098A6] hover:bg-[#008491] text-white font-medium py-2.5 px-4 rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </motion.button>
            </form>

            {/* Create Account Options */}
            <div className="mt-6 text-center text-xs text-slate-600 space-y-2">
              <span className="font-semibold text-slate-700 block">Create Account</span>
              <div className="flex items-center justify-center gap-3 text-xs">
                <Link
                  to="/register/patient"
                  className="text-[#0098A6] hover:underline font-semibold transition-colors"
                >
                  As Patient
                </Link>
                <span className="text-slate-300">•</span>
                <Link
                  to="/register/doctor"
                  className="text-[#00843D] hover:underline font-semibold transition-colors"
                >
                  As Doctor
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Healthcare Brand with Circular Icon Constellation */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 bg-[#EAF6F8] flex flex-col items-center justify-center relative overflow-hidden z-10 border-t md:border-t-0 md:border-l border-slate-100/60">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Circular Dotted Orbit Guide Line */}
              <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-dashed border-[#0098A6]/25 pointer-events-none" />

              {/* Center Brand Text */}
              <div className="text-center z-10 select-none px-4">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#007380] uppercase">
                  MEDIFLOW
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide mt-0.5">
                  Management Service
                </p>
              </div>

              {/* Orbiting Icons */}
              {circleIcons.map((item, idx) => {
                const angleRad = (item.angle * Math.PI) / 180;
                const x = Math.round(radius * Math.cos(angleRad));
                const y = Math.round(radius * Math.sin(angleRad));
                const IconComponent = item.icon;

                return (
                  <div
                    key={idx}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    className="absolute z-10 transition-transform hover:scale-110"
                    title={item.label}
                  >
                    {item.isBadge ? (
                      <div className="w-8 h-8 rounded-lg bg-[#0098A6] text-white flex items-center justify-center shadow-md border border-white">
                        <IconComponent className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/90 border border-[#0098A6]/20 text-[#0098A6] flex items-center justify-center shadow-sm">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Clean Bottom Spacing */}
      <footer className="py-4 text-center text-[11px] text-slate-400 select-none">
        &copy; {new Date().getFullYear()} MediFlow AI. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;

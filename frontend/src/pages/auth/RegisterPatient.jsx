import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Lock, UserPlus, AlertCircle, HeartPulse } from 'lucide-react';
import { registerPatient } from '../../api/authApi';

const RegisterPatient = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'other',
    password: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await registerPatient(formData);
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
    } catch (err) {
      console.error('Patient registration error:', err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.email) setError(`Email: ${data.email.join(', ')}`);
        else if (data.detail) setError(data.detail);
        else setError('Registration failed. Please check your inputs.');
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg my-8"
      >
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/90 shadow-clinic-md">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005A9C] mb-3.5 shadow-sm">
              <HeartPulse className="w-7 h-7 text-[#005A9C]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#005A9C] tracking-tight">
              Patient Registration
            </h2>
            <div className="w-10 h-1 bg-[#005A9C] rounded-full my-2.5" />
            <p className="text-xs sm:text-sm text-slate-500">
              Create your patient portal account to manage care
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-xl mb-6 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
                  placeholder="+1 555-0199"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full mt-3 bg-[#005A9C] hover:bg-[#00477D] text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering...
                </span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register Account
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-8 pt-6 border-t border-slate-200 text-center text-xs sm:text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-[#005A9C] hover:underline font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPatient;

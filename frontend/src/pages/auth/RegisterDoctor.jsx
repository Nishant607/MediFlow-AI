import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, User, Mail, Lock, Briefcase, Award, Building2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { registerDoctor, getDepartments } from '../../api/authApi';

const RegisterDoctor = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience_years: 0,
    qualification: '',
    department: '',
    available_time: 'Mon-Sat, 9AM-5PM'
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, department: data[0].id }));
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };
    fetchDepts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const res = await registerDoctor(formData);
      setSuccessMessage(res.message || 'Registration successful. Your account is pending admin approval.');
    } catch (err) {
      console.error('Doctor registration error:', err);
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
        className="w-full max-w-xl my-8"
      >
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/90 shadow-clinic-md">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00843D] mb-3.5 shadow-sm">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#005A9C] tracking-tight">
              Doctor Registration
            </h2>
            <div className="w-10 h-1 bg-[#00843D] rounded-full my-2.5" />
            <p className="text-xs sm:text-sm text-slate-500">
              Join our specialist medical and clinical network
            </p>
          </div>

          {successMessage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-amber-600" />
              </div>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm leading-relaxed">
                {successMessage}
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full bg-[#005A9C] hover:bg-[#00477D] text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow"
              >
                Return to Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-xl mb-4 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name (with Dr. title)
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
                    placeholder="Dr. John Smith"
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
                    placeholder="john.smith@hospital.org"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Specialization
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="specialization"
                      required
                      value={formData.specialization}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
                      placeholder="Cardiologist"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    min="0"
                    required
                    value={formData.experience_years}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Qualification
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="qualification"
                    required
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
                    placeholder="MD, FACC"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Available Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="available_time"
                    value={formData.available_time}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
                    placeholder="Mon-Sat, 9AM-5PM"
                  />
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
                    Submitting Application...
                  </span>
                ) : (
                  'Apply for Doctor Registration'
                )}
              </motion.button>

              <p className="pt-4 text-center text-xs sm:text-sm text-slate-500">
                Already registered?{' '}
                <Link to="/login" className="text-[#005A9C] hover:underline font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterDoctor;

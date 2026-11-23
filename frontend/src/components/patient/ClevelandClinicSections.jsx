import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Heart,
  Activity,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  Clock,
  CheckCircle2,
  Users,
  Compass,
  FileCheck,
  BookOpen,
  Zap,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

const sectionMotionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const ClevelandClinicSections = () => {
  return (
    <div className="space-y-16 sm:space-y-20 pt-8 pb-14 border-t border-slate-200/80">
      {/* 1. WHY CHOOSE MEDIFLOW INTRO */}
      <motion.section 
        variants={sectionMotionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#E0F4F9] text-[#0B7EA0] border border-[#0EA5C9]/20 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#0EA5C9]" />
          <span>Patient-First Philosophy</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-slate-800 leading-snug max-w-5xl tracking-tight">
          We put patients first. That’s been our promise — combining world-class clinical expertise with compassionate care and medical innovation.
        </h2>
        <div className="w-14 h-1.5 bg-[#0EA5C9] rounded-full mt-3" />
      </motion.section>

      {/* 2. SECTION: WE CARE ABOUT YOU (3D Healthcare Pathway Experience) */}
      <motion.section 
        variants={sectionMotionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
      >
        {/* Text Left */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 leading-[1.2] tracking-tight">
            We don’t just care for your health. <br className="hidden sm:inline" />
            <span className="text-[#0EA5C9]">We care about you.</span>
          </h3>
          <div className="w-14 h-1.5 bg-[#0EA5C9] rounded-full my-3" />
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed pt-1">
            That means taking the time to listen, understand your medical history and help you make confident decisions about your personalized care pathway.
          </p>
          <div className="pt-2">
            <Link
              to="/patient/book-appointment"
              className="inline-flex items-center gap-2 text-[#0B7EA0] hover:text-[#0EA5C9] font-bold text-sm sm:text-base group transition-colors"
            >
              <span>Learn about our care approach &amp; specialties</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 3D Interactive Card Right */}
        <div className="lg:col-span-6">
          <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative bg-gradient-to-br from-[#0c2a4a] via-[#103d68] to-[#0a233d] p-6 sm:p-8 rounded-3xl text-white shadow-2xl border border-white/10 overflow-hidden"
          >
            {/* Ambient glowing radial orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0EA5C9]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0EA5C9]/20 border border-[#0EA5C9]/30 flex items-center justify-center text-[#0EA5C9]">
                    <Heart className="w-5 h-5 text-[#0EA5C9] animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">Care Pathway Active</h4>
                    <p className="text-xs text-white/60">MediFlow Integrated Clinical Protocol</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  99.4% Approval
                </span>
              </div>

              {/* 3 Steps Pathway */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-7 h-7 rounded-lg bg-[#0EA5C9]/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    1
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">Comprehensive Specialist Evaluation</p>
                    <p className="text-[11px] text-white/60 truncate">In-depth consultation &amp; lab review</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-7 h-7 rounded-lg bg-[#0EA5C9]/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    2
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">AI-Assisted Diagnostic Triage</p>
                    <p className="text-[11px] text-white/60 truncate">Rapid evidence-backed summaries</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-7 h-7 rounded-lg bg-[#0EA5C9]/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    3
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">Continuous Post-Visit Followup</p>
                    <p className="text-[11px] text-white/60 truncate">Automated digital reminders &amp; records</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              </div>

              {/* Live Metric Bar */}
              <div className="pt-2 flex items-center justify-between text-xs text-white/70">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0EA5C9]" />
                  NABH &amp; JCI Clinical Standard
                </span>
                <span className="font-mono text-emerald-400 font-bold">● Vitals Normal</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* 3. SECTION: NOT SURE WHERE TO GO FOR CARE? (3D Interactive Triage Matrix) */}
      <motion.section 
        variants={sectionMotionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
      >
        {/* 3D Triage Matrix Card Left */}
        <div className="lg:col-span-6 order-2 lg:order-1">
          <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-[#0EA5C9]" />
                <h4 className="font-bold text-slate-800 text-sm">Smart Symptom &amp; Care Navigator</h4>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Match
              </span>
            </div>

            <div className="space-y-3">
              {/* Option 1: AI Assistant */}
              <Link
                to="/patient/ai-assistant"
                className="group flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-200/80 hover:border-[#0EA5C9] hover:bg-[#F0FAFB] transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:bg-[#0EA5C9] group-hover:text-white transition-colors shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#0B7EA0]">
                      Virtual AI Consultation
                    </span>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                      Immediate
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    For mild symptoms, FAQs, hospital policies &amp; prescription guidance.
                  </p>
                </div>
              </Link>

              {/* Option 2: Doctor Booking */}
              <Link
                to="/patient/book-appointment"
                className="group flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-200/80 hover:border-[#0EA5C9] hover:bg-[#F0FAFB] transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:bg-[#0EA5C9] group-hover:text-white transition-colors shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#0B7EA0]">
                      Primary &amp; Specialist Care
                    </span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                      Book Slot
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Scheduled consultation with verified Cardiologists, Neurologists, etc.
                  </p>
                </div>
              </Link>

              {/* Option 3: Emergency */}
              <Link
                to="/patient/emergency"
                className="group flex items-start gap-3.5 p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-300 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900">Emergency &amp; Trauma Care</span>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      24/7 Priority
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-800/80 mt-0.5">
                    For chest pain, severe injuries, sudden breathing difficulty or trauma.
                  </p>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Text Right */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
          <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 leading-[1.2] tracking-tight">
            Not Sure Where To Go for Care?
          </h3>
          <div className="w-14 h-1.5 bg-[#0EA5C9] rounded-full my-3" />
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed pt-1">
            We’ll help you choose the right place for your symptoms — from virtual AI triage and verified specialist visits to 24/7 emergency response.
          </p>
          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            <Link
              to="/patient/ai-assistant"
              className="inline-flex items-center justify-center bg-[#0EA5C9] hover:bg-[#0B7EA0] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow"
            >
              Get Started with AI
            </Link>
            <Link
              to="/patient/book-appointment"
              className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-2xs"
            >
              View Specialists
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 4. SECTION: INTEGRATED CLINICAL NETWORK (3D Department Board) */}
      <motion.section 
        variants={sectionMotionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
      >
        {/* Text Left */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 leading-[1.2] tracking-tight">
            We’re stronger together. <br />
            <span className="text-[#0EA5C9]">Integrated clinical expertise.</span>
          </h3>
          <div className="w-14 h-1.5 bg-[#0EA5C9] rounded-full my-3" />
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed pt-1">
            Our physicians, surgeons and diagnostic specialists collaborate as one unified team to ensure fast, accurate diagnoses and seamless continuity of care.
          </p>
          <div className="pt-2">
            <Link
              to="/patient/book-appointment"
              className="inline-flex items-center justify-center bg-[#0EA5C9] hover:bg-[#0B7EA0] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow"
            >
              Find a Doctor or Specialist
            </Link>
          </div>
        </div>

        {/* 3D Department Grid Right */}
        <div className="lg:col-span-6">
          <div className="grid grid-cols-2 gap-3.5">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 hover:border-[#0EA5C9] transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Heart className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Cardiology</h4>
              <p className="text-[11px] text-slate-500">Heart health, ECG, catheterization &amp; prevention</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 hover:border-[#0EA5C9] transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Neurology</h4>
              <p className="text-[11px] text-slate-500">Brain, spine, stroke management &amp; neuro-care</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 hover:border-[#0EA5C9] transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Orthopedics</h4>
              <p className="text-[11px] text-slate-500">Joint replacement, fractures, sports medicine</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 hover:border-[#0EA5C9] transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">General Medicine</h4>
              <p className="text-[11px] text-slate-500">Routine checkups, fever, lifestyle illness</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 5. FLOATING AI CHAT TRIGGER */}
      <Link
        to="/patient/ai-assistant"
        className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl hover:shadow-clinic-lg rounded-full pl-3.5 pr-5 py-2.5 flex items-center gap-3 transition-all duration-200 hover:-translate-y-1 group ring-1 ring-slate-900/5"
        title="Chat with MediFlow AI Assistant"
      >
        <div className="w-9 h-9 rounded-xl bg-[#0EA5C9] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-extrabold text-slate-900 group-hover:text-[#0B7EA0] leading-tight">
            AI Assistant
          </span>
          <span className="text-[10px] font-semibold text-slate-400 leading-tight">
            Ask any question
          </span>
        </div>
        <span className="relative flex h-2 w-2 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </Link>
    </div>
  );
};

export default ClevelandClinicSections;

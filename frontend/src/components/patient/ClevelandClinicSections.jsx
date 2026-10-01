import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const sectionMotionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const ClevelandClinicSections = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pt-8 pb-14 border-t border-slate-200/80">
      {/* 1. WHY CHOOSE MEDIFLOW INTRO */}
      <motion.section 
        variants={sectionMotionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="space-y-3"
      >
        <span className="text-sm sm:text-base font-semibold text-slate-800 tracking-normal block">
          Why choose MediFlow?
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-[34px] font-normal text-slate-700 leading-snug max-w-5xl tracking-tight">
          We put patients first. That’s been our approach for more than 100 years — and we’re recognized around the world for our clinical expertise and healthcare innovation.
        </h2>
        <div className="w-14 h-1.5 bg-[#007ABF] rounded-full mt-4" />
      </motion.section>

      {/* 2. SECTION: WE DON'T JUST CARE FOR YOUR HEALTH. WE CARE ABOUT YOU. */}
      <motion.section 
        variants={sectionMotionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
      >
        {/* Text Left */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-slate-900 leading-[1.2] tracking-tight">
            We don’t just care for your health. We care about you.
          </h3>
          <div className="w-14 h-1.5 bg-[#007ABF] rounded-full my-3" />
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed pt-2">
            That means taking the time to listen, understand your needs and help you make confident decisions about your care.
          </p>
          <div className="pt-3">
            <Link
              to="/patient/book-appointment"
              className="inline-flex items-center gap-2 text-[#005A9C] hover:text-[#00477D] font-bold text-sm sm:text-base group transition-colors"
            >
              <span>Learn about our care approach &amp; specialties</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Image Right */}
        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-clinic bg-white group">
            <img
              src="/clinic_sections/patient_care_team.png"
              alt="MediFlow Care Team with Patient"
              className="w-full h-auto max-h-[440px] object-cover group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />
          </div>
        </div>
      </motion.section>

      {/* 3. SECTION: NOT SURE WHERE TO GO FOR CARE? */}
      <motion.section 
        variants={sectionMotionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
      >
        {/* Image Left */}
        <div className="lg:col-span-6 order-2 lg:order-1">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-clinic bg-white p-2 sm:p-4 group flex items-center justify-center bg-gradient-to-b from-blue-50/20 to-white">
            <img
              src="/clinic_sections/where_to_go_care.png"
              alt="Where to Go for Care"
              className="w-full h-auto max-h-[420px] object-contain group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />
          </div>
        </div>

        {/* Text Right */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
          <h3 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-slate-900 leading-[1.2] tracking-tight">
            Not Sure Where To Go for Care?
          </h3>
          <div className="w-14 h-1.5 bg-[#007ABF] rounded-full my-3" />
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed pt-2">
            We’ll help you choose the right place for your symptoms — from virtual visits and primary care to Express Care or the ER.
          </p>
          <div className="flex flex-wrap items-center gap-3.5 pt-4">
            <Link
              to="/patient/ai-assistant"
              className="inline-flex items-center justify-center bg-[#1D4A7A] hover:bg-[#153860] text-white px-7 py-3 rounded-xl text-sm sm:text-base font-bold transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              Get started
            </Link>
            <a
              href="#services-grid"
              className="inline-flex items-center justify-center bg-[#007ABF] hover:bg-[#0066A1] text-white px-6 py-3 rounded-xl text-sm sm:text-base font-bold transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              Explore all services
            </a>
          </div>
        </div>
      </motion.section>

      {/* 4. SECTION: COLD OR FLU GETTING YOU DOWN */}
      <motion.section 
        variants={sectionMotionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
      >
        {/* Text Left */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-slate-900 leading-[1.2] tracking-tight">
            Cold or Flu Getting You Down
          </h3>
          <div className="w-14 h-1.5 bg-[#007ABF] rounded-full my-3" />
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed pt-2">
            Get expert advice and treatment options for cold, flu and COVID-19 symptoms — so you can feel better, faster.
          </p>
          <div className="pt-4">
            <Link
              to="/patient/book-appointment"
              className="inline-flex items-center justify-center bg-[#007ABF] hover:bg-[#0066A1] text-white px-7 py-3 rounded-xl text-sm sm:text-base font-bold transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              Get cold &amp; flu care
            </Link>
          </div>
        </div>

        {/* Image Right */}
        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-clinic bg-white group">
            <img
              src="/clinic_sections/cold_flu_care.png"
              alt="Cold and Flu Medical Care"
              className="w-full h-auto max-h-[400px] object-cover group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />
          </div>
        </div>
      </motion.section>

      {/* 5. SECTION: WE'RE STRONGER TOGETHER */}
      <motion.section 
        variants={sectionMotionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
      >
        {/* Image Left */}
        <div className="lg:col-span-6 order-2 lg:order-1">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-clinic bg-white group">
            <img
              src="/clinic_sections/stronger_together_doctors.png"
              alt="Physicians and Specialists Working as One Team"
              className="w-full h-auto max-h-[440px] object-cover group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />
          </div>
        </div>

        {/* Text Right */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
          <h3 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-slate-900 leading-[1.2] tracking-tight">
            We’re stronger together.
          </h3>
          <div className="w-14 h-1.5 bg-[#007ABF] rounded-full my-3" />
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed pt-2">
            Our physicians and specialists work as one team to provide coordinated care, with a shared focus on achieving the best possible{' '}
            <Link
              to="/patient/book-appointment"
              className="text-[#007ABF] hover:text-[#005A9C] font-semibold underline underline-offset-2"
            >
              outcomes
            </Link>
            .
          </p>
          <div className="pt-4">
            <Link
              to="/patient/book-appointment"
              className="inline-flex items-center justify-center bg-[#1D4A7A] hover:bg-[#153860] text-white px-7 py-3 rounded-xl text-sm sm:text-base font-bold transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              Find a Doctor or Specialist
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 6. SECTION: HEALTH INFORMATION YOU CAN TRUST */}
      <motion.section 
        variants={sectionMotionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
      >
        {/* Image Left */}
        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-clinic bg-white p-3 sm:p-6 group flex items-center justify-center bg-gradient-to-b from-blue-50/20 to-white">
            <img
              src="/clinic_sections/health_library_heart.png"
              alt="Health Information You Can Trust - MediFlow"
              className="w-full h-auto max-h-[380px] object-contain group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />
          </div>
        </div>

        {/* Text Right */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-slate-900 leading-[1.2] tracking-tight">
            Health information you can trust
          </h3>
          <div className="w-14 h-1.5 bg-[#007ABF] rounded-full my-3" />
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed pt-2">
            Whether you’re looking for answers about a condition or everyday wellness advice, our physicians and medical experts are here to help.
          </p>
          <div className="flex flex-wrap items-center gap-3.5 pt-4">
            <Link
              to="/patient/ai-assistant"
              className="inline-flex items-center justify-center bg-[#007ABF] hover:bg-[#0066A1] text-white px-7 py-3 rounded-xl text-sm sm:text-base font-bold transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              Browse the Health Library
            </Link>
            <Link
              to="/patient/ai-assistant"
              className="inline-flex items-center justify-center border-2 border-[#007ABF] text-[#007ABF] hover:bg-blue-50 bg-white px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              Read Health Essentials
            </Link>
          </div>
        </div>
      </motion.section>

      {/* FLOATING "LET'S CHAT! MEDIFLOW AI" WIDGET */}
      <Link
        to="/patient/ai-assistant"
        className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl hover:shadow-clinic-lg rounded-full pl-3.5 pr-5 py-2.5 flex items-center gap-3 transition-all duration-200 hover:-translate-y-1 group ring-1 ring-slate-900/5"
        title="Chat with MediFlow AI Assistant"
      >
        {/* Geometric Medical Cross Icon */}
        <div className="w-10 h-10 rounded-xl bg-[#1D4A7A] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" />
            <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" />
            <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor" />
            <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor" />
          </svg>
        </div>

        {/* Text Details */}
        <div className="flex flex-col text-left">
          <span className="text-sm font-extrabold text-slate-900 group-hover:text-[#005A9C] leading-tight">
            Let's Chat!
          </span>
          <span className="text-[11px] font-semibold text-slate-500 leading-tight">
            MediFlow AI
          </span>
        </div>

        {/* Live Active Status Indicator Dot */}
        <span className="relative flex h-2.5 w-2.5 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
      </Link>
    </div>
  );
};

export default ClevelandClinicSections;

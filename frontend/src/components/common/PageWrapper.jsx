import React from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import ClinicFooter from './ClinicFooter';

const PageWrapper = ({ children, className = '', showNavbar = true, showFooter = true }) => {
  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col overflow-x-hidden">
      {/* Subtle calm top atmosphere tint */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-[#F0F7FC]/70 via-[#F8FAFC] to-[#F8FAFC]" />

      {/* Global Brand Navbar with Top Info Strip */}
      {showNavbar && <Navbar />}

      {/* Main Page Content */}
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full flex-1 ${className}`}
      >
        {children}
      </motion.main>

      {/* Global Cleveland Clinic Style Mega Footer */}
      {showFooter && <ClinicFooter />}
    </div>
  );
};

export default PageWrapper;

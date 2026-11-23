import React from 'react';
import { motion } from 'framer-motion';
import PatientLayout from '../patient/PatientLayout';

const PageWrapper = ({ children, className = '' }) => {
  return (
    <PatientLayout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full ${className}`}
      >
        {children}
      </motion.div>
    </PatientLayout>
  );
};

export default PageWrapper;

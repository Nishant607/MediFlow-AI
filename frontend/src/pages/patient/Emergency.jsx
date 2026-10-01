import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  PhoneCall, 
  ArrowLeft, 
  ShieldAlert, 
  Ambulance, 
  Building2, 
  Phone, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { getEmergencyContacts } from '../../api/departmentsApi';
import PageWrapper from '../../components/common/PageWrapper';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const CONTACT_TYPE_LABELS = {
  AMBULANCE: 'Ambulance',
  EMERGENCY_DEPT: 'Emergency Department',
  HELPLINE: 'Helpline',
  OTHER: 'Other',
};

const EmergencyPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await getEmergencyContacts();
        const list = Array.isArray(data) ? data : data.results || [];
        setContacts(list);
      } catch (err) {
        console.error('Failed to load emergency contacts', err);
        setError('Failed to load emergency contacts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const renderIcon = (type) => {
    switch (type) {
      case 'AMBULANCE':
        return <Ambulance className="w-6 h-6 text-rose-600" />;
      case 'EMERGENCY_DEPT':
        return <Building2 className="w-6 h-6 text-rose-600" />;
      case 'HELPLINE':
        return <PhoneCall className="w-6 h-6 text-rose-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-rose-600" />;
    }
  };

  return (
    <PageWrapper className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Link
            to="/patient/dashboard"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#007ABF] text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div>

        {/* Emergency Alert Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-start gap-4 relative z-10">
            <div className="relative p-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex-shrink-0">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold font-display text-rose-950 tracking-tight">MediFlow Emergency Help</h1>
                <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                  24 / 7 Active
                </span>
              </div>
              <p className="text-rose-900/80 text-sm leading-relaxed mt-1.5">
                If you are experiencing a <strong className="text-rose-950 font-bold">life-threatening emergency</strong>, call emergency
                services immediately. The contacts below are active and monitored around the clock.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contacts Section */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </motion.div>
        ) : contacts.length === 0 ? (
          <div className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 p-8">
            <EmptyState 
              icon={PhoneCall}
              title="No emergency contacts available"
              description="Please contact MediFlow administration directly for immediate inquiries."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact, idx) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 hover:border-rose-300 transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                    {renderIcon(contact.contact_type)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                      {contact.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">
                        {CONTACT_TYPE_LABELS[contact.contact_type] || contact.contact_type}
                      </span>
                      {contact.description ? ` — ${contact.description}` : ''}
                    </p>
                  </div>
                </div>
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href={`tel:${contact.phone_number}`}
                  className="flex-shrink-0 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>{contact.phone_number}</span>
                </motion.a>
              </motion.div>
            ))}
          </div>
        )}

        {/* General reminder notice */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 p-5 text-slate-500 text-xs leading-relaxed flex items-start gap-3.5"
        >
          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-slate-700">Emergency Protocol:</strong> In a life-threatening
            emergency, always call your national emergency number first (e.g. <strong className="text-slate-800">112</strong> or{' '}
            <strong className="text-slate-800">911</strong>). The contacts listed above are supplementary MediFlow department helplines.
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default EmergencyPage;

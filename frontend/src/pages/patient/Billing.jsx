import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  ArrowLeft, 
  LogOut, 
  Receipt, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyInvoices, payInvoice } from '../../api/billingApi';
import InvoiceCard from '../../components/patient/InvoiceCard';
import PageWrapper from '../../components/common/PageWrapper';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const PatientBilling = () => {
  const { logout } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getMyInvoices();
      setInvoices(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load invoices', err);
      setError('Failed to load billing invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePayInvoice = async (invoiceId) => {
    setPayingId(invoiceId);
    setError('');
    setMessage('');
    try {
      const res = await payInvoice(invoiceId);
      setMessage(res.message || 'Payment completed successfully.');
      await fetchInvoices();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment failed. Please try again.');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <PageWrapper className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
              <Link
                to="/patient/dashboard"
                className="inline-flex items-center gap-1 hover:text-[#005A9C] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-[#005A9C]">Billing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#005A9C]/10 border border-[#005A9C]/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#005A9C]" />
              </span>
              Billing &amp; Invoices
            </h1>
            <div className="w-8 h-1 rounded-full bg-[#005A9C] mt-2" />
            <p className="text-slate-500 text-sm mt-2">
              View your consultation invoices and make dummy payments
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="self-start sm:self-auto inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            Sign Out
          </motion.button>
        </motion.div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{message}</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Invoices List */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 p-8">
            <EmptyState 
              icon={Receipt}
              title="You have no billing invoices at this time."
              description="Invoices are automatically generated when a doctor completes your appointment consultation."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onPay={handlePayInvoice}
                isPaying={payingId === invoice.id}
              />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default PatientBilling;

import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, CreditCard, Calendar, Stethoscope, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';

const InvoiceCard = ({ invoice, onPay, isPaying }) => {
  const isPaid = invoice.status === 'PAID';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-clinic hover:shadow-clinic-hover space-y-4 transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005A9C] shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider font-mono">
              Invoice #{invoice.id}
            </div>
            <div className="text-sm font-bold text-slate-800 mt-0.5 font-display flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Visit Date: {invoice.appointment_date} at {invoice.appointment_time}
            </div>
          </div>
        </div>

        <div>
          {isPaid ? (
            <Badge variant="success" dot>PAID</Badge>
          ) : (
            <Badge variant="warning" dot>PENDING PAYMENT</Badge>
          )}
        </div>
      </div>

      <div className="text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">Doctor:</span>{' '}
          <span className="font-semibold text-slate-800">
            Dr. {invoice.doctor_detail?.user_full_name}
          </span>{' '}
          <span className="text-slate-500">({invoice.doctor_detail?.specialization})</span>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2 font-display">
          Line Items
        </div>
        {invoice.items && invoice.items.length > 0 ? (
          invoice.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center text-xs text-slate-700 py-0.5"
            >
              <span>{item.description}</span>
              <span className="font-mono font-semibold text-slate-800">₹{item.amount}</span>
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-400 py-1">No items listed.</div>
        )}
        <div className="flex justify-between items-center text-sm font-bold text-slate-900 border-t border-slate-200 pt-3 mt-2">
          <span className="font-display">Total Amount</span>
          <span className="font-mono text-[#00843D] text-lg font-extrabold">
            ₹{invoice.total_amount}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        {isPaid ? (
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00843D]" />
            Paid on <span className="text-slate-800 font-semibold">{formatDate(invoice.paid_at)}</span>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPay(invoice.id)}
            disabled={isPaying}
            className="w-full md:w-auto bg-[#00843D] hover:bg-[#006B31] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            {isPaying ? 'Processing...' : 'Pay Now'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default InvoiceCard;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, CheckCircle2, AlertCircle, Calendar, User, FileText, Pill, Activity, Check } from 'lucide-react';
import { submitConsultation } from '../../api/medicalRecordsApi';
import Badge from '../common/Badge';

const ConsultationForm = ({ appointment, onCompleted }) => {
  const [symptoms, setSymptoms] = useState('');
  const [observations, setObservations] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const patientName = appointment.patient_detail?.user_full_name || 'Patient';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await submitConsultation({
        appointment_id: appointment.id,
        symptoms,
        observations,
        prescription_text: prescriptionText,
      });

      setSuccess('Consultation completed successfully!');
      setTimeout(() => {
        if (onCompleted) {
          onCompleted();
        }
      }, 1200);
    } catch (err) {
      const serverErr =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to complete consultation.';
      setError(serverErr);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-clinic space-y-4">
      <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00843D]">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-display">Clinical Consultation</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Patient: <strong className="text-slate-800">{patientName}</strong> | Date: {appointment.appointment_date} at {appointment.appointment_time}
            </p>
          </div>
        </div>
        <Badge variant="success" dot>Active Session</Badge>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success} Updating schedule...</span>
        </motion.div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-slate-400" />
          Patient Symptoms
        </label>
        <textarea
          rows={2}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe symptoms reported by the patient..."
          className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl p-3 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all placeholder-slate-400 leading-relaxed"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          Doctor Observations & Diagnosis
        </label>
        <textarea
          rows={2}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Clinical findings, vital signs, diagnostic observations..."
          className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl p-3 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all placeholder-slate-400 leading-relaxed"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
          <Pill className="w-3.5 h-3.5 text-[#00843D]" />
          Prescription & Medical Advice
        </label>
        <textarea
          rows={3}
          value={prescriptionText}
          onChange={(e) => setPrescriptionText(e.target.value)}
          placeholder="Medicines, dosage, treatment plan, follow-up instructions..."
          className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl p-3 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all placeholder-slate-400 leading-relaxed"
        />
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => onCompleted && onCompleted()}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border border-slate-200"
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="bg-[#00843D] hover:bg-[#006B31] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow disabled:opacity-50 flex items-center gap-2"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Complete Consultation
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default ConsultationForm;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Sparkles, Bot, X, AlertCircle, FileText, Pill, FileSpreadsheet } from 'lucide-react';
import {
  getPatientReportsForDoctor,
  getPatientHistoryForDoctor,
  downloadReport,
} from '../../api/medicalRecordsApi';
import { getPatientAISummary } from '../../api/aiAssistantApi';
import ReportCard from '../patient/ReportCard';
import PrescriptionCard from '../patient/PrescriptionCard';
import Skeleton from '../common/Skeleton';
import Badge from '../common/Badge';

const PatientHistoryPanel = ({ patientId }) => {
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    if (!patientId) return;

    setAiSummary('');
    setSummaryError('');

    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const [repData, rxData] = await Promise.all([
          getPatientReportsForDoctor(patientId),
          getPatientHistoryForDoctor(patientId),
        ]);

        setReports(Array.isArray(repData) ? repData : repData.results || []);
        setPrescriptions(Array.isArray(rxData) ? rxData : rxData.results || []);
      } catch (err) {
        setError(
          err.response?.data?.detail || 'Failed to load patient records/history.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patientId]);

  const handleDownload = async (report) => {
    const response = await downloadReport(report.id);
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = report.title || 'report';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError('');
    try {
      const data = await getPatientAISummary(patientId);
      setAiSummary(data.summary || 'No summary returned.');
    } catch (err) {
      console.error('Failed to generate patient AI summary', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to generate patient AI summary. Please try again.';
      setSummaryError(msg);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-clinic space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="w-48 h-6" />
          <Skeleton variant="rect" className="w-36 h-8 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <Skeleton variant="card" count={2} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 space-y-6 shadow-clinic">
      <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005A9C]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-display">Patient Medical History</h3>
            <span className="text-xs font-mono text-slate-500">
              Patient ID #{patientId}
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          disabled={summaryLoading}
          onClick={handleGenerateSummary}
          className="bg-[#005A9C] hover:bg-[#00477D] disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-sm hover:shadow"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          {summaryLoading ? 'Generating Summary...' : 'Generate AI Summary'}
        </motion.button>
      </div>

      {/* AI Summary Highlighted Box */}
      {summaryLoading && (
        <div className="bg-blue-50 border border-blue-200 text-[#005A9C] p-4 rounded-xl text-xs flex items-center gap-2.5 animate-pulse">
          <div className="w-4 h-4 border-2 border-[#005A9C] border-t-transparent rounded-full animate-spin" />
          <span>Generating clinical history summary from patient records...</span>
        </div>
      )}

      {summaryError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{summaryError}</span>
        </div>
      )}

      {aiSummary && !summaryLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-50/50 border border-blue-200/80 p-5 rounded-2xl space-y-2.5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#005A9C] uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Bot className="w-4 h-4 text-[#005A9C]" />
              <span>Clinical Summary (AI)</span>
            </h4>
            <button
              type="button"
              onClick={() => setAiSummary('')}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {aiSummary}
          </div>
          <p className="text-[10px] text-slate-500 italic pt-2 border-t border-blue-200/50">
            Generated from past consultations for quick clinical reference. Always verify with full consultation records.
          </p>
        </motion.div>
      )}

      {/* Medical Reports Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#005A9C] font-display flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Uploaded Medical Reports ({reports.length})
        </h4>
        {reports.length === 0 ? (
          <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
            No lab reports uploaded by patient.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Prescriptions Section */}
      <div className="space-y-3 pt-2">
        <h4 className="text-sm font-bold text-[#00843D] font-display flex items-center gap-2">
          <Pill className="w-4 h-4" />
          Past Consultations & Prescriptions ({prescriptions.length})
        </h4>
        {prescriptions.length === 0 ? (
          <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
            No past consultation records for this patient.
          </p>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((rx) => (
              <PrescriptionCard key={rx.id} prescription={rx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientHistoryPanel;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Sparkles, X, AlertCircle, Bot, Calendar } from 'lucide-react';
import { summarizeReport } from '../../api/aiAssistantApi';

const ReportCard = ({ report, onDownload }) => {
  const [downloading, setDownloading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const displayDate = report.report_date || (report.uploaded_at ? report.uploaded_at.split('T')[0] : 'N/A');

  const handleDownload = async () => {
    if (!onDownload) return;
    setDownloading(true);
    try {
      await onDownload(report);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSummarize = async () => {
    if (summary) {
      setExpanded((prev) => !prev);
      return;
    }
    setSummarizing(true);
    setSummaryError('');
    try {
      const data = await summarizeReport(report.id);
      setSummary(data.summary || 'No summary available.');
      setExpanded(true);
    } catch (err) {
      console.error('Failed to summarize report', err);
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to summarize report. Please try again.';
      setSummaryError(msg);
      setExpanded(true);
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-clinic hover:shadow-clinic-hover space-y-3 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005A9C] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 font-display">{report.title}</h4>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date: {displayDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            disabled={summarizing}
            onClick={handleSummarize}
            className="bg-[#005A9C] hover:bg-[#00477D] text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            {summarizing ? 'Summarizing...' : (expanded && summary ? 'Hide Summary' : 'Summarize with AI')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            disabled={downloading}
            onClick={handleDownload}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            {downloading ? 'Downloading...' : 'Download'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden pt-2 border-t border-slate-100 text-xs"
          >
            {summaryError ? (
              <div className="text-rose-700 bg-rose-50 p-3.5 rounded-xl border border-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{summaryError}</span>
              </div>
            ) : (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#005A9C] font-display">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-[#005A9C]" />
                    AI Clinical Explanation
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs">
                  {summary}
                </p>
                <p className="text-[10px] text-slate-500 italic pt-1.5 border-t border-blue-200/50">
                  Note: This AI explanation is for information only. Always consult your doctor regarding medical reports.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReportCard;


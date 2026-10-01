import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileUp, CheckCircle2, AlertCircle, Calendar, FileText } from 'lucide-react';
import { uploadReport } from '../../api/medicalRecordsApi';

const UploadReportForm = ({ onUploaded }) => {
  const [title, setTitle] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a report title.');
      return;
    }
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title.trim());
    if (reportDate) {
      formData.append('report_date', reportDate);
    }
    formData.append('file', file);

    try {
      await uploadReport(formData);
      setSuccess('Report uploaded successfully!');
      setTitle('');
      setReportDate('');
      setFile(null);
      // Reset file input element
      e.target.reset();
      if (onUploaded) {
        onUploaded();
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const serverErr =
        err.response?.data?.file?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to upload report.';
      setError(serverErr);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-clinic space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005A9C] shrink-0">
          <FileUp className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-display">Upload Medical Report</h3>
          <p className="text-xs text-slate-500">Upload lab tests, imaging or prescriptions</p>
        </div>
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
          <span>{success}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Report Title *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blood Test / MRI Brain"
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Report Date (Optional)
          </label>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Select File * (.pdf, .txt, .jpg, .jpeg, .png - Max 10MB)
        </label>
        <input
          type="file"
          required
          accept=".pdf,.txt,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files[0] || null)}
          className="w-full bg-white border border-slate-300 text-slate-600 text-xs rounded-xl p-2.5 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer transition-all"
        />
      </div>

      <div className="flex justify-end pt-1">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={uploading}
          className="bg-[#005A9C] hover:bg-[#00477D] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow disabled:opacity-50 flex items-center gap-2"
        >
          {uploading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Report
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default UploadReportForm;

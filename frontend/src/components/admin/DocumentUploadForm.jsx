import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle2, AlertTriangle, AlertCircle, FileUp } from 'lucide-react';
import { uploadDocument } from '../../api/aiAssistantApi';

const CATEGORY_OPTIONS = [
  { value: 'FAQ', label: 'General FAQ' },
  { value: 'APPOINTMENT_POLICY', label: 'Appointment Policy' },
  { value: 'INSURANCE_POLICY', label: 'Insurance Policy' },
  { value: 'DEPARTMENT_INFO', label: 'Department Information' },
  { value: 'EMERGENCY_GUIDELINES', label: 'Emergency Guidelines' },
  { value: 'OTHER', label: 'Other' },
];

const DocumentUploadForm = ({ onUploaded }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('FAQ');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      setError('Please provide a document title and select a .pdf or .txt file.');
      return;
    }

    setUploading(true);
    setMessage('');
    setWarningMessage('');
    setError('');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('category', category);
    formData.append('file', file);

    try {
      const res = await uploadDocument(formData);
      if (res.message && res.message.includes('no readable text')) {
        setWarningMessage(res.message);
      } else {
        setMessage(res.message || 'Document uploaded and processed successfully.');
      }

      setTitle('');
      setCategory('FAQ');
      setFile(null);
      // Reset file input element
      e.target.reset();

      if (onUploaded) {
        onUploaded();
      }
    } catch (err) {
      console.error('Failed to upload document', err);
      const errDetail = err.response?.data?.file?.[0]
        || err.response?.data?.detail
        || err.response?.data?.message
        || 'Failed to upload document. Please check file format and size (max 5MB).';
      setError(errDetail);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-clinic space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005A9C] shrink-0">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-display">Upload Knowledge Base Document</h2>
          <p className="text-xs text-slate-500">Add policies and FAQs for AI RAG embeddings</p>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </motion.div>
      )}

      {warningMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{warningMessage}</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Document Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. MediFlow Visiting Policy 2026"
            className="w-full bg-white border border-slate-300 text-slate-800 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all placeholder-slate-400"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-800 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            File (.pdf, .txt — Max 5MB)
          </label>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer border border-slate-300 rounded-xl bg-white"
            required
          />
        </div>

        <div className="md:col-span-3 flex justify-end pt-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={uploading}
            className="bg-[#005A9C] hover:bg-[#00477D] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-2"
          >
            {uploading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing & Chunking...
              </span>
            ) : (
              <>
                <FileUp className="w-4 h-4" />
                Upload Document
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploadForm;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Database
} from 'lucide-react';
import { listDocuments, toggleDocumentActive, deleteDocument } from '../../api/aiAssistantApi';
import DocumentUploadForm from '../../components/admin/DocumentUploadForm';
import DocumentRow from '../../components/admin/DocumentRow';
import AdminLayout from '../../components/admin/AdminLayout';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const KnowledgeBase = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await listDocuments();
      const list = Array.isArray(data) ? data : data.results || [];
      setDocuments(list);
    } catch (err) {
      console.error('Failed to load knowledge documents', err);
      setError('Failed to load knowledge base documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleToggle = async (id) => {
    setError('');
    setActionMessage('');
    try {
      await toggleDocumentActive(id);
      setActionMessage('Document status updated successfully.');
      fetchDocuments();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      console.error('Failed to toggle document status', err);
      setError('Failed to update document status.');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setActionMessage('');
    try {
      await deleteDocument(id);
      setActionMessage('Document deleted successfully.');
      fetchDocuments();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete document', err);
      setError('Failed to delete document.');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1 hover:text-[#005A9C] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
              </Link>
              <span>/</span>
              <span className="text-[#005A9C]">Knowledge Base</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#005A9C]/10 border border-[#005A9C]/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#005A9C]" />
              </span>
              Admin Knowledge Base Management
            </h1>
            <div className="w-8 h-1 rounded-full bg-[#005A9C] mt-2" />
            <p className="text-slate-500 text-sm mt-2">
              Upload, activate, deactivate, or delete policy and FAQ documents for AI retrieval.
            </p>
          </div>
          <Link
            to="/admin/dashboard"
            className="self-start sm:self-auto inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div>

        {actionMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{actionMessage}</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Upload Form Component */}
        <DocumentUploadForm onUploaded={fetchDocuments} />

        {/* Documents List Section */}
        <div className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#005A9C]/10 border border-[#005A9C]/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-[#005A9C]" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Uploaded Knowledge Base Documents
                </h2>
                <p className="text-xs text-slate-500">
                  Documents indexed for RAG contextual answers in the Patient AI Assistant
                </p>
              </div>
            </div>
            {documents.length > 0 && (
              <span className="bg-[#005A9C]/10 border border-[#005A9C]/20 text-[#005A9C] text-xs px-3 py-1 rounded-full font-bold font-mono">
                {documents.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          ) : documents.length === 0 ? (
            <EmptyState 
              icon={BookOpen}
              title="No knowledge base documents uploaded yet"
              description="Use the form above to add your first FAQ or policy file for AI retrieval!"
            />
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  document={doc}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default KnowledgeBase;

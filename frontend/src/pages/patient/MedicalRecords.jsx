import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Pill, 
  ArrowLeft, 
  LogOut, 
  UploadCloud, 
  Activity, 
  AlertCircle,
  FileCheck2,
  Stethoscope,
  FileUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getMyReports,
  getMyPrescriptions,
  downloadReport,
} from '../../api/medicalRecordsApi';
import PageWrapper from '../../components/common/PageWrapper';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import UploadReportForm from '../../components/patient/UploadReportForm';
import ReportCard from '../../components/patient/ReportCard';
import PrescriptionCard from '../../components/patient/PrescriptionCard';

const MedicalRecords = () => {
  const { logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [repData, rxData] = await Promise.all([
        getMyReports(),
        getMyPrescriptions(),
      ]);

      setReports(Array.isArray(repData) ? repData : repData.results || []);
      setPrescriptions(Array.isArray(rxData) ? rxData : rxData.results || []);
    } catch (err) {
      setError('Failed to fetch medical records and prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadReport = async (report) => {
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

  return (
    <PageWrapper className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
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
              <span className="text-[#005A9C]">Medical Records</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#005A9C]/10 border border-[#005A9C]/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#005A9C]" />
              </span>
              Medical Records &amp; Prescriptions
            </h1>
            <div className="w-8 h-1 rounded-full bg-[#005A9C] mt-2" />
            <p className="text-slate-500 text-sm mt-2">
              Securely access your diagnostic reports, doctor prescriptions, and AI summaries
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

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Upload Form */}
        <UploadReportForm onUploaded={fetchData} />

        {/* Reports List Section */}
        <div className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#005A9C]/10 border border-[#005A9C]/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#005A9C]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  My Uploaded Medical Reports
                </h2>
                <p className="text-xs text-slate-500">
                  Lab tests, radiology scans, and pathology documents
                </p>
              </div>
            </div>
            <span className="bg-[#005A9C]/10 border border-[#005A9C]/20 text-[#005A9C] text-xs px-3 py-1 rounded-full font-bold font-mono">
              {reports.length}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-44 rounded-2xl" />
            </div>
          ) : reports.length === 0 ? (
            <EmptyState 
              icon={FileUp}
              title="No lab reports uploaded yet"
              description="Upload your test results, scans, or discharge summaries above to get automated AI explanations."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onDownload={handleDownloadReport}
                />
              ))}
            </div>
          )}
        </div>

        {/* Prescriptions & Visit History Section */}
        <div className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00843D]/10 border border-[#00843D]/20 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-[#00843D]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  My Prescriptions &amp; Visit History
                </h2>
                <p className="text-xs text-slate-500">
                  Clinical notes, medical advice, and medication regimens from completed consultations
                </p>
              </div>
            </div>
            <span className="bg-[#00843D]/10 border border-[#00843D]/20 text-[#00843D] text-xs px-3 py-1 rounded-full font-bold font-mono">
              {prescriptions.length}
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-36 rounded-2xl" />
              <Skeleton className="h-36 rounded-2xl" />
            </div>
          ) : prescriptions.length === 0 ? (
            <EmptyState 
              icon={Pill}
              title="No past prescriptions or consultation records"
              description="Digital prescriptions and doctor consultation notes will automatically appear here once your appointments are completed."
            />
          ) : (
            <div className="space-y-4">
              {prescriptions.map((rx) => (
                <PrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default MedicalRecords;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Star,
  HeartHandshake,
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Stethoscope,
  Building,
  MoreVertical,
  Reply,
  ShieldCheck,
  Send,
  X,
  ThumbsUp,
  Download,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminComingSoon from '../../components/admin/AdminComingSoon';
import Badge from '../../components/common/Badge';
import { exportToCSV, printMedicalReport } from '../../utils/reportGenerator';

// Initial realistic clinic patient feedback
const INITIAL_REVIEWS = [
  {
    id: 1,
    patientName: 'Ananya Sharma',
    doctorName: 'Dr. Sarah Jenkins',
    department: 'Cardiology',
    rating: 5,
    date: 'Sep 18, 2026',
    comment:
      'The ECG and consultation were carried out very smoothly. Dr. Jenkins explained the heart test results in simple terms and put my anxiety to rest. Outstanding care!',
    status: 'Resolved',
    adminNote: 'Thank you for your valuable feedback! Clinical team notified.',
  },
  {
    id: 2,
    patientName: 'Rahul Verma',
    doctorName: 'Dr. Marcus Vance',
    department: 'Neurology',
    rating: 5,
    date: 'Sep 17, 2026',
    comment:
      'AI symptom check before the appointment helped the neurologist prepare beforehand. Very punctual and professional hospital environment.',
    status: 'Resolved',
    adminNote: '',
  },
  {
    id: 3,
    patientName: 'Pooja Iyer',
    doctorName: 'General OPD',
    department: 'General Medicine',
    rating: 2,
    date: 'Sep 16, 2026',
    comment:
      'Pharmacy counter had a 25-minute wait time for antibiotic dispensing. Need faster billing queues during morning OPD rush.',
    status: 'Under Review',
    adminNote: 'Pharmacy head notified. Added an extra dispensing terminal.',
  },
  {
    id: 4,
    patientName: 'David Miller',
    doctorName: 'Dr. Emily Chen',
    department: 'Pediatrics',
    rating: 5,
    date: 'Sep 15, 2026',
    comment:
      'Very gentle with my 4-year-old child during vaccination. Pediatric ward was clean and child-friendly with cartoon walls.',
    status: 'Resolved',
    adminNote: '',
  },
  {
    id: 5,
    patientName: 'Sunita Rao',
    doctorName: 'Emergency Triage',
    department: 'Emergency Care',
    rating: 4,
    date: 'Sep 14, 2026',
    comment:
      'Ambulance response was fast (under 12 minutes). Emergency room nurses were attentive and IV drip started immediately.',
    status: 'Resolved',
    adminNote: '',
  },
  {
    id: 6,
    patientName: 'Vikram Patel',
    doctorName: 'Billing Desk',
    department: 'Billing & Invoicing',
    rating: 3,
    date: 'Sep 12, 2026',
    comment:
      'Insurance pre-authorization took a bit longer than expected. Digital invoice was accurate though.',
    status: 'Under Review',
    adminNote: 'Working with TPA desk to expedite approvals.',
  },
];

// Stat card with left accent border
const StatCard = ({ label, value, icon: Icon, borderColor, iconBg, iconColor, subtext }) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ duration: 0.18 }}
    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md p-5 flex items-center gap-4 relative overflow-hidden transition-all"
  >
    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${borderColor}`} />
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-2xl font-extrabold text-slate-900 leading-none mb-0.5">{value}</p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      {subtext && <p className="text-[10px] text-slate-400 mt-1">{subtext}</p>}
    </div>
  </motion.div>
);

const AdminFeedbackPage = () => {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReview, setSelectedReview] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  /* ── Export Handlers ─────────────────────────────────────── */
  const handleExportPDF = () => {
    if (!reviews.length) return;
    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';
    const resolvedCount = reviews.filter((r) => r.status === 'Resolved').length;
    const criticalCount = reviews.filter((r) => r.rating <= 2).length;
    const toExport = filteredReviews.length ? filteredReviews : reviews;
    printMedicalReport({
      title: 'Patient Feedback & Ratings Report',
      subtitle: `Exported on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      summaryCards: [
        { label: 'Total Reviews', value: reviews.length },
        { label: 'Average Rating', value: `${avgRating} / 5` },
        { label: 'Resolved', value: resolvedCount },
        { label: 'Critical (≤2★)', value: criticalCount },
      ],
      columns: ['Patient', 'Doctor / Dept', 'Department', 'Rating', 'Status', 'Date', 'Comment'],
      data: toExport.map((r) => [
        r.patientName,
        r.doctorName,
        r.department,
        `${r.rating} / 5`,
        r.status,
        r.date,
        r.comment.slice(0, 80) + (r.comment.length > 80 ? '…' : ''),
      ]),
      facilityName: 'MediFlow AI Hospital',
    });
  };

  const handleExportCSVFn = () => {
    if (!reviews.length) return;
    const toExport = filteredReviews.length ? filteredReviews : reviews;
    exportToCSV(
      `feedback_report_${new Date().toISOString().slice(0, 10)}`,
      ['Patient Name', 'Doctor / Service', 'Department', 'Rating (out of 5)', 'Status', 'Date', 'Comment', 'Admin Note'],
      toExport.map((r) => [
        r.patientName,
        r.doctorName,
        r.department,
        r.rating,
        r.status,
        r.date,
        r.comment,
        r.adminNote || '',
      ])
    );
  };



  // Filter reviews
  const filteredReviews = reviews.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.patientName.toLowerCase().includes(q) ||
      item.doctorName.toLowerCase().includes(q) ||
      item.department.toLowerCase().includes(q) ||
      item.comment.toLowerCase().includes(q);

    const matchesRating =
      ratingFilter === 'ALL'
        ? true
        : ratingFilter === 'CRITICAL'
        ? item.rating <= 2
        : item.rating === Number(ratingFilter);

    const matchesStatus = statusFilter === 'ALL' ? true : item.status === statusFilter;

    return matchesSearch && matchesRating && matchesStatus;
  });

  const openModal = (review) => {
    setSelectedReview(review);
    setAdminReplyText(review.adminNote || '');
  };

  const handleResolveReview = (id) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'Resolved', adminNote: adminReplyText } : r
      )
    );
    setSelectedReview(null);
    triggerToast('Review response saved & marked as resolved!');
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1400px]">
        {/* ── Page Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              Feedback &amp; Reviews
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Patient Experience, Clinical Quality Ratings &amp; Grievance Redressal
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={!reviews.length}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-40"
            >
              <Printer className="w-3.5 h-3.5" />
              Print PDF
            </button>
            <button
              onClick={handleExportCSVFn}
              disabled={!reviews.length}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0EA5C9] rounded-xl text-xs font-bold text-white hover:bg-[#0B8BAA] transition-colors shadow-sm disabled:opacity-40"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Global Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 shadow-2xs"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 1. Top Stats Cards Row ───────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Average Rating"
            value="4.8 / 5.0"
            icon={Star}
            borderColor="bg-amber-400"
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            subtext="Based on 148 verified visits"
          />
          <StatCard
            label="Total Reviews"
            value={reviews.length + 142}
            icon={MessageSquare}
            borderColor="bg-blue-500"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            subtext="Patients &amp; staff feedback"
          />
          <StatCard
            label="Patient Satisfaction"
            value="94%"
            icon={HeartHandshake}
            borderColor="bg-emerald-500"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            subtext="Positive clinical sentiment"
          />
          <StatCard
            label="Open Grievances"
            value={reviews.filter((r) => r.status === 'Under Review').length}
            icon={AlertCircle}
            borderColor="bg-rose-500"
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            subtext="Pending quality follow-up"
          />
        </div>

        {/* ── 2. Category Satisfaction Breakdown ───────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Clinical Quality &amp; Department Performance Score
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Physician Care</span>
                <span className="font-extrabold text-amber-600 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.9
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#0EA5C9] h-full rounded-full w-[98%]" />
              </div>
              <p className="text-[10px] text-slate-400">Diagnosis clarity &amp; listening</p>
            </div>

            {/* Metric 2 */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Nursing &amp; Ward Care</span>
                <span className="font-extrabold text-amber-600 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.7
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full w-[94%]" />
              </div>
              <p className="text-[10px] text-slate-400">Inpatient attentiveness</p>
            </div>

            {/* Metric 3 */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Facility &amp; Cleanliness</span>
                <span className="font-extrabold text-amber-600 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.8
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[96%]" />
              </div>
              <p className="text-[10px] text-slate-400">Hygiene &amp; sanitized wards</p>
            </div>

            {/* Metric 4 */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">MediFlow AI Assistant</span>
                <span className="font-extrabold text-amber-600 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.9
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full w-[98%]" />
              </div>
              <p className="text-[10px] text-slate-400">Scheduling &amp; triage accuracy</p>
            </div>
          </div>
        </div>

        {/* ── 3. Patient Reviews Table & Directory ─────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-6 border-b border-slate-100">
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews, doctors..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Rating:</span>
              </div>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="CRITICAL">Critical (1-2 Stars)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="Resolved">Resolved</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Specialty &amp; Doctor</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Comment</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">
                          {item.patientName[0]}
                        </div>
                        <span>{item.patientName}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-slate-800">{item.department}</p>
                      <p className="text-[11px] text-slate-400">{item.doctorName}</p>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < item.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-slate-700 font-medium line-clamp-2 leading-relaxed">
                        "{item.comment}"
                      </p>
                      {item.adminNote && (
                        <span className="text-[10px] text-[#0EA5C9] font-bold block mt-1">
                          ✓ Admin note attached
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {item.date}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status === 'Resolved' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] px-2.5 py-1 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] px-2.5 py-1 rounded-full font-bold">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Under Review
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#0EA5C9] text-[#0EA5C9] font-bold rounded-xl shadow-2xs hover:bg-sky-50/50 transition-colors"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        Respond
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Showing {filteredReviews.length} feedback entries</span>
            <span className="font-medium text-slate-500">MediFlow Patient Experience Log</span>
          </div>
        </div>

        {/* ── 4. Feedback Response Modal ────────────────────── */}
        <AnimatePresence>
          {selectedReview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Review from {selectedReview.patientName}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {selectedReview.department} &bull; {selectedReview.doctorName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Patient Statement */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Patient Comment</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(selectedReview.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic leading-relaxed">
                      "{selectedReview.comment}"
                    </p>
                  </div>

                  {/* Admin Resolution Note */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      Administrative Action / Redressal Note
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Write response or internal action taken..."
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#0EA5C9]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReview(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolveReview(selectedReview.id)}
                    className="px-5 py-2 bg-[#0EA5C9] hover:bg-[#0b8cb0] text-white font-bold rounded-xl text-xs shadow-xs"
                  >
                    Mark as Resolved
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminFeedbackPage;

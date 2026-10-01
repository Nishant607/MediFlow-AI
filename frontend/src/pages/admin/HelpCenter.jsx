import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Search,
  BookOpen,
  ShieldCheck,
  Calendar,
  Receipt,
  Sparkles,
  ChevronDown,
  Phone,
  Mail,
  Headphones,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Activity,
  X,
  Send,
  FileText,
  AlertCircle,
  Clock,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const FAQ_ITEMS = [
  {
    id: 1,
    category: 'Admin & Security',
    question: 'How do I verify and approve newly registered doctors?',
    answer:
      'Navigate to the "Staff" directory (/admin/staff) or check the "Pending Doctor Approvals" widget on your Admin Dashboard. Verify their specialization, department, and medical qualification documents, then click "Approve Doctor". Once approved, the physician can immediately accept patient appointments.',
  },
  {
    id: 2,
    category: 'Billing & Reports',
    question: 'How are consultation fees (₹500.00) and digital invoices generated?',
    answer:
      'In MediFlow, whenever an attending doctor concludes a patient appointment and submits a clinical consultation note, the backend automatically generates a digital invoice with a standard consultation fee (₹500.00). You can review all invoices under the "Report" section (/admin/billing).',
  },
  {
    id: 3,
    category: 'AI Knowledge Base',
    question: 'How does the MediFlow AI Assistant index uploaded hospital policies and PDFs?',
    answer:
      'MediFlow AI utilizes Retrieval-Augmented Generation (RAG). Go to "Manage Knowledge Base" (/admin/knowledge-base) to upload clinical guidelines, hospital manuals, or FAQ documents in PDF or text format. The system processes and indexes them so patients and doctors receive verified answers.',
  },
  {
    id: 4,
    category: 'Admin & Security',
    question: 'Where can I monitor system compliance and security audit logs?',
    answer:
      'Access the "Audit Logs" module (/admin/audit-logs). Every login attempt, patient booking, consultation completion, doctor verification, and document modification is recorded with timestamp, user email, and IP address for HIPAA/clinical compliance.',
  },
  {
    id: 5,
    category: 'Appointments',
    question: 'How can administrators reschedule or monitor clinic-wide bookings?',
    answer:
      'Visit the "Appointments" page (/admin/appointments) to view the hospital calendar in either Weekly Grid or List view. You can navigate through future or past weeks, view scheduled doctor slots, and track today’s consultation load in real-time.',
  },
  {
    id: 6,
    category: 'Billing & Reports',
    question: 'Can hospital administrators export financial and patient records?',
    answer:
      'Yes, the Settings page (/admin/settings) allows configuring default export formats (PDF, Excel, CSV). You can also view granular billing and payment status under the Report tab.',
  },
];

const RESOURCE_CARDS = [
  {
    title: 'Staff Governance',
    desc: 'Doctor verification & clinical licensing compliance',
    icon: ShieldCheck,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    link: '/admin/staff',
  },
  {
    title: 'Appointments Schedule',
    desc: 'Clinic calendar, slot allocations & break timings',
    icon: Calendar,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    link: '/admin/appointments',
  },
  {
    title: 'Billing & Invoices',
    desc: 'Digital consultation invoices & revenue tracking',
    icon: Receipt,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    link: '/admin/billing',
  },
  {
    title: 'AI Knowledge Base',
    desc: 'RAG retrieval documents & hospital FAQ index',
    icon: Sparkles,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    link: '/admin/knowledge-base',
  },
];

const AdminHelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Topics');
  const [openFaqId, setOpenFaqId] = useState(1);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Technical Support');
  const [ticketDesc, setTicketDesc] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    setShowTicketModal(false);
    setTicketSubject('');
    setTicketDesc('');
    triggerToast('Support ticket #MED-8492 submitted! Our IT team will contact you shortly.');
  };

  const categories = ['All Topics', 'Admin & Security', 'Appointments', 'Billing & Reports', 'AI Knowledge Base'];

  // Filter FAQs
  const filteredFaqs = FAQ_ITEMS.filter((faq) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q) ||
      faq.category.toLowerCase().includes(q);

    const matchesCat =
      activeCategory === 'All Topics' || faq.category === activeCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1400px]">
        {/* ── 1. Hero Search Section ───────────────────────── */}
        <div className="bg-gradient-to-r from-sky-50 via-teal-50/40 to-white rounded-3xl border border-sky-100 p-6 sm:p-10 text-center relative overflow-hidden shadow-2xs">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-[#0EA5C9] border border-sky-200 shadow-2xs">
              <HelpCircle className="w-3.5 h-3.5" />
              MediFlow Help &amp; Operational Manuals
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How can we assist you today?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Find instant answers to hospital administration workflows, clinical scheduling, digital billing, and AI knowledge retrieval.
            </p>

            {/* Search Input Bar */}
            <div className="relative max-w-xl mx-auto pt-2">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides, FAQs, or troubleshooting topics..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5C9]/20 focus:border-[#0EA5C9] transition-all"
              />
            </div>

            {/* Quick Keyword Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-500">
              <span className="font-semibold">Popular topics:</span>
              {['Appointments', 'Billing', 'Staff Approval', 'AI Assistant', 'Audit Logs'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-600 hover:text-[#0EA5C9] border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
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

        {/* ── 2. Quick Resource Cards ──────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RESOURCE_CARDS.map((res) => {
            const Icon = res.icon;
            return (
              <Link
                key={res.title}
                to={res.link}
                className={`bg-white rounded-2xl border ${res.border} shadow-2xs hover:shadow-md p-5 transition-all flex flex-col justify-between group`}
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl ${res.bg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-5 h-5 ${res.color}`} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-[#0EA5C9] transition-colors">
                    {res.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {res.desc}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#0EA5C9]">
                  <span>Open Module</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── 3. Categorized Accordion FAQs ────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Frequently Asked Questions
              </h3>
              <p className="text-xs text-slate-400">
                Essential operational answers and platform guidance
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#0EA5C9] text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion List */}
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No answers matching "{searchQuery}". Try searching for another topic or submit a support ticket below.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div key={faq.id} className="py-4">
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between text-left gap-4 group"
                    >
                      <span className="font-bold text-slate-800 text-sm group-hover:text-[#0EA5C9] transition-colors">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#0EA5C9]' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 pb-1 text-xs text-slate-600 leading-relaxed pr-6">
                            <span className="inline-block px-2 py-0.5 rounded bg-sky-50 text-[#0EA5C9] font-bold text-[10px] uppercase tracking-wide mr-2 mb-1">
                              {faq.category}
                            </span>
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 4. IT Support & Direct Escalation Channels ───── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Channel 1: Dedicated IT Desk */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0EA5C9] flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">IT &amp; Systems Helpdesk</h4>
              <p className="text-xs text-slate-500">
                Direct hotline for clinical workstation or connectivity assistance.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0EA5C9]">
              <span>Toll-Free: 1800-MEDIFLOW</span>
              <Phone className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Channel 2: RAG Knowledge Base */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Knowledge Base Index</h4>
              <p className="text-xs text-slate-500">
                Upload or manage hospital clinical guidelines for AI retrieval.
              </p>
            </div>
            <Link
              to="/admin/knowledge-base"
              className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600 hover:underline"
            >
              <span>Manage Documents</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Channel 3: Submit Support Ticket */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Dedicated Support Ticket</h4>
              <p className="text-xs text-slate-500">
                Submit an internal operational ticket for IT escalation.
              </p>
            </div>
            <button
              onClick={() => setShowTicketModal(true)}
              className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 hover:underline"
            >
              <span>Submit Ticket</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── 5. Modal: Support Ticket ──────────────────────── */}
        <AnimatePresence>
          {showTicketModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0EA5C9] flex items-center justify-center">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Create Support Ticket
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        MediFlow Internal Helpdesk Escalation
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Issue Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#0EA5C9]"
                    >
                      <option value="Technical Support">Technical &amp; Connectivity Support</option>
                      <option value="Clinical Records & Doctor Schedule">Clinical Records &amp; Schedule</option>
                      <option value="Billing & Invoicing">Billing &amp; Invoicing</option>
                      <option value="AI Assistant Knowledge Base">AI Assistant Knowledge Base</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Need assistance with doctor calendar sync"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#0EA5C9]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Description</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe the issue or error observed..."
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#0EA5C9]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTicketModal(false)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#0EA5C9] hover:bg-[#0b8cb0] text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit Ticket
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminHelpCenterPage;

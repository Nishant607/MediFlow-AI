import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Stethoscope,
  Receipt,
  Phone,
  LayoutDashboard,
  Users,
  Calendar,
  Building2,
  FileBarChart2,
  FileText,
  ShieldCheck,
  Settings,
  HelpCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  CornerDownLeft,
} from 'lucide-react';
import { listDoctors } from '../../api/doctorsApi';
import { getAllInvoices } from '../../api/billingApi';
import { getEmergencyContacts } from '../../api/departmentsApi';
import { useAuth } from '../../context/AuthContext';

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const role = currentUser?.role;

  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Fetch search index data once modal is opened
  useEffect(() => {
    if (!isOpen) return;

    // Reset query & focus
    setQuery('');
    setSelectedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 50);

    const loadIndex = async () => {
      setLoadingData(true);
      try {
        const [docsRes, invRes, emergRes] = await Promise.all([
          listDoctors().catch(() => []),
          getAllInvoices().catch(() => []),
          getEmergencyContacts().catch(() => []),
        ]);

        setDoctors(Array.isArray(docsRes) ? docsRes : docsRes?.results || []);
        setInvoices(Array.isArray(invRes) ? invRes : invRes?.results || []);
        setEmergencyContacts(Array.isArray(emergRes) ? emergRes : emergRes?.results || []);
      } catch (err) {
        console.error('Failed to load global search index', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadIndex();
  }, [isOpen]);

  // System pages definition
  const systemRoutes = useMemo(() => {
    if (role === 'patient') {
      return [
        { label: 'Patient Dashboard', category: 'Navigation', path: '/patient/dashboard', icon: LayoutDashboard },
        { label: 'Book an Appointment', category: 'Navigation', path: '/patient/book-appointment', icon: Calendar },
        { label: 'My Appointments', category: 'Navigation', path: '/patient/appointments', icon: Calendar },
        { label: 'Medical & Lab Records', category: 'Navigation', path: '/patient/medical-records', icon: FileText },
        { label: 'Billing & Invoices', category: 'Navigation', path: '/patient/billing', icon: Receipt },
        { label: 'AI Health Assistant', category: 'Navigation', path: '/patient/ai-assistant', icon: Sparkles },
        { label: 'Emergency Contacts', category: 'Navigation', path: '/patient/emergency', icon: Phone },
        { label: 'Account & Medical Settings', category: 'Navigation', path: '/patient/settings', icon: Settings },
      ];
    }

    if (role === 'doctor') {
      return [
        { label: 'Doctor Dashboard', category: 'Navigation', path: '/doctor/dashboard', icon: LayoutDashboard },
        { label: 'Weekly Schedule', category: 'Navigation', path: '/doctor/schedule', icon: Calendar },
        { label: 'My Patients', category: 'Navigation', path: '/doctor/patients', icon: Users },
        { label: 'Live Consultations', category: 'Navigation', path: '/doctor/consultations', icon: MessageSquare },
        { label: 'Medical Records', category: 'Navigation', path: '/doctor/records', icon: FileText },
        { label: 'AI Clinical Assistant', category: 'Navigation', path: '/doctor/ai-assistant', icon: Sparkles },
        { label: 'Account Settings', category: 'Navigation', path: '/doctor/settings', icon: Settings },
      ];
    }

    return [
      { label: 'Admin Dashboard', category: 'Navigation', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Staff Management Directory', category: 'Navigation', path: '/admin/staff', icon: Stethoscope },
      { label: 'Staff Performance Reports', category: 'Navigation', path: '/admin/staff-report', icon: FileBarChart2 },
      { label: 'Appointments Calendar', category: 'Navigation', path: '/admin/appointments', icon: Calendar },
      { label: 'Patient Directory', category: 'Navigation', path: '/admin/patients', icon: Users },
      { label: 'Billing, Analytics & Invoices', category: 'Navigation', path: '/admin/billing', icon: Receipt },
      { label: 'Clinic & Departments', category: 'Navigation', path: '/admin/clinic', icon: Building2 },
      { label: 'Security & Audit Logs', category: 'Navigation', path: '/admin/audit-logs', icon: ShieldCheck },
      { label: 'Patient Feedback & Ratings', category: 'Navigation', path: '/admin/feedback', icon: MessageSquare },
      { label: 'Hospital Knowledge Base', category: 'Navigation', path: '/admin/knowledge-base', icon: HelpCircle },
      { label: 'System Settings', category: 'Navigation', path: '/admin/settings', icon: Settings },
    ];
  }, [role]);

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default: show popular navigation and recent routes
      return systemRoutes.slice(0, 5).map((item) => ({
        id: `nav-${item.path}`,
        type: 'Navigation',
        title: item.label,
        subtitle: 'Quick System Route',
        icon: item.icon,
        action: () => navigate(item.path),
      }));
    }

    const results = [];

    // 1. Search Navigation
    systemRoutes.forEach((route) => {
      if (route.label.toLowerCase().includes(q)) {
        results.push({
          id: `nav-${route.path}`,
          type: 'Navigation',
          title: route.label,
          subtitle: `Open ${route.label}`,
          icon: route.icon,
          action: () => navigate(route.path),
        });
      }
    });

    // 2. Search Doctors
    doctors.forEach((doc) => {
      const name = doc.user_detail?.full_name || doc.user?.full_name || '';
      const spec = doc.specialization || '';
      const dept = doc.department_detail?.name || '';
      if (
        name.toLowerCase().includes(q) ||
        spec.toLowerCase().includes(q) ||
        dept.toLowerCase().includes(q)
      ) {
        results.push({
          id: `doc-${doc.id}`,
          type: 'Staff & Doctors',
          title: `Dr. ${name}`,
          subtitle: `${spec} · ${dept || 'General'}`,
          icon: Stethoscope,
          badge: doc.is_approved ? 'Verified' : 'Pending',
          badgeColor: doc.is_approved ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50',
          action: () => navigate(role === 'doctor' ? '/doctor/patients' : '/admin/staff'),
        });
      }
    });

    // 3. Search Invoices (Admin only or all)
    invoices.forEach((inv) => {
      const patient = inv.patient_detail?.user_full_name || '';
      const doctor = inv.doctor_detail?.user_full_name || '';
      const invId = `#${inv.id}`;
      const amount = `₹${inv.total_amount}`;
      if (
        patient.toLowerCase().includes(q) ||
        doctor.toLowerCase().includes(q) ||
        invId.toLowerCase().includes(q) ||
        amount.includes(q)
      ) {
        results.push({
          id: `inv-${inv.id}`,
          type: 'Invoices & Billing',
          title: `Invoice #${inv.id} — ${patient || 'Patient'}`,
          subtitle: `Dr. ${doctor || 'Doctor'} · ${inv.appointment_date || 'Visit'} · ₹${inv.total_amount}`,
          icon: Receipt,
          badge: inv.status,
          badgeColor: inv.status === 'PAID' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50',
          action: () => navigate('/admin/billing'),
        });
      }
    });

    // 4. Search Emergency Contacts
    emergencyContacts.forEach((contact) => {
      const dept = contact.department_name || contact.name || '';
      const phone = contact.phone_number || '';
      if (dept.toLowerCase().includes(q) || phone.includes(q)) {
        results.push({
          id: `emerg-${contact.id}`,
          type: 'Emergency Desk',
          title: dept,
          subtitle: `Hotline: ${phone} (${contact.available_hours || '24/7'})`,
          icon: Phone,
          action: () => {
            window.location.href = `tel:${phone}`;
          },
        });
      }
    });

    return results;
  }, [query, systemRoutes, doctors, invoices, emergencyContacts, navigate, role]);

  // Keyboard Navigation inside Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(searchResults.length - 1, 0)));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          searchResults[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] z-10"
        >
          {/* Top Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3 bg-white">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search doctors, patient invoices, departments, or jump to page..."
              className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div ref={listRef} className="overflow-y-auto p-3 space-y-1 flex-1">
            {loadingData && (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                Syncing search index…
              </div>
            )}

            {!loadingData && searchResults.length === 0 && (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No results found for "{query}"</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try searching by doctor name, medical department, invoice ID, or navigation keyword.
                </p>
              </div>
            )}

            {!loadingData && searchResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  data-index={idx}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0EA5C9]/10 border border-[#0EA5C9]/30 text-slate-900 shadow-sm'
                      : 'hover:bg-slate-50 border border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#0EA5C9] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                          {item.title}
                        </p>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-current/20 ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        <span className="font-semibold text-slate-500">{item.type}</span> · {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-slate-400 text-xs">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[#0EA5C9] text-[11px] font-bold">
                        <span>Select</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Guide */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↓</kbd>
                <span>to navigate</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↵</kbd>
                <span>to select</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">esc</kbd>
                <span>to close</span>
              </span>
            </div>
            <span className="hidden sm:inline text-[#0EA5C9] font-bold">MediFlow OmniSearch</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GlobalSearchModal;

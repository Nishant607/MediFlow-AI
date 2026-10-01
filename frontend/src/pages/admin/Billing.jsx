import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  ArrowLeft,
  LogOut,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  Clock,
  Activity,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  PieChart,
  BarChart3,
  Stethoscope,
  Users,
  AlertCircle,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllInvoices } from '../../api/billingApi';
import { getAdminStats } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { printMedicalReport } from '../../utils/reportGenerator';

/* ─── Currency Helpers ─── */
const formatINR = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

const formatShortINR = (num) => {
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
  return `₹${num}`;
};

const AdminBilling = () => {
  const { logout } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics controls
  const [timeframe, setTimeframe] = useState('6M'); // '6M' | 'YTD' | 'ALL'
  const [hoveredApptMonth, setHoveredApptMonth] = useState(null);
  const [hoveredRevMonth, setHoveredRevMonth] = useState(null);

  // Table controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PAID' | 'PENDING'
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'amt-desc' | 'amt-asc'

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [invData, statsData] = await Promise.all([
        getAllInvoices().catch((e) => {
          console.error('Invoices fetch error', e);
          return [];
        }),
        getAdminStats().catch((e) => {
          console.error('Admin stats fetch error', e);
          return null;
        }),
      ]);

      setInvoices(Array.isArray(invData) ? invData : invData?.results || []);
      setAdminStats(statsData);
    } catch (err) {
      console.error('Failed to load billing & analytics data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ─── 1. Monthly Aggregation Pipeline ─── */
  const monthlyData = useMemo(() => {
    const now = new Date();
    let monthBuckets = [];

    if (timeframe === '6M') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        monthBuckets.push({
          key: `${y}-${m}`,
          label: d.toLocaleDateString('en-IN', { month: 'short' }),
          fullLabel: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        });
      }
    } else if (timeframe === 'YTD') {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      for (let i = 0; i <= currentMonth; i++) {
        const d = new Date(currentYear, i, 1);
        const y = d.getFullYear();
        const m = String(i + 1).padStart(2, '0');
        monthBuckets.push({
          key: `${y}-${m}`,
          label: d.toLocaleDateString('en-IN', { month: 'short' }),
          fullLabel: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        });
      }
    } else {
      // ALL Time: find min and max dates from invoices
      const uniqueKeys = new Set();
      invoices.forEach((inv) => {
        const dStr = inv.appointment_date || inv.created_at?.slice(0, 10);
        if (dStr && dStr.length >= 7) {
          uniqueKeys.add(dStr.slice(0, 7));
        }
      });
      const sortedKeys = Array.from(uniqueKeys).sort();
      if (sortedKeys.length >= 2) {
        sortedKeys.forEach((key) => {
          const [y, m] = key.split('-');
          const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
          monthBuckets.push({
            key,
            label: d.toLocaleDateString('en-IN', { month: 'short' }),
            fullLabel: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          });
        });
      } else {
        // Fallback to last 6 months
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          monthBuckets.push({
            key: `${y}-${m}`,
            label: d.toLocaleDateString('en-IN', { month: 'short' }),
            fullLabel: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          });
        }
      }
    }

    // Populate counts and revenue per month
    const bucketMap = {};
    monthBuckets.forEach((b) => {
      bucketMap[b.key] = {
        ...b,
        appointments: 0,
        paidRevenue: 0,
        pendingRevenue: 0,
        totalRevenue: 0,
        paidCount: 0,
        pendingCount: 0,
      };
    });

    invoices.forEach((inv) => {
      const dStr = inv.appointment_date || inv.created_at?.slice(0, 10);
      if (!dStr) return;
      const key = dStr.slice(0, 7);
      if (bucketMap[key]) {
        bucketMap[key].appointments += 1;
        const amount = parseFloat(inv.total_amount) || 0;
        bucketMap[key].totalRevenue += amount;
        if (inv.status === 'PAID') {
          bucketMap[key].paidRevenue += amount;
          bucketMap[key].paidCount += 1;
        } else {
          bucketMap[key].pendingRevenue += amount;
          bucketMap[key].pendingCount += 1;
        }
      }
    });

    return Object.values(bucketMap);
  }, [invoices, timeframe]);

  /* ─── 2. Top Metric Computations ─── */
  const metrics = useMemo(() => {
    let totalBilled = 0;
    let paidRevenue = 0;
    let pendingRevenue = 0;
    let paidCount = 0;
    let pendingCount = 0;

    invoices.forEach((inv) => {
      const amt = parseFloat(inv.total_amount) || 0;
      totalBilled += amt;
      if (inv.status === 'PAID') {
        paidRevenue += amt;
        paidCount += 1;
      } else {
        pendingRevenue += amt;
        pendingCount += 1;
      }
    });

    const collectionRate =
      totalBilled > 0 ? ((paidRevenue / totalBilled) * 100).toFixed(1) : '100.0';
    const totalAppointments = invoices.length;
    const avgInvoice = totalAppointments > 0 ? totalBilled / totalAppointments : 0;

    return {
      totalBilled,
      paidRevenue,
      pendingRevenue,
      paidCount,
      pendingCount,
      collectionRate,
      totalAppointments,
      avgInvoice,
    };
  }, [invoices]);

  /* ─── 3. Department / Specialization Contribution ─── */
  const specialtyBreakdown = useMemo(() => {
    const map = {};
    invoices.forEach((inv) => {
      const spec = inv.doctor_detail?.specialization || 'General Consultation';
      if (!map[spec]) {
        map[spec] = {
          name: spec,
          count: 0,
          revenue: 0,
          paidRevenue: 0,
        };
      }
      map[spec].count += 1;
      const amt = parseFloat(inv.total_amount) || 0;
      map[spec].revenue += amt;
      if (inv.status === 'PAID') {
        map[spec].paidRevenue += amt;
      }
    });

    const list = Object.values(map).sort((a, b) => b.revenue - a.revenue);
    const totalRev = metrics.totalBilled || 1;
    return list.slice(0, 5).map((item) => ({
      ...item,
      percentage: ((item.revenue / totalRev) * 100).toFixed(1),
    }));
  }, [invoices, metrics.totalBilled]);

  /* ─── 4. Filtered & Sorted Invoices ─── */
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const patientName = inv.patient_detail?.user_full_name?.toLowerCase() || '';
        const doctorName = inv.doctor_detail?.user_full_name?.toLowerCase() || '';
        const spec = inv.doctor_detail?.specialization?.toLowerCase() || '';
        const invId = String(inv.id || '');
        return (
          patientName.includes(q) ||
          doctorName.includes(q) ||
          spec.includes(q) ||
          invId.includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.created_at || b.appointment_date) - new Date(a.created_at || a.appointment_date);
        }
        if (sortBy === 'date-asc') {
          return new Date(a.created_at || a.appointment_date) - new Date(b.created_at || b.appointment_date);
        }
        if (sortBy === 'amt-desc') {
          return (parseFloat(b.total_amount) || 0) - (parseFloat(a.total_amount) || 0);
        }
        if (sortBy === 'amt-asc') {
          return (parseFloat(a.total_amount) || 0) - (parseFloat(b.total_amount) || 0);
        }
        return 0;
      });
  }, [invoices, statusFilter, searchQuery, sortBy]);

  /* ─── 5. Export to CSV ─── */
  const handleExportCSV = () => {
    if (!filteredInvoices.length) return;
    const headers = [
      'Invoice ID',
      'Patient Name',
      'Attending Doctor',
      'Specialization',
      'Appointment Date',
      'Appointment Time',
      'Total Amount (INR)',
      'Status',
      'Created Date',
      'Paid Date',
    ];
    const rows = filteredInvoices.map((inv) => [
      inv.id,
      `"${inv.patient_detail?.user_full_name || 'N/A'}"`,
      `"Dr. ${inv.doctor_detail?.user_full_name || 'N/A'}"`,
      `"${inv.doctor_detail?.specialization || 'N/A'}"`,
      inv.appointment_date || 'N/A',
      inv.appointment_time || 'N/A',
      inv.total_amount || '0.00',
      inv.status || 'PENDING',
      inv.created_at ? new Date(inv.created_at).toISOString().slice(0, 10) : 'N/A',
      inv.paid_at ? new Date(inv.paid_at).toISOString().slice(0, 10) : 'N/A',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `mediflow_invoices_analytics_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ─── PDF Financial Statement ─── */
  const handleExportPDF = () => {
    if (!filteredInvoices.length) return;
    printMedicalReport({
      title: 'Financial Statement — Invoice Audit Report',
      subtitle: `Period: ${timeframe === '6M' ? 'Last 6 Months' : timeframe === 'YTD' ? 'Year to Date' : 'All Time'} · Generated ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      summaryCards: [
        { label: 'Total Billed', value: formatINR(metrics.totalBilled) },
        { label: 'Realized Revenue', value: formatINR(metrics.paidRevenue) },
        { label: 'Outstanding', value: formatINR(metrics.pendingRevenue) },
        { label: 'Collection Rate', value: `${metrics.collectionRate}%` },
      ],
      columns: ['Invoice ID', 'Patient', 'Attending Doctor', 'Specialization', 'Date', 'Amount (INR)', 'Status'],
      data: filteredInvoices.map((inv) => [
        `#${inv.id}`,
        inv.patient_detail?.user_full_name || 'N/A',
        `Dr. ${inv.doctor_detail?.user_full_name || 'N/A'}`,
        inv.doctor_detail?.specialization || 'N/A',
        inv.appointment_date || (inv.created_at ? new Date(inv.created_at).toISOString().slice(0, 10) : 'N/A'),
        `₹${parseFloat(inv.total_amount || 0).toLocaleString('en-IN')}`,
        inv.status || 'PENDING',
      ]),
      facilityName: 'MediFlow AI Hospital',
    });
  };


  /* ─── Format helper for table timestamp ─── */
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Peak calculation for charts
  const maxAppointments = Math.max(...monthlyData.map((m) => m.appointments), 1);
  const maxRevenue = Math.max(...monthlyData.map((m) => m.totalRevenue), 1000);
  const peakMonth = monthlyData.reduce(
    (max, m) => (m.appointments > max.appointments ? m : max),
    monthlyData[0] || { label: 'N/A', appointments: 0 }
  );

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto space-y-6 p-4 md:p-8">
        {/* ────────────────────────────────────────────────────────── */}
        {/* TOP HEADER & CONTROLS                                      */}
        {/* ────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 p-5 md:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1 hover:text-[#0EA5C9] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
              </Link>
              <span>/</span>
              <span className="text-[#0EA5C9] font-bold">Advanced Analytics &amp; Billing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#0EA5C9]/10 border border-[#0EA5C9]/20 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-[#0EA5C9]" />
              </span>
              Clinical Analytics &amp; Revenue Intelligence
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
              Real-time monthly appointment trajectory, realized revenue collections &amp; departmental performance
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Timeframe Toggle */}
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
              {[
                { key: '6M', label: 'Last 6 Months' },
                { key: 'YTD', label: 'Year to Date' },
                { key: 'ALL', label: 'All Time' },
              ].map((tf) => (
                <button
                  key={tf.key}
                  onClick={() => setTimeframe(tf.key)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeframe === tf.key
                      ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              title="Refresh Analytics Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              disabled={filteredInvoices.length === 0}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#0EA5C9]" />
              <span>Export CSV</span>
            </button>

            {/* Financial Statement PDF Button */}
            <button
              onClick={handleExportPDF}
              disabled={filteredInvoices.length === 0}
              className="inline-flex items-center gap-1.5 bg-[#0EA5C9] hover:bg-[#0B8BAA] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Financial PDF</span>
            </button>
          </div>
        </motion.div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* CHARTS AT THE VERY TOP (User Requirement: sabse uper dikhna)*/}
        {/* ────────────────────────────────────────────────────────── */}

        {/* 1. TOP METRICS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Volume */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Invoiced Volume
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                <Receipt className="w-4.5 h-4.5 text-purple-600" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-28 rounded-lg mb-2" />
            ) : (
              <div>
                <p className="text-2xl xl:text-3xl font-black text-slate-900 tracking-tight">
                  {formatINR(metrics.totalBilled)}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-0.5 font-bold text-purple-600">
                    <Calendar className="w-3 h-3" />
                    {metrics.totalAppointments}
                  </span>
                  <span>total consultation invoices</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Card 2: Net Realized Revenue */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Realized Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <DollarSign className="w-4.5 h-4.5 text-[#00843D]" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-28 rounded-lg mb-2" />
            ) : (
              <div>
                <p className="text-2xl xl:text-3xl font-black text-[#00843D] tracking-tight">
                  {formatINR(metrics.paidRevenue)}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 font-bold text-[#00843D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    {metrics.paidCount} Paid
                  </span>
                  <span>settled into hospital accounts</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Card 3: Outstanding Receivables */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Pending Receivables
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-amber-600" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-28 rounded-lg mb-2" />
            ) : (
              <div>
                <p className="text-2xl xl:text-3xl font-black text-amber-600 tracking-tight">
                  {formatINR(metrics.pendingRevenue)}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">
                    <AlertCircle className="w-3 h-3" />
                    {metrics.pendingCount} Pending
                  </span>
                  <span>awaiting patient payment</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Card 4: Collection Efficiency Rate */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Collection Efficiency
              </span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5 text-[#0EA5C9]" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-28 rounded-lg mb-2" />
            ) : (
              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl xl:text-3xl font-black text-slate-900 tracking-tight">
                    {metrics.collectionRate}%
                  </p>
                  <span className="text-[11px] font-bold text-slate-500">
                    Avg {formatINR(metrics.avgInvoice)} / visit
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="bg-[#0EA5C9] h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(parseFloat(metrics.collectionRate) || 0, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* 2. DUAL INTERACTIVE CHARTS ROW (AT THE TOP) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ────────────────────────────────────────────────────────── */}
          {/* CHART 1: Monthly Appointments & Consultations Trend        */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#0EA5C9]" />
                    Monthly Consultations Trend
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Appointment volume over {timeframe === '6M' ? 'the last 6 months' : timeframe === 'YTD' ? 'year to date' : 'all recorded visits'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                    Peak: {peakMonth.label} ({peakMonth.appointments})
                  </span>
                </div>
              </div>

              {/* Chart Canvas */}
              {loading ? (
                <div className="py-16 space-y-4">
                  <Skeleton className="h-36 rounded-xl" />
                </div>
              ) : monthlyData.length === 0 ? (
                <div className="py-14 text-center">
                  <EmptyState
                    icon={Calendar}
                    title="No appointment trend data"
                    description="When patients book appointments, monthly trends will automatically populate here."
                  />
                </div>
              ) : (
                <div className="pt-6 pb-2">
                  {/* Visual SVG / CSS Bar Chart with connecting area */}
                  <div className="relative h-48 w-full flex items-end justify-between gap-2 sm:gap-4 px-2">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                      <div className="border-b border-dashed border-slate-300 w-full" />
                      <div className="border-b border-dashed border-slate-300 w-full" />
                      <div className="border-b border-dashed border-slate-300 w-full" />
                      <div className="border-b border-slate-200 w-full" />
                    </div>

                    {/* Bars for each month */}
                    {monthlyData.map((m, idx) => {
                      const heightPercent = maxAppointments > 0 ? (m.appointments / maxAppointments) * 100 : 0;
                      const isHovered = hoveredApptMonth?.key === m.key;
                      return (
                        <div
                          key={m.key}
                          className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                          onMouseEnter={() => setHoveredApptMonth(m)}
                          onMouseLeave={() => setHoveredApptMonth(null)}
                        >
                          {/* Tooltip on Hover */}
                          <AnimatePresence>
                            {isHovered && (
                              <motion.div
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: -6, scale: 1 }}
                                exit={{ opacity: 0, y: 2 }}
                                className="absolute bottom-full mb-1 z-30 bg-slate-900 text-white text-[11px] py-1.5 px-2.5 rounded-xl shadow-lg whitespace-nowrap pointer-events-none"
                              >
                                <p className="font-bold text-slate-100">{m.fullLabel}</p>
                                <p className="text-cyan-300 font-semibold">{m.appointments} Consultations</p>
                                <p className="text-slate-400 text-[10px]">
                                  {m.paidCount} Paid · {m.pendingCount} Pending
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Count Pill above bar */}
                          <span
                            className={`text-[10px] font-bold mb-1 transition-colors ${
                              isHovered ? 'text-[#0EA5C9]' : 'text-slate-400'
                            }`}
                          >
                            {m.appointments}
                          </span>

                          {/* Bar */}
                          <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end relative h-36">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(heightPercent, 4)}%` }}
                              transition={{ duration: 0.6, delay: idx * 0.05 }}
                              className={`w-full rounded-t-xl transition-all duration-300 ${
                                isHovered
                                  ? 'bg-[#0EA5C9] shadow-md'
                                  : 'bg-gradient-to-t from-[#0284C7] to-[#0EA5C9]/85'
                              }`}
                            />
                          </div>

                          {/* X-axis Label */}
                          <span
                            className={`mt-2 text-xs font-semibold transition-colors ${
                              isHovered ? 'text-slate-900 font-bold' : 'text-slate-500'
                            }`}
                          >
                            {m.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Insight Footer */}
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#0EA5C9]" />
                Average monthly visits:{' '}
                <strong className="text-slate-800">
                  {monthlyData.length > 0
                    ? (metrics.totalAppointments / monthlyData.length).toFixed(1)
                    : 0}
                  /mo
                </strong>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">100% Verified System Records</span>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* CHART 2: Monthly Revenue & Collections Breakdown           */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#00843D]" />
                    Revenue Trajectory &amp; Collections
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Paid realized collections vs outstanding receivables
                  </p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00843D]" />
                    Paid
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Pending
                  </span>
                </div>
              </div>

              {/* Chart Canvas */}
              {loading ? (
                <div className="py-16 space-y-4">
                  <Skeleton className="h-36 rounded-xl" />
                </div>
              ) : monthlyData.length === 0 ? (
                <div className="py-14 text-center">
                  <EmptyState
                    icon={DollarSign}
                    title="No financial revenue records"
                    description="When invoices are finalized, financial trajectory bars will appear here."
                  />
                </div>
              ) : (
                <div className="pt-6 pb-2">
                  <div className="relative h-48 w-full flex items-end justify-between gap-2 sm:gap-4 px-2">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                      <div className="border-b border-dashed border-slate-300 w-full" />
                      <div className="border-b border-dashed border-slate-300 w-full" />
                      <div className="border-b border-dashed border-slate-300 w-full" />
                      <div className="border-b border-slate-200 w-full" />
                    </div>

                    {/* Dual Grouped Bars */}
                    {monthlyData.map((m, idx) => {
                      const paidHeight = maxRevenue > 0 ? (m.paidRevenue / maxRevenue) * 100 : 0;
                      const pendingHeight = maxRevenue > 0 ? (m.pendingRevenue / maxRevenue) * 100 : 0;
                      const isHovered = hoveredRevMonth?.key === m.key;

                      return (
                        <div
                          key={m.key}
                          className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                          onMouseEnter={() => setHoveredRevMonth(m)}
                          onMouseLeave={() => setHoveredRevMonth(null)}
                        >
                          {/* Tooltip on Hover */}
                          <AnimatePresence>
                            {isHovered && (
                              <motion.div
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: -6, scale: 1 }}
                                exit={{ opacity: 0, y: 2 }}
                                className="absolute bottom-full mb-1 z-30 bg-slate-900 text-white text-[11px] py-2 px-3 rounded-xl shadow-lg whitespace-nowrap pointer-events-none"
                              >
                                <p className="font-bold text-slate-100">{m.fullLabel}</p>
                                <p className="text-emerald-400 font-bold">
                                  Paid: {formatINR(m.paidRevenue)}
                                </p>
                                <p className="text-amber-300 font-bold">
                                  Pending: {formatINR(m.pendingRevenue)}
                                </p>
                                <p className="text-slate-400 text-[10px] pt-1 border-t border-slate-700/80 mt-1">
                                  Total: {formatINR(m.totalRevenue)}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Total Value Indicator on top */}
                          <span
                            className={`text-[9px] font-bold mb-1 truncate transition-colors ${
                              isHovered ? 'text-slate-900 font-extrabold' : 'text-slate-400'
                            }`}
                          >
                            {formatShortINR(m.totalRevenue)}
                          </span>

                          {/* Grouped Bar Container */}
                          <div className="w-full max-w-[44px] flex items-end gap-1 h-36">
                            {/* Paid Bar */}
                            <div className="flex-1 bg-slate-100 rounded-t-md overflow-hidden flex items-end h-full">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(paidHeight, m.paidRevenue > 0 ? 5 : 0)}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.05 }}
                                className="w-full bg-[#00843D] rounded-t-md hover:brightness-110 transition-all"
                              />
                            </div>

                            {/* Pending Bar */}
                            <div className="flex-1 bg-slate-100 rounded-t-md overflow-hidden flex items-end h-full">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(pendingHeight, m.pendingRevenue > 0 ? 5 : 0)}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.05 }}
                                className="w-full bg-amber-500 rounded-t-md hover:brightness-110 transition-all"
                              />
                            </div>
                          </div>

                          {/* X-axis Label */}
                          <span
                            className={`mt-2 text-xs font-semibold transition-colors ${
                              isHovered ? 'text-slate-900 font-bold' : 'text-slate-500'
                            }`}
                          >
                            {m.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Insight Footer */}
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00843D]" />
                Realized Cash Flow:{' '}
                <strong className="text-[#00843D]">
                  {formatINR(metrics.paidRevenue)}
                </strong>
              </span>
              <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">
                Pending: {formatINR(metrics.pendingRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* 3. SPECIALTY / DEPARTMENT CONTRIBUTION BREAKDOWN           */}
        {/* ────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#0EA5C9]" />
                Clinical Specialization Revenue Contribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Revenue and consultation breakdown across active hospital medical departments
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Top Contributing Specialties
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
          ) : specialtyBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No departmental invoice breakdown available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialtyBreakdown.map((spec, i) => (
                <div
                  key={spec.name}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800 truncate">{spec.name}</p>
                      <p className="text-xs text-slate-400">
                        {spec.count} {spec.count === 1 ? 'consultation' : 'consultations'}
                      </p>
                    </div>
                    <span className="bg-[#0EA5C9]/10 text-[#0EA5C9] font-extrabold text-xs px-2 py-0.5 rounded-full border border-[#0EA5C9]/20">
                      {spec.percentage}%
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">Revenue Billed</span>
                      <span className="text-[#00843D] font-bold font-mono">
                        {formatINR(spec.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#0EA5C9] to-[#00843D] h-full rounded-full transition-all duration-500"
                        style={{ width: `${spec.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* 4. INVOICES DIRECTORY & AUDIT TABLE (ADJUSTED BELOW)       */}
        {/* ────────────────────────────────────────────────────────── */}
        <div className="bg-white shadow-clinic rounded-2xl border border-slate-200/90 overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-5 md:p-6 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Receipt className="w-4.5 h-4.5 text-[#0EA5C9]" />
                Consultation Invoices Directory
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Audit trail of all patient invoices, attending practitioners &amp; settlement statuses
              </p>
            </div>

            {/* Filters, Search & Sort */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient, doctor, ID…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5C9]/30 focus:border-[#0EA5C9] transition-all"
                />
              </div>

              {/* Status Tabs */}
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                {[
                  { key: 'ALL', label: `All (${invoices.length})` },
                  { key: 'PAID', label: `Paid (${metrics.paidCount})` },
                  { key: 'PENDING', label: `Pending (${metrics.pendingCount})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      statusFilter === tab.key
                        ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0EA5C9]/30"
              >
                <option value="date-desc">Newest Date</option>
                <option value="date-asc">Oldest Date</option>
                <option value="amt-desc">Amount: High to Low</option>
                <option value="amt-asc">Amount: Low to High</option>
              </select>
            </div>
          </div>

          {/* Invoices Table Body */}
          {loading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Receipt}
                title={
                  searchQuery || statusFilter !== 'ALL'
                    ? 'No invoices match your filter'
                    : 'No invoices generated in the system yet'
                }
                description={
                  searchQuery || statusFilter !== 'ALL'
                    ? 'Try clearing your search query or switching to "All" status filter.'
                    : 'When doctors conclude appointment consultations, digital invoices will appear here automatically.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/90 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Invoice ID</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Attending Doctor</th>
                    <th className="px-6 py-4">Visit Date &amp; Time</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        #{inv.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {inv.patient_detail?.user_full_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <span className="font-semibold">Dr. {inv.doctor_detail?.user_full_name || 'N/A'}</span>
                        {inv.doctor_detail?.specialization && (
                          <span className="block text-[11px] text-slate-400">
                            {inv.doctor_detail.specialization}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="font-medium">{inv.appointment_date}</span>
                        {inv.appointment_time && (
                          <span className="text-slate-400 font-mono text-[11px] ml-1">
                            ({inv.appointment_time.slice(0, 5)})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-[#00843D] text-sm">
                        {formatINR(inv.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        {inv.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-[#00843D] text-[11px] px-2.5 py-1 rounded-full font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] px-2.5 py-1 rounded-full font-bold">
                            <Clock className="w-3 h-3" />
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {formatDate(inv.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer Summary */}
          {!loading && filteredInvoices.length > 0 && (
            <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                Showing <strong className="text-slate-800">{filteredInvoices.length}</strong> of{' '}
                <strong className="text-slate-800">{invoices.length}</strong> total invoices
              </span>
              <span className="font-mono text-slate-400">
                Filtered Total: <strong className="text-slate-800 font-bold">{formatINR(filteredInvoices.reduce((s, i) => s + (parseFloat(i.total_amount) || 0), 0))}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBilling;

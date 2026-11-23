import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarPlus,
  Calendar,
  FileText,
  Receipt,
  Bot,
  ShieldAlert,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Search,
  Menu,
  X,
  Activity,
  Phone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';
import GlobalSearchModal from '../common/GlobalSearchModal';
import useProfilePhoto from '../../hooks/useProfilePhoto';

/* ─── brand accent colour matching Doctor & Admin ──────────── */
const ACCENT = '#0EA5C9';
const ACCENT_LIGHT = '#E0F4F9';

const PatientLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Profile photo scoped to email
  const { photoUrl } = useProfilePhoto(currentUser?.email);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fullName = currentUser?.full_name || 'Patient';
  const email = currentUser?.email || '';
  const firstName = fullName.split(' ')[0] || 'Patient';

  // Get initials for avatar
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'P';

  const isActive = (path) =>
    location.pathname === path || (path !== '/patient/dashboard' && location.pathname.startsWith(path));

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /* ─── Nav items for Patient ─────────────────────────────── */
  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: '/patient/dashboard',
    },
    {
      label: 'Book Appointment',
      icon: CalendarPlus,
      to: '/patient/book-appointment',
    },
    {
      label: 'My Appointments',
      icon: Calendar,
      to: '/patient/appointments',
    },
    {
      label: 'Medical Records',
      icon: FileText,
      to: '/patient/medical-records',
    },
    {
      label: 'Billing & Invoices',
      icon: Receipt,
      to: '/patient/billing',
    },
    {
      label: 'AI Assistant',
      icon: Bot,
      to: '/patient/ai-assistant',
    },
    {
      label: 'Emergency Help',
      icon: ShieldAlert,
      to: '/patient/emergency',
      badge: '24/7',
      isEmergency: true,
    },
  ];

  const utilityItems = [
    { label: 'Account Settings', icon: Settings, to: '/patient/settings' },
  ];

  /* ─── Sidebar content (matching Doctor & Admin) ────────── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-100 shrink-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#0EA5C9] shadow-sm">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[17px] font-extrabold text-slate-900 tracking-tight font-sans">
            MediFlow
          </span>
          <span className="text-[10px] font-semibold text-[#0EA5C9] tracking-widest uppercase">
            Patient Portal
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2.5">
            Menu
          </p>
          <ul className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);

              return (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                      active
                        ? 'bg-[#E0F4F9] text-[#0B7EA0] font-bold shadow-xs'
                        : item.isEmergency
                        ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className="shrink-0"
                      style={{
                        width: 18,
                        height: 18,
                        color: active ? ACCENT : item.isEmergency ? '#E11D48' : undefined,
                      }}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-md">
                        {item.badge}
                      </span>
                    )}
                    {active && !item.badge && (
                      <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#0B7EA0]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Emergency Assistance Callout in Sidebar Bottom */}
      <div className="px-3 py-2">
        <div className="p-3 bg-gradient-to-br from-rose-50/80 to-amber-50/60 border border-rose-100 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[11px] font-bold text-rose-900">24/7 Medical Care</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Urgent medical questions or immediate ambulance support
          </p>
          <a
            href="tel:+11235565523"
            className="mt-2.5 flex items-center justify-center gap-1.5 w-full bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Phone className="w-3 h-3 text-rose-600" />
            <span>+1-123-556-5523</span>
          </a>
        </div>
      </div>

      {/* Settings at bottom */}
      <div className="border-t border-slate-100 px-3 py-3 space-y-0.5 shrink-0">
        {utilityItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                active
                  ? 'bg-[#E0F4F9] text-[#0B7EA0] font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                className="shrink-0"
                style={{ width: 18, height: 18, color: active ? ACCENT : undefined }}
              />
              {item.label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#0B7EA0]" />}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F4F6FB] overflow-hidden">
      {/* ── DESKTOP SIDEBAR ──────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 bg-white border-r border-slate-100 shrink-0 z-30">
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR DRAWER ────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed top-0 left-0 h-full w-60 bg-white shadow-2xl z-50 lg:hidden flex flex-col"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT AREA ────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* ── TOP BAR (Consistent with Doctor & Admin) ─────── */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 sm:px-6 gap-3 sm:gap-4 shrink-0 z-20">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Greeting */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl sm:text-2xl" role="img" aria-label="wave">👋</span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              Hello, {firstName}!
            </h1>
          </div>

          {/* Quick Book Appointment CTA in Navbar */}
          <Link
            to="/patient/book-appointment"
            className="hidden md:inline-flex items-center gap-1.5 bg-[#0EA5C9] hover:bg-[#0B7EA0] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Book Visit</span>
          </Link>

          {/* Global Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-xl px-3.5 py-2 w-48 xl:w-56 text-left transition-all group shadow-xs"
            title="Search doctors, appointments, records (Ctrl+K)"
          >
            <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors min-w-0">
              <Search className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-[#0EA5C9] transition-colors" />
              <span className="text-xs font-medium truncate">Search anything…</span>
            </div>
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs shrink-0">
              Ctrl K
            </kbd>
          </button>

          {/* Notification Bell */}
          <div className="shrink-0">
            <NotificationBell />
          </div>

          {/* User avatar + single clean dropdown (contains Profile + Sign Out) */}
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
            >
              {/* Avatar: photo or initials */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0EA5C9] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left min-w-0">
                <span className="text-[13px] font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                  {fullName}
                </span>
                <span className="text-[11px] text-slate-400 leading-tight truncate max-w-[120px]">
                  Patient Portal
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{email}</p>
                  </div>
                  <div className="p-1 border-b border-slate-100">
                    <Link
                      to="/patient/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Account & Medical Settings
                    </Link>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* ── PAGE CONTENT ─────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Command Palette / Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default PatientLayout;

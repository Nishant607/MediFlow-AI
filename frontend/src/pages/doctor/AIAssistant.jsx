import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, ShieldCheck, Activity, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import ChatWindow from '../../components/ai/ChatWindow';

const DoctorAIAssistantPage = () => {
  const { currentUser } = useAuth();
  const isApproved = currentUser?.doctor_profile?.is_approved;

  return (
    <DoctorLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">

        {/* ── Page Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Clinical AI Assistant
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E0F4F9] text-[#0B7EA0] border border-[#BAE6FD]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5C9] animate-pulse" />
                Live Assistant
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              AI-assisted clinical reference, drug interactions, MediFlow protocols &amp; policy guidance
            </p>
          </div>
        </div>

        {/* ── 3 Stat Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                AI Knowledge Base
              </p>
              <p className="text-2xl font-extrabold text-slate-800">Active</p>
              <p className="text-xs text-slate-400 mt-1">Indexed clinical docs</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#E0F4F9] flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-[#0EA5C9]" />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Reference Security
              </p>
              <p className="text-2xl font-extrabold text-slate-800">Encrypted</p>
              <p className="text-xs text-slate-400 mt-1">Role-scoped doctor session</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Protocol Alignment
              </p>
              <p className="text-2xl font-extrabold text-slate-800">100%</p>
              <p className="text-xs text-slate-400 mt-1">Hospital guidelines verified</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
          </motion.div>
        </div>

        {/* ── Quick Prompts Guideline Banner ───────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-[#0EA5C9] shrink-0" />
            <span>
              <strong>Clinical Assistant Tip:</strong> Ask questions about hospital admission guidelines, emergency transfer procedures, or policy documentation below.
            </span>
          </div>
        </div>

        {/* ── Chat Window Container ────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <ChatWindow />
        </div>

      </div>
    </DoctorLayout>
  );
};

export default DoctorAIAssistantPage;

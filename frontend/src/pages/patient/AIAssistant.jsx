import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Sparkles, ArrowLeft } from 'lucide-react';
import PageWrapper from '../../components/common/PageWrapper';
import ChatWindow from '../../components/ai/ChatWindow';

const PatientAIAssistant = () => {
  return (
    <PageWrapper className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
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
              <span className="text-[#005A9C]">AI Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#005A9C]/10 border border-[#005A9C]/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#005A9C]" />
              </span>
              <span>AI Patient Information Assistant</span>
            </h1>
            <div className="w-8 h-1 rounded-full bg-[#005A9C] mt-2" />
            <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#005A9C] flex-shrink-0" />
              Ask about MediFlow policies, visiting hours, insurance, and department info.
            </p>
          </div>
          <Link
            to="/patient/dashboard"
            className="self-start sm:self-auto inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div>

        {/* Chat Window Component */}
        <ChatWindow />
      </div>
    </PageWrapper>
  );
};

export default PatientAIAssistant;

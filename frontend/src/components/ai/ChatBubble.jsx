import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Bot, AlertOctagon } from 'lucide-react';

const EMERGENCY_RESPONSE =
  'This may be a medical emergency. Please call your local emergency number ' +
  'or go to the nearest emergency room immediately. If you are in emotional distress, please ' +
  'reach out to a crisis helpline or a trusted person right away.';

const ChatBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const isEmergency =
    !isUser && message.content && message.content.trim() === EMERGENCY_RESPONSE.trim();
  const timeString = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} my-2.5`}
    >
      <div
        className={`max-w-xl px-4 sm:px-5 py-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-[#005A9C] text-white rounded-br-sm'
            : isEmergency
            ? 'bg-rose-50 text-rose-950 border-2 border-rose-300 rounded-bl-sm shadow-clinic'
            : 'bg-white text-slate-800 border border-slate-200/90 shadow-clinic rounded-bl-sm'
        }`}
      >
        <div className={`font-semibold text-[11px] mb-1.5 flex items-center gap-1.5 font-display ${
          isUser ? 'text-white/80' : 'text-[#005A9C]'
        }`}>
          {isUser ? (
            <>
              <User className="w-3.5 h-3.5" />
              You
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5 text-[#005A9C]" />
              MediFlow AI Assistant
            </>
          )}
        </div>
        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        {isEmergency && (
          <div className="mt-3.5">
            <Link
              to="/patient/emergency"
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow"
            >
              <AlertOctagon className="w-4 h-4" />
              View Emergency Contacts
            </Link>
          </div>
        )}
      </div>
      {timeString && (
        <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">{timeString}</span>
      )}
    </motion.div>
  );
};

export default ChatBubble;

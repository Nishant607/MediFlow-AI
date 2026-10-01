import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertTriangle, Sparkles, Bot, AlertCircle } from 'lucide-react';
import { getMessageHistory, sendMessage } from '../../api/aiAssistantApi';
import ChatBubble from './ChatBubble';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const data = await getMessageHistory();
        const list = Array.isArray(data) ? data : data.results || [];
        setMessages(list);
      } catch (err) {
        console.error('Failed to fetch message history', err);
        setError('Failed to load message history.');
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput('');
    setError('');

    const optimisticUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setIsSending(true);

    try {
      const response = await sendMessage(userText);
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message', err);
      const errorMsg = err.response?.status === 429
        ? 'Too many requests. Please wait a minute before sending another message.'
        : err.response?.data?.detail || err.response?.data?.message || 'Failed to send message. Please try again.';
      setError(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white border border-slate-200/90 rounded-2xl shadow-clinic-md overflow-hidden">
      {/* Persistent Non-Dismissible Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200 p-3.5 text-amber-900 text-xs flex items-start sm:items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
        <div className="leading-snug">
          <span className="font-bold text-amber-900 mr-1.5 font-display">Notice:</span>
          <span>
            This AI assistant provides general MediFlow hospital information only. It cannot diagnose conditions
            or replace professional medical advice. In an emergency, call emergency services immediately.
          </span>
        </div>
      </div>

      {/* Message List Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-[#F8FAFC]">
        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-xs gap-3">
            <div className="w-6 h-6 border-2 border-[#005A9C]/30 border-t-[#005A9C] rounded-full animate-spin" />
            <span>Loading message history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-16 space-y-3 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005A9C] mx-auto shadow-sm">
              <Bot className="w-7 h-7" />
            </div>
            <p className="font-bold text-slate-800 font-display text-base">Welcome to MediFlow AI Assistant</p>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Ask any question about MediFlow visiting hours, appointment policies, insurance coverage, or department guidelines.
            </p>
          </div>
        ) : (
          messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
        )}

        {isSending && (
          <div className="flex flex-col items-start my-2">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-slate-200 flex items-center gap-2 text-xs text-slate-600 shadow-sm"
            >
              <Bot className="w-3.5 h-3.5 text-[#005A9C]" />
              <span className="text-slate-500 mr-1">AI Assistant is typing</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#005A9C] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-[#005A9C] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-[#005A9C] rounded-full animate-bounce" />
              </div>
            </motion.div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs mt-2 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex gap-2.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question here (e.g. What are the visiting hours?)..."
          disabled={isSending}
          maxLength={1000}
          className="flex-1 bg-slate-50 text-slate-800 placeholder-slate-400 px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/15 transition-all disabled:opacity-50"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSending || !input.trim()}
          className="bg-[#005A9C] hover:bg-[#00477D] disabled:opacity-50 text-white px-5 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow flex items-center gap-2"
        >
          {isSending ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default ChatWindow;

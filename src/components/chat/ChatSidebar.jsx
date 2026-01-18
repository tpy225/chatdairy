import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { ArrowRight, MessageCircle, Sparkles, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import AISettings from '../settings/AISettings';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatSidebar() {
  const { messages, isTyping, sendMessage, triggerAIResponse, currentPersona } = useAI();
  const [inputValue, setInputValue] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleTriggerAI = async () => {
    if (isTyping) return;
    await triggerAIResponse();
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Persona Indicator */}
      <div className="px-4 py-2 bg-cream-50 border-b border-cream-100 flex justify-center sticky top-0 z-10 shadow-sm">
         <div 
           className="bg-cream-100/50 px-3 py-1 rounded-full text-xs text-cream-600 flex items-center gap-1.5 cursor-pointer hover:bg-cream-100 transition-colors"
           onClick={() => setIsSettingsOpen(true)}
         >
           <Sparkles size={12} />
           <span className="font-medium text-cream-900">{currentPersona.name}</span>
         </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-cream-50/30">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex w-full",
              msg.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
              msg.sender === 'user' 
                ? "bg-cream-900 text-white rounded-tr-none" 
                : "bg-white text-cream-900 border border-cream-100 rounded-tl-none"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-none border border-cream-100 shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-cream-400 rounded-full typing-dot" />
                <span className="w-1.5 h-1.5 bg-cream-400 rounded-full typing-dot" />
                <span className="w-1.5 h-1.5 bg-cream-400 rounded-full typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-cream-200">
        <div className="relative">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..." 
            className="w-full pl-4 pr-20 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-200 text-sm transition-all"
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-1.5 text-cream-400 hover:text-cream-900 hover:bg-cream-200 rounded-lg transition-all disabled:opacity-50"
              title="Send"
            >
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={handleTriggerAI}
              disabled={isTyping || messages.length === 0}
              className="p-1.5 text-cream-900 bg-cream-200 hover:bg-cream-300 rounded-lg transition-all disabled:opacity-50 disabled:bg-cream-100"
              title="Reply"
            >
              <MessageCircle size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-cream-100">
                <h3 className="text-lg font-bold text-cream-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-cream-400" />
                  AI Persona Settings
                </h3>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 text-cream-400 hover:bg-cream-50 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <AISettings />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

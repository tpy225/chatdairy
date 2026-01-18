import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Delete",
  cancelText = "Cancel",
  isDangerous = false
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 border border-cream-100"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-full ${isDangerous ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold text-cream-900">{title}</h3>
              </div>
              
              <p className="text-cream-900/70 leading-relaxed mb-6 ml-14">
                {message}
              </p>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-cream-700 font-medium hover:bg-cream-50 transition-colors"
                >
                  {cancelText}
                </button>
                <button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`px-4 py-2 rounded-xl text-white font-medium shadow-sm transition-colors ${
                    isDangerous 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-cream-900 hover:bg-cream-800'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-cream-400 hover:text-cream-900 hover:bg-cream-50 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
import { 
  Settings2, Save, Plus, Trash2, Check, User, Sparkles
} from 'lucide-react';
import { useAI } from '../../context/AIContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../ui/ConfirmDialog';

const AISettings = () => {
  const { 
    personas, currentPersonaId, setCurrentPersonaId, 
    addPersona, updatePersona, deletePersona 
  } = useAI();
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', description: '', replyStyle: 'warm', customPrompt: '',
    diarySettings: { wordCount: '300', style: 'Personal', prompts: { hide_ai: '', keep_chat: '' } }
  });

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    setPersonaToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (personaToDelete) {
      deletePersona(personaToDelete);
      setPersonaToDelete(null);
      if (editingId === personaToDelete) {
        setEditingId(null);
      }
    }
  };

  const handleEdit = (persona) => {
    setEditingId(persona.id);
    setEditForm({
      name: persona.name,
      description: persona.description,
      replyStyle: persona.replyStyle,
      customPrompt: persona.customPrompt,
      diarySettings: persona.diarySettings || {
         wordCount: '300',
         style: 'Personal',
         prompts: {
             hide_ai: 'You are a professional diary writer...',
             keep_chat: 'You are an AI assistant summarizing a conversation...'
         }
      }
    });
  };

  const handleSave = () => {
    if (editingId === 'new') {
      addPersona(editForm);
    } else {
      updatePersona(editingId, editForm);
    }
    setEditingId(null);
  };

  const isEditingDefault = personas.find(p => p.id === editingId)?.isDefault;

  const handleAddNew = () => {
    setEditingId('new');
    setEditForm({
      name: 'New Persona',
      description: '',
      replyStyle: 'warm',
      customPrompt: '',
      diarySettings: {
        wordCount: '300',
        style: 'Personal',
        prompts: {
            hide_ai: 'You are a professional diary writer. Write a personal diary entry based on the user\'s conversation history. Write in first-person perspective as if YOU are the user.',
            keep_chat: 'You are an AI assistant summarizing a conversation. Create a structured log of the discussion.'
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 h-full overflow-y-auto custom-scrollbar">
      <ConfirmDialog 
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Persona"
        message="Are you sure you want to delete this AI Persona? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-cream-900 flex items-center gap-2">
          <Settings2 className="text-cream-900" />
          AI Persona Settings
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {editingId ? (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 overflow-hidden"
          >
            <div>
              <label className="block text-sm font-medium text-cream-900 mb-1">Name</label>
              <input 
                value={editForm.name}
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                className="w-full p-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream-900 mb-1">Description</label>
              <input 
                value={editForm.description}
                onChange={e => setEditForm({...editForm, description: e.target.value})}
                disabled={isEditingDefault}
                className={cn(
                  "w-full p-3 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300",
                  isEditingDefault ? "bg-cream-100 text-cream-500 cursor-not-allowed" : "bg-cream-50"
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream-900 mb-1">Reply Style</label>
              <select 
                value={editForm.replyStyle}
                onChange={e => setEditForm({...editForm, replyStyle: e.target.value})}
                className="w-full p-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300"
              >
                <option value="warm">Warm & Supportive</option>
                <option value="analytical">Analytical & Objective</option>
                <option value="concise">Concise & Direct</option>
                <option value="humorous">Humorous & Playful</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-cream-900 mb-1">Custom Prompt</label>
              <textarea 
                value={editForm.customPrompt}
                onChange={e => setEditForm({...editForm, customPrompt: e.target.value})}
                disabled={isEditingDefault}
                rows={6}
                className={cn(
                  "w-full p-3 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300 resize-none",
                  isEditingDefault ? "bg-cream-100 text-cream-500 cursor-not-allowed" : "bg-cream-50"
                )}
                placeholder="Describe how the AI should behave..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              {!personas.find(p => p.id === editingId)?.isDefault && (
                <button 
                  onClick={() => handleDeleteClick(editingId)}
                  className="px-4 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete Persona"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button 
                onClick={() => setEditingId(null)}
                className="flex-1 py-3 rounded-xl border border-cream-200 text-cream-900 hover:bg-cream-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-cream-900 text-white hover:bg-cream-800 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Persona
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {personas.map(persona => (
              <div 
                key={persona.id}
                onClick={() => setCurrentPersonaId(persona.id)}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all relative group",
                  currentPersonaId === persona.id 
                    ? "bg-cream-900 text-white border-cream-900 shadow-lg scale-[1.02]" 
                    : "bg-white border-cream-200 hover:border-cream-300 hover:shadow-md text-cream-900"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <User size={18} className={currentPersonaId === persona.id ? "text-cream-200" : "text-cream-400"} />
                    <h3 className="font-bold">{persona.name}</h3>
                  </div>
                  {currentPersonaId === persona.id && <Check size={18} className="text-green-400" />}
                </div>
                <p className={cn("text-sm mb-3", currentPersonaId === persona.id ? "text-cream-100" : "text-cream-600")}>
                  {persona.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-md capitalize",
                    currentPersonaId === persona.id ? "bg-white/20" : "bg-cream-100 text-cream-700"
                  )}>
                    {persona.replyStyle}
                  </span>
                </div>
                
                <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(persona); }}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      currentPersonaId === persona.id ? "hover:bg-white/20 text-white" : "hover:bg-cream-100 text-cream-600"
                    )}
                  >
                    <Settings2 size={14} />
                  </button>
                  {!persona.isDefault && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(persona.id); }}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        currentPersonaId === persona.id ? "hover:bg-red-500/50 text-white" : "hover:bg-red-100 text-red-500"
                      )}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button 
              onClick={handleAddNew}
              className="w-full py-4 border-2 border-dashed border-cream-200 rounded-xl text-cream-400 hover:text-cream-900 hover:border-cream-400 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={20} />
              Create New Persona
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AISettings;
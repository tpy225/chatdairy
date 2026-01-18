import React, { useState, useRef } from 'react';
import { 
  Settings2, Save, X, Plus, Trash2, Check, User, Server, Globe, 
  Settings, Sparkles, Key, Database, Download, Upload, RefreshCw
} from 'lucide-react';
import { useAI } from '../context/AIContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import AISettings from '../components/settings/AISettings';

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com' },
  { id: 'google', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com' },
  { id: 'custom', name: 'Custom / Local', baseUrl: '' }
];

const ApiSettings = () => {
  const { 
    apiConfigs, currentApiConfigId, setCurrentApiConfigId,
    addApiConfig, updateApiConfig, deleteApiConfig, fetchModels
  } = useAI();

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', provider: 'openai', apiKey: '', baseUrl: 'https://api.openai.com/v1', model: 'gpt-3.5-turbo'
  });
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const handleEdit = (config) => {
    setEditingId(config.id);
    setEditForm({
      name: config.name,
      provider: config.provider || (config.type === 'official' ? 'openai' : 'custom'), // Fallback for old data
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model || 'gpt-3.5-turbo'
    });
    setAvailableModels([]); // Reset models on edit
  };

  const handleSave = () => {
    const providerConfig = PROVIDERS.find(p => p.id === editForm.provider);
    const finalBaseUrl = editForm.provider === 'custom' ? editForm.baseUrl : providerConfig.baseUrl;

    const configData = {
      ...editForm,
      type: editForm.provider === 'custom' ? 'custom' : 'official', // Maintain backward compatibility or simplify
      baseUrl: finalBaseUrl
    };

    if (editingId === 'new') {
      addApiConfig(configData);
    } else {
      updateApiConfig(editingId, configData);
    }
    setEditingId(null);
  };

  const handleAddNew = () => {
    setEditingId('new');
    setEditForm({
      name: 'New API Config',
      provider: 'openai',
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo'
    });
    setAvailableModels([]);
  };

  const handleProviderChange = (e) => {
    const newProviderId = e.target.value;
    const providerConfig = PROVIDERS.find(p => p.id === newProviderId);
    setEditForm({
      ...editForm,
      provider: newProviderId,
      baseUrl: providerConfig.id === 'custom' ? '' : providerConfig.baseUrl,
      name: editingId === 'new' ? providerConfig.name : editForm.name
    });
  };

  const handleFetchModels = async () => {
    if (!editForm.apiKey) {
      alert('Please enter an API Key first.');
      return;
    }
    setIsLoadingModels(true);
    try {
      const models = await fetchModels({
        baseUrl: editForm.baseUrl,
        apiKey: editForm.apiKey,
        provider: editForm.provider
      });
      setAvailableModels(models);
      if (models.length > 0) {
        setEditForm(prev => ({ ...prev, model: models[0].id }));
      }
    } catch (error) {
      alert(`Failed to fetch models: ${error.message}`);
    } finally {
      setIsLoadingModels(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-cream-900 flex items-center gap-2">
          <Server className="text-cream-900" />
          API Configuration
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
              <label className="block text-sm font-medium text-cream-900 mb-1">Config Name</label>
              <input 
                value={editForm.name}
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                className="w-full p-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300"
                placeholder="e.g. My API"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-900 mb-1">Provider</label>
              <select
                value={editForm.provider}
                onChange={handleProviderChange}
                className="w-full p-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300"
              >
                {PROVIDERS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-900 mb-1">API Key</label>
              <input 
                type="password"
                value={editForm.apiKey}
                onChange={e => setEditForm({...editForm, apiKey: e.target.value})}
                className="w-full p-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300"
                placeholder="sk-..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-900 mb-1">Base URL</label>
              <input 
                value={editForm.baseUrl}
                onChange={e => setEditForm({...editForm, baseUrl: e.target.value})}
                disabled={editForm.provider !== 'custom'}
                className={cn(
                  "w-full p-3 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300",
                  editForm.provider !== 'custom' ? "bg-cream-100 text-cream-400 cursor-not-allowed" : "bg-cream-50"
                )}
                placeholder="https://api.openai.com/v1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-900 mb-1">Model</label>
              <div className="flex gap-2">
                {availableModels.length > 0 ? (
                  <select
                    value={editForm.model}
                    onChange={e => setEditForm({...editForm, model: e.target.value})}
                    className="flex-1 p-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300"
                  >
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>{model.id}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    value={editForm.model}
                    onChange={e => setEditForm({...editForm, model: e.target.value})}
                    className="flex-1 p-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300"
                    placeholder="e.g. gpt-3.5-turbo"
                  />
                )}
                <button
                  onClick={handleFetchModels}
                  disabled={isLoadingModels || !editForm.apiKey}
                  className="px-4 py-2 bg-cream-100 text-cream-900 rounded-xl hover:bg-cream-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Fetch Models"
                >
                  <RefreshCw size={18} className={isLoadingModels ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">Fetch</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {!apiConfigs.find(c => c.id === editingId)?.isDefault && (
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this configuration?')) {
                      deleteApiConfig(editingId);
                      setEditingId(null);
                    }
                  }}
                  className="px-4 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete Configuration"
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
                Save Config
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
            {apiConfigs.map(config => (
              <div 
                key={config.id}
                onClick={() => setCurrentApiConfigId(config.id)}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all relative group",
                  currentApiConfigId === config.id 
                    ? "bg-cream-900 text-white border-cream-900 shadow-lg scale-[1.02]" 
                    : "bg-white border-cream-200 hover:border-cream-300 hover:shadow-md text-cream-900"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className={currentApiConfigId === config.id ? "text-cream-200" : "text-cream-400"} />
                    <h3 className="font-bold">{config.name}</h3>
                  </div>
                  {currentApiConfigId === config.id && <Check size={18} className="text-green-400" />}
                </div>
                <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded-md uppercase font-bold tracking-wider",
                    currentApiConfigId === config.id ? "bg-white/20" : "bg-cream-100 text-cream-600"
                  )}>
                    {config.type}
                  </span>
                  <span className="truncate max-w-[200px]">{config.baseUrl}</span>
                </div>
                
                <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(config); }}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      currentApiConfigId === config.id ? "hover:bg-white/20 text-white" : "hover:bg-cream-100 text-cream-600"
                    )}
                  >
                    <Settings2 size={14} />
                  </button>
                  {!config.isDefault && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteApiConfig(config.id); }}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        currentApiConfigId === config.id ? "hover:bg-red-500/50 text-white" : "hover:bg-red-100 text-red-500"
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
              Add API Configuration
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DataSettings = () => {
  const fileInputRef = useRef(null);

  const handleExportBackup = () => {
    const data = {
      diaries: JSON.parse(localStorage.getItem('chatdairy-entries') || '[]'),
      personas: JSON.parse(localStorage.getItem('ai_personas') || '[]'),
      apiConfigs: JSON.parse(localStorage.getItem('ai_api_configs') || '[]'),
      settings: {
        currentPersonaId: localStorage.getItem('ai_current_persona_id'),
        currentApiConfigId: localStorage.getItem('ai_current_api_config_id')
      },
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatdairy-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm('Importing data will overwrite your current diaries, personas, and settings. Are you sure you want to proceed?')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          if (data.diaries) localStorage.setItem('chatdairy-entries', JSON.stringify(data.diaries));
          if (data.personas) localStorage.setItem('ai_personas', JSON.stringify(data.personas));
          if (data.apiConfigs) localStorage.setItem('ai_api_configs', JSON.stringify(data.apiConfigs));
          if (data.settings?.currentPersonaId) localStorage.setItem('ai_current_persona_id', data.settings.currentPersonaId);
          if (data.settings?.currentApiConfigId) localStorage.setItem('ai_current_api_config_id', data.settings.currentApiConfigId);

          alert('Data imported successfully! The app will now reload.');
          window.location.reload();
        } catch (error) {
          console.error('Import error:', error);
          alert('Failed to import data. Invalid file format.');
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-cream-900 text-white flex items-center justify-center shadow-md">
          <Database size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-cream-900">Data Management</h2>
          <p className="text-sm text-cream-500">Backup and export your data</p>
        </div>
      </div>

      <div className="bg-cream-50/50 rounded-2xl p-6 border border-cream-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-cream-900">Export Backup</h3>
            <p className="text-sm text-cream-500 mt-1">
              Download a JSON file containing all your diaries, settings, and personas.
            </p>
          </div>
          <button 
            onClick={handleExportBackup}
            className="px-4 py-2 bg-cream-100 text-cream-900 rounded-xl hover:bg-cream-200 transition-colors flex items-center gap-2 font-medium border border-cream-200"
          >
            <Download size={18} />
            Export Data
          </button>
        </div>

        <div className="h-px bg-cream-200/50" />

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-cream-900">Import Data</h3>
            <p className="text-sm text-cream-500 mt-1">
              Restore your data from a backup file. <span className="text-red-500 font-medium">Warning: This will overwrite current data.</span>
            </p>
          </div>
          <button 
            onClick={handleImportClick}
            className="px-4 py-2 bg-cream-100 text-cream-900 rounded-xl hover:bg-cream-200 transition-colors flex items-center gap-2 font-medium border border-cream-200"
          >
            <Upload size={18} />
            Import Data
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  return (
    <div className="p-4 h-full overflow-y-auto custom-scrollbar pb-20">
      <h1 className="text-2xl font-bold text-cream-900 mb-6">Settings</h1>
      
      <div className="space-y-8 max-w-3xl">
        <ApiSettings />
        <AISettings />
        <DataSettings />
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Trash2, Clock, Zap, Loader2, Save, X } from 'lucide-react';
import { ShiftConfig } from '../types';
import { supabase } from '../lib/supabase';

interface ShiftManagerProps {
  configs: ShiftConfig[];
  onUpdate: () => void;
}

export const ShiftManager: React.FC<ShiftManagerProps> = ({ configs, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newConfig, setNewConfig] = useState({ code: '', start_time: '08:00', end_time: '16:00' });

  const handleAdd = async () => {
    if (!newConfig.code) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('shift_configs').insert([newConfig]);
      if (error) throw error;
      setNewConfig({ code: '', start_time: '08:00', end_time: '16:00' });
      setIsAdding(false);
      onUpdate();
    } catch (err) {
      alert("Errore nel salvataggio del turno.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questa configurazione?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('shift_configs').delete().eq('id', id);
      if (error) throw error;
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-500" /> Database Turni Interno
        </h4>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {isAdding && (
        <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-100 space-y-4 animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-emerald-700 uppercase">Codice</label>
              <input 
                type="text" 
                placeholder="es. 402"
                value={newConfig.code}
                onChange={e => setNewConfig({...newConfig, code: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm font-bold uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-emerald-700 uppercase">Inizio</label>
              <input 
                type="time" 
                value={newConfig.start_time}
                onChange={e => setNewConfig({...newConfig, start_time: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-emerald-700 uppercase">Fine</label>
              <input 
                type="time" 
                value={newConfig.end_time}
                onChange={e => setNewConfig({...newConfig, end_time: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={handleAdd}
            className="w-full bg-emerald-600 text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salva Configurazione</>}
          </button>
        </div>
      )}

      <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {configs.length === 0 && !isAdding && (
          <p className="text-xs text-slate-400 italic text-center py-8">Nessun turno personalizzato salvato.</p>
        )}
        {configs.map(config => (
          <div key={config.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm group">
            <div className="flex items-center gap-4">
              <span className="font-black text-slate-700 w-12">{config.code}</span>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                <Clock className="w-3 h-3" />
                {config.start_time} - {config.end_time}
              </div>
            </div>
            <button 
              onClick={() => handleDelete(config.id)}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

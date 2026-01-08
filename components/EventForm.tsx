
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Zap, Loader2, Clock, AlertCircle } from 'lucide-react';
import { CalendarEvent, ShiftConfig } from '../types';
import { DEFAULT_SHIFT_MAPPINGS } from '../lib/shiftMappings';
import { getCategoryColor } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface EventFormProps {
  initialData: Partial<CalendarEvent>;
  onSubmit: (data: any) => Promise<void>;
  isProcessing?: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({ initialData, onSubmit, isProcessing = false }) => {
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [shiftCode, setShiftCode] = useState('');
  const [isSingleTime, setIsSingleTime] = useState(false);
  const [dbConfigs, setDbConfigs] = useState<ShiftConfig[]>([]);
  
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    start: initialData.start ? format(new Date(initialData.start), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end: initialData.end ? format(new Date(initialData.end), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    category: initialData.category || 'work'
  });

  useEffect(() => {
    const fetchConfigs = async () => {
      const { data } = await supabase.from('shift_configs').select('*');
      if (data) setDbConfigs(data);
    };
    fetchConfigs();

    if (initialData.start && initialData.end && initialData.start === initialData.end) {
      setIsSingleTime(true);
    }

    if (initialData.category === 'shift' && initialData.title) {
      const title = initialData.title.toUpperCase();
      let code = '';
      if (title.includes('RIPOSO')) code = 'RIP';
      else if (title.includes('FNL')) code = 'FNL';
      else if (title.includes('FERIE')) code = 'FER';
      else if (title.includes('MALATTIA')) code = 'MAL';
      else {
        const match = title.match(/\d+/);
        if (match) code = match[0];
      }
      setShiftCode(code);
    }
  }, [initialData]);

  const isLoading = localSubmitting || isProcessing;
  const themeColor = getCategoryColor(formData.category);

  const getAllMappings = () => {
    const merged = { ...DEFAULT_SHIFT_MAPPINGS };
    dbConfigs.forEach(c => {
      merged[c.code.toUpperCase()] = { start: c.start_time, end: c.end_time };
    });
    return merged;
  };

  const applyShiftMapping = (code: string, currentStartTime: string) => {
    const upperCode = code.toUpperCase().trim();
    const mappings = getAllMappings();
    const mapping = mappings[upperCode];
    
    if (upperCode in mappings) {
      setIsSingleTime(false);
      let autoTitle = `Turno ${upperCode}`;
      if (upperCode === 'RIP') autoTitle = 'RIPOSO';
      else if (upperCode === 'FNL') autoTitle = 'FNL';
      else if (upperCode === 'FERIE' || upperCode === 'FER') autoTitle = 'FERIE';
      else if (upperCode === 'MALATTIA' || upperCode === 'MAL') autoTitle = 'MALATTIA';

      let newStart = currentStartTime;
      let newEnd = formData.end;

      if (mapping) {
        const baseDate = new Date(currentStartTime);
        const [startH, startM] = mapping.start.split(':').map(Number);
        const sDate = new Date(baseDate);
        sDate.setHours(startH, startM, 0, 0);
        newStart = format(sDate, "yyyy-MM-dd'T'HH:mm");
        
        const [endH, endM] = mapping.end.split(':').map(Number);
        let eDate = new Date(baseDate);
        eDate.setHours(endH, endM, 0, 0);
        if (eDate < sDate) eDate.setDate(eDate.getDate() + 1);
        newEnd = format(eDate, "yyyy-MM-dd'T'HH:mm");
      }

      setFormData(prev => ({ 
        ...prev, 
        title: autoTitle, 
        start: newStart, 
        end: newEnd, 
        category: 'shift' 
      }));
    }
  };

  const handleShiftCodeChange = (code: string) => {
    const upperCode = code.toUpperCase().trim();
    setShiftCode(upperCode);
    if (!upperCode) {
      setFormData(prev => ({ ...prev, category: 'work' }));
      return;
    }
    applyShiftMapping(upperCode, formData.start);
  };

  const activeMapping = shiftCode ? getAllMappings()[shiftCode.toUpperCase()] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalSubmitting(true);
    try {
      const finalEnd = isSingleTime ? formData.start : formData.end;
      await onSubmit({ 
        ...formData, 
        color: getCategoryColor(formData.category),
        start: new Date(formData.start).toISOString(), 
        end: new Date(finalEnd).toISOString() 
      });
    } finally {
      setLocalSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-[9px] font-black text-indigo-500 uppercase px-1">Titolo</label>
        <input 
          type="text" 
          value={formData.title} 
          placeholder="Evento..."
          onChange={e => setFormData({ ...formData, title: e.target.value, category: 'work' })}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold" 
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black text-emerald-500 uppercase px-1 flex items-center gap-1">
          <Zap className="w-3 h-3 fill-emerald-500" /> Caricamento Turno
        </label>
        <div className="relative">
          <input 
            type="text" 
            placeholder="es. 401, RIP, FNL..." 
            value={shiftCode} 
            onChange={e => handleShiftCodeChange(e.target.value)} 
            className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl focus:border-emerald-500 outline-none font-black text-emerald-700 uppercase"
            disabled={isLoading}
          />
          {activeMapping && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1">
              <Clock className="w-3 h-3" /> {activeMapping.start}-{activeMapping.end}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[8px] font-bold text-slate-400 uppercase">Inizio</label>
          <input 
            required 
            type="datetime-local" 
            value={formData.start} 
            onChange={e => {
              setFormData(prev => ({ ...prev, start: e.target.value }));
              if (shiftCode) applyShiftMapping(shiftCode, e.target.value);
            }} 
            className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold" 
            disabled={isLoading} 
          />
        </div>
        {!isSingleTime && (
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-slate-400 uppercase">Fine</label>
            <input 
              required 
              type="datetime-local" 
              value={formData.end} 
              onChange={e => setFormData({ ...formData, end: e.target.value })} 
              className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold" 
              disabled={isLoading} 
            />
          </div>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isLoading} 
        style={{ backgroundColor: themeColor }}
        className="w-full text-white font-black py-3.5 rounded-xl shadow-md active:scale-95 flex items-center justify-center gap-2 mt-2"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salva'}
      </button>
    </form>
  );
};


import React, { useState } from 'react';
import { Calendar as CalendarIcon, Cloud, Plus, Sparkles, MessageSquare, RefreshCcw, AlertCircle, Search, User } from 'lucide-react';
import { CalendarEvent } from '../types';

interface SidebarProps {
  loading: boolean;
  dbError: string | null;
  dailyInsight: string;
  upcomingEvents: CalendarEvent[];
  onNewEvent: () => void;
  onSmartAdd: () => void;
  onEventClick: (event: CalendarEvent) => void;
  onEmployeeSearch: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  loading, dbError, dailyInsight, upcomingEvents, onNewEvent, onSmartAdd, onEventClick, onEmployeeSearch 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onEmployeeSearch(searchTerm);
  };

  return (
    <aside className="w-full lg:w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-100">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Lumina Scalo</h1>
        </div>
        <div title="Stato Cloud" className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-tighter bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
          <Cloud className="w-3 h-3" />
          <span>Sync</span>
          <div className={`w-1.5 h-1.5 rounded-full ${dbError ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Cerca Turni Dipendente</div>
        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="es. Castellacci Roberto" 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:border-indigo-500 outline-none transition-all shadow-inner"
          />
        </form>
      </div>

      {dbError && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-red-700 text-xs animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold">Errore Sincronizzazione</p>
            <p className="leading-relaxed opacity-90">{dbError}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button 
          onClick={onNewEvent}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nuovo Evento
        </button>
        <button 
          onClick={onSmartAdd}
          className="w-full bg-white border border-indigo-100 hover:border-indigo-300 text-indigo-700 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-5 h-5 text-indigo-500" /> Aggiunta Rapida AI
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <MessageSquare className="w-4 h-4" /> Briefing AI
        </div>
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl min-h-[100px] flex items-center shadow-inner">
          <p className="text-sm text-slate-600 italic leading-relaxed">
            {loading ? 'Caricamento dati...' : (dailyInsight || 'Seleziona un dipendente per vedere i suoi turni.')}
          </p>
        </div>
      </div>

      <div className="mt-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Agenda Prossima</div>
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <RefreshCcw className="w-3 h-3 animate-spin" /> Caricamento...
            </div>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <div key={event.id} className="flex gap-3 items-start group cursor-pointer" onClick={() => onEventClick(event)}>
                <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: event.color }}></div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{event.title}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(event.start))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">Nessun evento salvato.</p>
          )}
        </div>
      </div>
    </aside>
  );
};

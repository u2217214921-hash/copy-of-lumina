
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, List } from 'lucide-react';

interface CalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  viewMode: 'month' | 'week';
  onToggleView: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  currentMonth, onPrevMonth, onNextMonth, onToday, viewMode, onToggleView 
}) => {
  const monthFormatter = new Intl.DateTimeFormat('it-IT', { month: 'short', year: 'numeric' });
  const fullMonthFormatter = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' });

  return (
    <header className="h-14 border-b border-slate-100 bg-white flex items-center justify-between px-3 shrink-0 z-10">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5">
          <div className="bg-indigo-600 p-1 rounded-md">
            <CalendarIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <h1 className="text-[10px] font-black text-slate-800 tracking-tighter uppercase hidden xs:block">Lumina</h1>
        </div>

        <div className="flex items-center gap-1 overflow-hidden">
          <h2 className="text-xs font-black text-slate-700 capitalize min-w-[75px]">
            <span className="sm:hidden">{monthFormatter.format(currentMonth)}</span>
            <span className="hidden sm:inline">{fullMonthFormatter.format(currentMonth)}</span>
          </h2>
          <div className="flex bg-slate-50 rounded-lg p-0.5 border border-slate-100">
            <button onClick={onPrevMonth} className="p-1 hover:bg-white rounded-md transition-all"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
            <button onClick={onNextMonth} className="p-1 hover:bg-white rounded-md transition-all"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleView}
          className="flex items-center gap-1 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-600 uppercase"
        >
          {viewMode === 'month' ? <List className="w-3 h-3" /> : <LayoutGrid className="w-3 h-3" />}
          <span className="hidden xs:inline">{viewMode === 'month' ? 'Settimana' : 'Mese'}</span>
        </button>
        <button onClick={onToday} className="px-3 py-1.5 text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm active:scale-95">Oggi</button>
      </div>
    </header>
  );
};

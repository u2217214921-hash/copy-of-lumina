
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale/it';
import { CalendarEvent, DayData } from '../types';
import { Gift, PlaneTakeoff, Trash2, Loader2, Ticket, X } from 'lucide-react';

interface CalendarGridProps {
  days: DayData[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  deletingId?: string | null;
  viewMode?: 'month' | 'week';
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  days, selectedDate, onSelectDate, onEditEvent, onDeleteEvent, deletingId = null, viewMode = 'month' 
}) => {
  const isWeekView = viewMode === 'week';

  return (
    <div className={`calendar-grid bg-slate-200 border-l border-t border-slate-200 min-h-full ${isWeekView ? 'flex flex-col gap-0.5' : ''}`}>
      {!isWeekView && ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'].map(day => (
        <div key={day} className="bg-white py-1 text-center text-[7px] font-bold text-slate-400 uppercase border-r border-b border-slate-200 tracking-widest">
          {day}
        </div>
      ))}
      
      {days.map((day, idx) => (
        <div 
          key={idx} 
          onClick={() => onSelectDate(day.date)}
          className={`p-1.5 transition-all hover:bg-slate-50 cursor-pointer relative 
            ${isWeekView ? 'min-h-[90px] bg-white border-b border-slate-100 flex gap-3' : 'min-h-[95px] border-r border-b border-slate-100 bg-white'}
            ${!day.isCurrentMonth && !isWeekView ? 'bg-slate-50/50 opacity-40' : ''} 
            ${day.isHoliday ? 'bg-orange-50/20' : ''}`}
        >
          {/* Header del Giorno */}
          <div className={`${isWeekView ? 'flex flex-col items-center justify-center w-12 shrink-0 border-r border-slate-50 pr-2' : 'flex items-center justify-between mb-1'}`}>
            <span className={`font-black flex items-center justify-center rounded-full transition-all
              ${isWeekView ? 'text-lg text-slate-800' : 'text-[10px] w-5 h-5'}
              ${day.isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700'} 
              ${isSameDay(day.date, selectedDate) && !day.isToday ? 'bg-slate-200' : ''}`}>
              {format(day.date, 'd')}
            </span>
            <span className={`uppercase font-black text-slate-400 leading-none mt-0.5 ${isWeekView ? 'text-[8px]' : 'hidden'}`}>
              {format(day.date, 'EEE', { locale: it })}
            </span>
            {day.isHoliday && (
              <Gift className={`text-orange-500 ${isWeekView ? 'w-3 h-3 mt-1' : 'w-2.5 h-2.5'}`} />
            )}
          </div>

          {/* Contenuto Turno/Eventi */}
          <div className={`flex-1 space-y-1.5 ${isWeekView ? 'py-1' : ''}`}>
            {day.shift ? (
              <div className="relative group/shift">
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    const event = day.events.find(ev => ev.id === day.shift?.eventId);
                    if (event) onEditEvent(event);
                  }}
                  className={`p-1.5 sm:p-2 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-lg flex flex-col gap-0.5 shadow-sm transition-all hover:border-emerald-200 ${isWeekView ? 'max-w-md' : ''}`}
                >
                  <div className="flex items-center justify-between gap-1 overflow-visible">
                    <div className="flex items-center gap-1 min-w-0">
                      <PlaneTakeoff className="w-2.5 h-2.5 shrink-0 text-emerald-600" />
                      <span className={`font-black uppercase tracking-tighter whitespace-nowrap overflow-visible ${isWeekView ? 'text-[11px]' : 'text-[8px]'}`}>
                        {day.shift.label}
                      </span>
                    </div>
                    <span className={`leading-none shrink-0 ${isWeekView ? 'text-[24px]' : 'text-[18px]'}`} title="Vibe">
                      {day.shift.emoji}
                    </span>
                  </div>
                  
                  {day.shift.hasTicket && (
                    <div className="flex items-center gap-0.5 text-[7px] font-black text-emerald-700 bg-emerald-200/40 self-start px-1 rounded-sm border border-emerald-300/20">
                      <Ticket className="w-2 h-2" /> <span>TICKET</span>
                    </div>
                  )}
                </div>
                {/* Tasto elimina migliorato per mobile */}
                <button 
                  disabled={deletingId !== null}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (day.shift?.eventId) onDeleteEvent(day.shift.eventId);
                  }}
                  className={`absolute -right-1 -top-1 p-2 bg-white rounded-full shadow-md border border-slate-100 z-10 transition-all 
                    ${deletingId === day.shift?.eventId ? 'text-indigo-600 opacity-100' : 'text-slate-400 hover:text-red-500 sm:opacity-0 group-hover/shift:opacity-100'}`}
                >
                  {deletingId === day.shift?.eventId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                </button>
              </div>
            ) : (
              isWeekView && <div className="h-10 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[9px] text-slate-300 font-bold uppercase tracking-widest">Nessun Turno</div>
            )}

            {/* Altri Eventi con tasto elimina */}
            <div className="flex flex-wrap gap-1">
              {day.events.filter(ev => ev.id !== day.shift?.eventId).slice(0, isWeekView ? 5 : 1).map((event) => (
                <div 
                  key={event.id}
                  className="relative group/event max-w-full"
                >
                  <div 
                    onClick={(e) => { e.stopPropagation(); onEditEvent(event); }}
                    className="px-1.5 py-0.5 text-[7px] font-bold rounded-md truncate border-l-2 shadow-sm flex items-center gap-1.5 pr-6"
                    style={{ backgroundColor: event.color + '15', color: event.color, borderColor: event.color }}
                  >
                    <span className="truncate">{event.title}</span>
                  </div>
                  <button 
                    disabled={deletingId !== null}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEvent(event.id);
                    }}
                    className={`absolute right-0 top-0 bottom-0 px-1 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center 
                      ${deletingId === event.id ? 'opacity-100' : 'sm:opacity-0 group-hover/event:opacity-100'}`}
                  >
                    {deletingId === event.id ? <Loader2 className="w-2 h-2 animate-spin" /> : <X className="w-2 h-2" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

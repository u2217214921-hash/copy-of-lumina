
import React, { useState, useEffect, useMemo } from 'react';
import { 
  addMonths, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, 
  addDays, format, differenceInMinutes, addWeeks, startOfISOWeek, endOfISOWeek 
} from 'date-fns';
import { RefreshCcw, X, Clock, Moon, Settings2, Zap, Ticket, Thermometer } from 'lucide-react';
import { CalendarEvent, ShiftConfig } from './types';
import { fetchEvents, fetchShiftConfigs, addEvent, updateEvent, deleteEvent } from './lib/firestore'; // Importa le funzioni di Firestore
import { formatError } from './lib/utils';
import { isHoliday } from './lib/holidays';

import { CalendarHeader } from './components/CalendarHeader';
import { CalendarGrid } from './components/CalendarGrid';
import { EventForm } from './components/EventForm';
import { ShiftManager } from './components/ShiftManager';

type ViewMode = 'month' | 'week';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [shiftConfigs, setShiftConfigs] = useState<ShiftConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShiftManagerOpen, setIsShiftManagerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsData, configsData] = await Promise.all([
        fetchEvents(),
        fetchShiftConfigs(),
      ]);
      setEvents(eventsData);
      setShiftConfigs(configsData);
    } catch (err: any) {
      console.error(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const calculateShiftVibe = (start: Date, durationMinutes: number, code: string) => {
    const c = code.toUpperCase();
    if (c === 'RIP') return '🏠';
    if (c === 'FER') return '🏖️';
    if (c === 'FNL') return '♠️';
    if (c === 'MAL' || c === 'MALATTIA') return '🤒';
    
    const startHour = start.getHours();
    let timeEmoji = '☀️';
    if (startHour >= 5 && startHour < 10) timeEmoji = '🌅'; 
    else if (startHour >= 10 && startHour < 17) timeEmoji = '☀️'; 
    else if (startHour >= 17 && startHour < 21) timeEmoji = '🌆'; 
    else timeEmoji = '🧛'; 

    let durationEmoji = '⚡';
    if (durationMinutes <= 240) durationEmoji = '🍬';
    else if (durationMinutes <= 420) durationEmoji = '🏃';
    else if (durationMinutes <= 540) durationEmoji = '🐢';
    else durationEmoji = '🏔️';

    return `${timeEmoji}${durationEmoji}`;
  };

  const activeShiftsMapping = useMemo(() => {
    const mapping: Record<string, { code: string, eventId: string, start: string, end: string }> = {};
    events.forEach(event => {
      if (event.category !== 'shift') return;
      const dateKey = format(new Date(event.start), 'yyyy-MM-dd');
      const titleUpper = event.title.toUpperCase();
      let extractedCode = '';
      
      if (titleUpper.includes('RIPOSO')) extractedCode = 'RIP';
      else if (titleUpper.includes('FNL')) extractedCode = 'FNL';
      else if (titleUpper.includes('FERIE') || titleUpper.includes('FER')) extractedCode = 'FER';
      else if (titleUpper.includes('MALATTIA') || titleUpper.includes('MAL')) extractedCode = 'MAL';
      else {
        const match = event.title.match(/\d+/);
        if (match) extractedCode = match[0];
      }
      
      if (extractedCode) {
        mapping[dateKey] = { code: extractedCode, eventId: event.id, start: event.start, end: event.end };
      }
    });
    return mapping;
  }, [events]);

  const days = useMemo(() => {
    let startDate, endDate;

    if (viewMode === 'month') {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = endOfMonth(monthStart);
      startDate = addDays(monthStart, -((monthStart.getDay() + 6) % 7));
      endDate = addDays(monthEnd, (7 - monthEnd.getDay()) % 7);
    } else {
      startDate = startOfISOWeek(currentDate);
      endDate = endOfISOWeek(currentDate);
    }

    return eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const shiftInfo = activeShiftsMapping[dateKey];
      const dayEvents = events.filter(e => isSameDay(new Date(e.start), date));

      let shiftLabel = '';
      let hasTicket = false;
      let vibeEmoji = '';

      if (shiftInfo) {
        const start = new Date(shiftInfo.start);
        const end = new Date(shiftInfo.end);
        const duration = differenceInMinutes(end, start);
        hasTicket = duration > 390;
        vibeEmoji = calculateShiftVibe(start, duration, shiftInfo.code);

        if (shiftInfo.code === 'RIP') { shiftLabel = 'RIPOSO'; hasTicket = false; }
        else if (shiftInfo.code === 'FER') { shiftLabel = 'FERIE'; hasTicket = false; }
        else if (shiftInfo.code === 'FNL') { shiftLabel = 'FER. N.L.'; hasTicket = false; }
        else if (shiftInfo.code === 'MAL') { shiftLabel = 'MALATTIA'; hasTicket = false; }
        else {
          const s = format(start, 'HH:mm');
          const e = format(end, 'HH:mm');
          shiftLabel = `${s} - ${e}`;
        }
      }

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isSameDay(date, new Date()),
        isHoliday: !!isHoliday(date),
        holidayName: isHoliday(date),
        events: dayEvents,
        shift: shiftInfo ? {
          code: shiftInfo.code,
          label: shiftLabel,
          eventId: shiftInfo.eventId,
          hasTicket,
          emoji: vibeEmoji
        } : undefined
      };
    });
  }, [currentDate, viewMode, events, activeShiftsMapping]);

  const monthlyStats = useMemo(() => {
    let totalMinutes = 0;
    let nightMinutes = 0;
    let totalTickets = 0;
    let totalMalattia = 0;
    const currentMonthEvents = events.filter(e => isSameMonth(new Date(e.start), currentDate) && (e.category === 'shift'));
    
    currentMonthEvents.forEach(ev => {
      const start = new Date(ev.start);
      const end = new Date(ev.end);
      const duration = differenceInMinutes(end, start);
      const title = ev.title.toUpperCase();
      
      const isMalattia = title.includes('MALATTIA') || title.includes('MAL');
      const isSpecial = title.includes('RIPOSO') || title.includes('FERIE') || title.includes('FNL') || isMalattia;
      
      if (isMalattia) totalMalattia++;

      if (duration > 0 && !isSpecial) {
        totalMinutes += duration;
        if (duration > 390) totalTickets++;
        
        const nightStart = new Date(start); nightStart.setHours(22, 0, 0, 0);
        const nightEnd = new Date(start); nightEnd.setDate(nightEnd.getDate() + 1); nightEnd.setHours(6, 0, 0, 0);
        const overlapStart = start > nightStart ? start : nightStart;
        const overlapEnd = end < nightEnd ? end : nightEnd;
        if (overlapStart < overlapEnd) nightMinutes += differenceInMinutes(overlapEnd, overlapStart);
      }
    });
    return { 
      hours: (totalMinutes / 60).toFixed(1), 
      night: (nightMinutes / 60).toFixed(1), 
      tickets: totalTickets,
      malattia: totalMalattia
    };
  }, [events, currentDate]);

  const handleAddEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      setIsProcessing(true);
      await addEvent(eventData);
      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(formatError(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateEvent = async (updatedEvent: CalendarEvent) => {
    try {
      setIsProcessing(true);
      const { id, ...payload } = updatedEvent;
      await updateEvent(id, payload);
      await fetchData();
      setIsModalOpen(false);
      setEditingEvent(null);
    } catch (err: any) {
      alert(formatError(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Eliminare definitivamente?")) return;
    setDeletingId(id);
    try {
      await deleteEvent(id);
      await fetchData();
    } catch (err: any) {
      alert(formatError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const navigate = (direction: number) => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, direction));
    } else {
      setCurrentDate(addWeeks(currentDate, direction));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 overflow-hidden relative">
      <CalendarHeader 
        currentMonth={currentDate}
        onPrevMonth={() => navigate(-1)}
        onNextMonth={() => navigate(1)}
        onToday={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}
        viewMode={viewMode}
        onToggleView={() => setViewMode(prev => prev === 'month' ? 'week' : 'month')}
      />
      
      <main className="flex-1 overflow-auto bg-slate-50 relative pb-20 sm:pb-24">
        {loading && events.length === 0 ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-50/50">
            <RefreshCcw className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <CalendarGrid 
            days={days}
            selectedDate={selectedDate}
            onSelectDate={(date) => { setSelectedDate(date); setEditingEvent(null); setIsModalOpen(true); }}
            onEditEvent={(event) => { setEditingEvent(event); setIsModalOpen(true); }}
            onDeleteEvent={handleDeleteEvent}
            deletingId={deletingId}
            viewMode={viewMode}
          />
        )}
      </main>
      
      <footer className="fixed bottom-0 left-0 right-0 h-16 sm:h-20 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-40 flex items-center justify-between px-2 sm:px-10 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2.5 sm:gap-8">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-indigo-500" />
            <div className="flex flex-col leading-none">
              <span className="text-[6px] sm:text-[7px] font-black text-slate-400 uppercase tracking-tighter">ORE</span>
              <span className="text-[11px] sm:text-lg font-black">{monthlyStats.hours}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Moon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-500" />
            <div className="flex flex-col leading-none">
              <span className="text-[6px] sm:text-[7px] font-black text-slate-400 uppercase tracking-tighter">NOTTE</span>
              <span className="text-[11px] sm:text-lg font-black">{monthlyStats.night}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Ticket className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-500" />
            <div className="flex flex-col leading-none">
              <span className="text-[6px] sm:text-[7px] font-black text-slate-400 uppercase tracking-tighter">TICKET</span>
              <span className="text-[11px] sm:text-lg font-black text-emerald-600">{monthlyStats.tickets}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Thermometer className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-500" />
            <div className="flex flex-col leading-none">
              <span className="text-[6px] sm:text-[7px] font-black text-slate-400 uppercase tracking-tighter">MAL</span>
              <span className="text-[11px] sm:text-lg font-black text-rose-600">{monthlyStats.malattia}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button 
            onClick={() => setIsShiftManagerOpen(true)} 
            className="p-2 sm:p-2.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-100"
          >
            <Settings2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
          <button 
            onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} 
            className="bg-indigo-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-[10px] sm:text-xs flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Zap className="w-3 sm:w-3.5 h-3.5 sm:h-3.5 fill-white" /> <span className="hidden xs:inline">Nuovo</span>
          </button>
        </div>
      </footer>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black tracking-tight">{editingEvent ? 'Modifica Evento' : 'Nuovo Evento'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingEvent(null); }} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <EventForm 
              initialData={editingEvent || { start: selectedDate.toISOString(), end: selectedDate.toISOString(), category: 'work' }} 
              onSubmit={editingEvent ? (data) => handleUpdateEvent({ ...data, id: editingEvent.id }) : handleAddEvent} 
              isProcessing={isProcessing} 
            />
          </div>
        </div>
      )}

      {isShiftManagerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-50 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black tracking-tight">Impostazioni</h3>
              <button onClick={() => setIsShiftManagerOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <ShiftManager configs={shiftConfigs} onUpdate={fetchData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

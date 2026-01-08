
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO string
  end: string;   // ISO string
  category: 'work' | 'personal' | 'health' | 'other' | 'shift';
  color: string;
}

export interface ShiftConfig {
  id: string;
  code: string;
  start_time: string; // "HH:mm"
  end_time: string;   // "HH:mm"
}

export interface Holiday {
  date: string;
  name: string;
}

export interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  events: CalendarEvent[];
  shift?: {
    code: string;
    label: string;
    eventId: string;
    hasTicket: boolean;
    emoji: string;
  };
}

export interface AIParsedEvent {
  title: string;
  description: string;
  start: string;
  end: string;
  category: 'work' | 'personal' | 'health' | 'other' | 'shift';
}

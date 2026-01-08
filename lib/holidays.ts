
export const ITALIAN_HOLIDAYS: Record<string, string> = {
  "2025-01-01": "Capodanno",
  "2025-01-06": "Epifania",
  "2025-04-25": "Liberazione",
  "2025-05-01": "Festa del Lavoro",
  "2025-06-02": "Festa della Repubblica",
  "2025-08-15": "Ferragosto",
  "2025-11-01": "Ognissanti",
  "2025-12-08": "Immacolata",
  "2025-12-25": "Natale",
  "2025-12-26": "Santo Stefano",
};

export const isHoliday = (date: Date) => {
  const key = date.toISOString().split('T')[0];
  return ITALIAN_HOLIDAYS[key] || null;
};

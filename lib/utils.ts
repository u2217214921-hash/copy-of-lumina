
export const formatError = (error: any): string => {
  if (!error) return "Errore sconosciuto";
  if (typeof error === 'string') return error;
  if (error.message || error.details || error.hint || error.code) {
    const parts = [];
    if (error.message) parts.push(error.message);
    if (error.details && error.details !== "null") parts.push(`Dettagli: ${error.details}`);
    if (error.code) parts.push(`[Codice: ${error.code}]`);
    return parts.join(' - ');
  }
  if (error instanceof Error) return error.message;
  return "Errore di connessione o database";
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'shift': return '#10b981'; // Emerald/Green per i turni
    case 'work': return '#6366f1';  // Indigo/Blue per gli eventi normali
    case 'personal': return '#ec4899'; 
    case 'health': return '#f59e0b'; 
    default: return '#6366f1'; 
  }
};

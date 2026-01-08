
import { db } from './firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { CalendarEvent, ShiftConfig, Holiday } from '../types.js';

const EVENTS_COLLECTION = 'events';
const SHIFT_CONFIGS_COLLECTION = 'shift_configs';
const HOLIDAYS_COLLECTION = 'holidays';

export const fetchEvents = async (): Promise<CalendarEvent[]> => {
  const eventsCollection = collection(db, EVENTS_COLLECTION);
  const eventsQuery = query(eventsCollection, orderBy('start', 'asc'));
  const eventsSnapshot = await getDocs(eventsQuery);
  return eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
};

export const fetchShiftConfigs = async (): Promise<ShiftConfig[]> => {
  const configsCollection = collection(db, SHIFT_CONFIGS_COLLECTION);
  const configsQuery = query(configsCollection, orderBy('code', 'asc'));
  const configsSnapshot = await getDocs(configsQuery);
  return configsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShiftConfig));
};

export const addEvent = async (eventData: Partial<CalendarEvent>) => {
  await addDoc(collection(db, EVENTS_COLLECTION), eventData);
};

export const updateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
  const eventRef = doc(db, EVENTS_COLLECTION, id);
  await updateDoc(eventRef, eventData);
};

export const deleteEvent = async (id: string) => {
  await deleteDoc(doc(db, EVENTS_COLLECTION, id));
};

export const addShiftConfig = async (configData: Partial<ShiftConfig>) => {
    await addDoc(collection(db, SHIFT_CONFIGS_COLLECTION), configData);
};

export const deleteShiftConfig = async (id: string) => {
    await deleteDoc(doc(db, SHIFT_CONFIGS_COLLECTION, id));
};

export const addHoliday = async (holidayData: Partial<Holiday>) => {
    await addDoc(collection(db, HOLIDAYS_COLLECTION), holidayData);
};

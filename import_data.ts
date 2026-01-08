
import { addShiftConfig, addHoliday } from './lib/firestore.js';
import * as fs from 'fs';
import * as path from 'path';

const parseCSV = (filePath: string) => {
  const csvData = fs.readFileSync(filePath, 'utf-8');
  const rows = csvData.split('\r\n').filter(row => row.trim() !== '');
  const headers = rows.shift()?.split(',');
  if (!headers) return [];

  return rows.map(row => {
    const values = row.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index].trim();
      return obj;
    }, {} as {[key: string]: string});
  });
};

const importShiftConfigs = async () => {
  const shiftConfigs = parseCSV(path.resolve('.', './shift_codes_rows.csv'));

  for (const config of shiftConfigs) {
    await addShiftConfig({
      code: config.code,
      start_time: config.start_time,
      end_time: config.end_time,
    });
  }
  console.log('Shift configs imported successfully!');
};

const importHolidays = async () => {
  const holidays = parseCSV(path.resolve('.', './holidays_rows.csv'));

  for (const holiday of holidays) {
    await addHoliday({
      date: holiday.date,
      name: holiday.name,
    });
  }
  console.log('Holidays imported successfully!');
};

const importData = async () => {
  await importShiftConfigs();
  await importHolidays();
};

importData().catch(err => console.error(err));

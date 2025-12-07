import uuidv4 from '../utils/uuid';
import SQLite from 'react-native-sqlite-storage';
import type { SQLiteDatabase } from 'react-native-sqlite-storage';
import { createTablesQuery } from './schema';
import { ensureDefaultTags } from './TagRepository';
// Enable Promise API
SQLite.enablePromise(true);

let database: SQLiteDatabase | null = null;

export const initializeDatabase = async () => {
  if (database) return database;
  try {
    database = await SQLite.openDatabase({
      name: 'money_v1.db',
      location: 'default',
    });
    await database.executeSql('PRAGMA foreign_keys = ON;');
    const dropTablesQuery = `
--DROP databse money_v1;
DROP TABLE IF EXISTS app_depts; 
--DROP TABLE IF EXISTS app_fund_snapshots;
--DROP TABLE IF EXISTS tags;
--DROP TABLE IF EXISTS data;
--DROP TABLE IF EXISTS data_tags;
`;

//s await database.executeSql(dropTablesQuery);
    // console.log('delete table')
    await createTables();
    await ensureDefaultTags();
    // console.log('Database initialization ss');
    return database;
  } catch (error) {
    console.error('Database initialization failed', error);
    throw error;
  }
};

const createTables = async () => {
  if (!database) throw new Error('Database not initialized');

  try {
    // console.log('create table');
    // await database.executeSql(createTablesQuery);
    for (const query of createTablesQuery.trim().split(';')) {
      if (query.trim()) {
        await database.executeSql(query);
      }
    }
  } catch (error) {
    console.error('Table creation failed', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!database) throw new Error('Database not initialized');
  return database;
};

export const closeDatabase = async () => {
  if (database) {
    try {
      await database.close();
      database = null;
    } catch (error) {
      console.error('Failed to close database', error);
      throw error;
    }
  }
};

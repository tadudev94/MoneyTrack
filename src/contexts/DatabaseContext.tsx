import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeDatabase, closeDatabase } from '../database/database';

interface DatabaseContextType {
  initialized: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({ initialized: false });

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      setInitialized(true);
    };

    init();

    return () => {
      closeDatabase();
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{ initialized }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);

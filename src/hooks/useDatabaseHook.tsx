import { useState, useEffect } from 'react';
import db from '../db/pgliteClient';

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);
  const [syncTrigger, setSyncTrigger] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        // Only leader should run setup queries
        if (db.isLeader) {
          await db.exec(`
            CREATE TABLE IF NOT EXISTS patients (
              id SERIAL PRIMARY KEY,
              first_name VARCHAR(100) NOT NULL,
              last_name VARCHAR(100) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              phone VARCHAR(20),
              date_of_birth DATE,
              gender VARCHAR(10),
              address TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);

          await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_patients_name 
            ON patients(first_name, last_name)
          `);

          await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_patients_email 
            ON patients(email)
          `);
        }

        setIsReady(true);
      } catch (err) {
        console.error('[db] Init failed:', err);
      }
    };

    init();

    // Listen for leader changes and force UI refresh
    const unsubscribe = db.onLeaderChange(() => {
      setSyncTrigger((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { db, isReady, syncTrigger };
};

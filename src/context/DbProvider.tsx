import React, { createContext, useContext, useEffect, useState } from "react";
import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";

const DbContext = createContext<PGlite | null>(null);

export const DbProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, setDb] = useState<PGlite | null>(null);

  useEffect(() => {
    const init = async () => {
      const instance = await PGlite.create({ extensions: { live } });
      setDb(instance);
    };
    init();
  }, []);

  if (!db) return <div>Loading DB...</div>;

  return <DbContext.Provider value={db}>{children}</DbContext.Provider>;
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (!context) throw new Error("useDb must be used within DbProvider");
  return context;
};

import "./App.css";
import { live } from "@electric-sql/pglite/live";
import { PGliteProvider } from "@electric-sql/pglite-react";
import PatientRegistrationApp from "./components/PatientRegistrationApp";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import type { PGliteWithLive } from "@electric-sql/pglite/live";
import { useEffect } from "react";
import PGWorker from "./pglite-worker.js?worker";

const db = new PGliteWorker(
  new PGWorker({
    name: "pglite-worker", // OK
  }),
  {
    dataDir: "opfs-ahp://patient-registration-db",
    extensions: {
      live,
    },
  }
) as unknown as PGliteWithLive;

function App() {
  useEffect(() => {
    db.exec(
      `
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
    `
    )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <PGliteProvider db={db}>
      <PatientRegistrationApp />
    </PGliteProvider>
  );
}

export default App;

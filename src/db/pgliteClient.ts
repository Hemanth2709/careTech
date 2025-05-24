import { live } from '@electric-sql/pglite/live';
import { PGliteWorker } from '@electric-sql/pglite/worker';

const db = await PGliteWorker.create(
  new Worker(new URL('./pglite-worker.ts', import.meta.url), {
    type: 'module',
  }),
  {
    dataDir: 'opfs-ahp://patient-registration-db',
    extensions: {
      live
    }
  }
);

export default db;

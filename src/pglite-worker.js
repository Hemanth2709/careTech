import { PGlite } from "@electric-sql/pglite";
import { worker } from "@electric-sql/pglite/worker";
import { live } from "@electric-sql/pglite/live";
import { OpfsAhpFS } from '@electric-sql/pglite/opfs-ahp';

worker({
  async init(options) {
    return new PGlite({
      dataDir: options.dataDir,
      extensions: { live },
      fs: new OpfsAhpFS(options.dataDir || "")
    });
  }
})
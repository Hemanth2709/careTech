import { PGlite } from "@electric-sql/pglite";

export class PGliteManager {
  private db: PGlite;
  private changeListeners: Set<() => void> = new Set();
  private channel: BroadcastChannel;

  constructor() {
    this.db = new PGlite({
      dataDir: "idb://patient-registration-db",
    });

    this.channel = new BroadcastChannel("pglite-sync");
    this.setupCrossTabSync();
  }

  private setupCrossTabSync() {
    this.channel.onmessage = (event) => {
      if (event.data === "data-changed") {
        console.log("[sync] Received change from another tab");
        this.changeListeners.forEach((listener) => listener());
      }
    };
  }

  private broadcastChange() {
    console.log("[sync] Broadcasting change to other tabs");
    this.channel.postMessage("data-changed");
  }

  onDataChange(callback: () => void) {
    this.changeListeners.add(callback);
    return () => this.changeListeners.delete(callback);
  }

  async exec(sql: string) {
    try {
      await this.db.exec(sql);

      if (/^\s*(INSERT|UPDATE|DELETE)/i.test(sql)) {
        this.broadcastChange();
      }
    } catch (error) {
      console.error("SQL execution error:", error);
      throw error;
    }
  }

  async query(sql: string, params: any[] = []) {
    try {
      return await this.db.query(sql, params);
    } catch (error) {
      console.error("SQL query error:", error);
      throw error;
    }
  }

  async close() {
    this.channel.close();
    await this.db.close();
  }
}

import { useEffect } from "react";

const channel = new BroadcastChannel("pg-lite-sync");

export function useSyncTrigger(onSync: () => void) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "db-updated") {
        onSync();
      }
    };
    channel.addEventListener("message", handleMessage);
    return () => channel.removeEventListener("message", handleMessage);
  }, [onSync]);

  return {
    notify: () => channel.postMessage("db-updated"),
  };
}

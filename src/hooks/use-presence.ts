import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect } from "react";

export function usePresence() {
  const updatePresence = useMutation(api.presence.updatePresence);

  useEffect(() => {
    // Update presence immediately
    updatePresence();

    // Update presence every 2 minutes
    const interval = setInterval(() => {
      updatePresence();
    }, 2 * 60 * 1000);

    // Update on visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updatePresence();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [updatePresence]);
}

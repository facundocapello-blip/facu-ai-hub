import { useEffect, useState } from "react";
import type { Session } from "../lib/types";
import { elapsedMs, formatDuration } from "../lib/tracking";
export function Timer({ session }: { session: Session }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    setNow(Date.now());
    if (session.runningSince === null) return;
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("pageshow", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("pageshow", tick);
    };
  }, [session.runningSince]);
  return (
    <span className="timer" aria-label="Tiempo transcurrido">
      {formatDuration(elapsedMs(session, now))}
    </span>
  );
}

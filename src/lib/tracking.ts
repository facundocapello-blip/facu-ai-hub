import type { Session } from "./types";
export function elapsedMs(s: Session, now = Date.now()) {
  return Math.max(
    0,
    s.accumulatedMs +
      (s.runningSince === null ? 0 : Math.max(0, now - s.runningSince)),
  );
}
export function pauseSession(s: Session, now = Date.now()): Session {
  return {
    ...s,
    accumulatedMs: elapsedMs(s, now),
    runningSince: null,
    updatedAt: now,
  };
}
export function resumeSession(s: Session, now = Date.now()): Session {
  return s.runningSince !== null || s.endedAt !== null
    ? s
    : { ...s, runningSince: now, updatedAt: now };
}
export function formatDuration(ms: number) {
  const n = Math.floor(ms / 1000);
  return [Math.floor(n / 3600), Math.floor(n / 60) % 60, n % 60]
    .map((x) => String(x).padStart(2, "0"))
    .join(":");
}

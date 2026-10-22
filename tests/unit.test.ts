import { describe, it, expect } from "vitest";
import { elapsedMs, pauseSession, resumeSession } from "../src/lib/tracking";
import { classifyIntent } from "../src/lib/intents";
import { migrateLegacy, validateWorkspace } from "../src/lib/storage";
import { seedWorkspace } from "../src/lib/seeds";
import type { Session } from "../src/lib/types";
const session: Session = {
  id: "s",
  projectId: "sap",
  startedAt: 1000,
  runningSince: 1000,
  accumulatedMs: 0,
  endedAt: null,
  updatedAt: 1000,
};
describe("tracking survives suspended tabs", () => {
  it("accounts for background time without interval ticks", () =>
    expect(elapsedMs(session, 121000)).toBe(120000));
  it("excludes paused time and includes resumed time", () => {
    const paused = pauseSession(session, 11000);
    expect(elapsedMs(paused, 99000)).toBe(10000);
    expect(elapsedMs(resumeSession(paused, 100000), 105000)).toBe(15000);
  });
  it("does not resume a completed session or double start", () => {
    expect(resumeSession(session, 5000)).toEqual(session);
    const stopped = { ...pauseSession(session, 11000), endedAt: 11000 };
    expect(resumeSession(stopped, 12000)).toEqual(stopped);
  });
});
describe("intent routing", () => {
  it.each([
    ["Revisar PCR y log PT60", "sap"],
    ["Corregir audio online en iPhone", "desarrollo"],
    ["Automatizar ventas desde Excel", "operaciones"],
    ["Diseño de imagen para Instagram", "creativo"],
    ["Organizar mis ideas", "analisis"],
  ])("%s → %s", (text, intent) =>
    expect(classifyIntent(text).intent).toBe(intent),
  );
});
describe("migration and recovery", () => {
  it("retains healthy data when legacy JSON is corrupt", () => {
    const result = migrateLegacy({
      getItem: (k) => (k === "facu_hub_projects" ? "{bad" : null),
    });
    expect(result.warnings.length).toBe(1);
    expect(result.data.projects.length).toBe(8);
  });
  it("maps 4.5 project IDs and pauses the old clock", () => {
    const values: Record<string, string> = {
      facu_hub_projects: JSON.stringify([
        {
          id: "8",
          name: "SAP",
          category: "Profesional",
          priority: "Alta",
          notes: "Mi contexto",
        },
      ]),
      facu_hub_tracking: JSON.stringify({
        projectId: "8",
        active: true,
        startTime: 1000,
        elapsed: 42,
      }),
    };
    const { data } = migrateLegacy({ getItem: (k) => values[k] || null });
    expect(data.projects[0].id).toBe("sap");
    expect(data.sessions[0].accumulatedMs).toBe(42000);
    expect(data.sessions[0].runningSince).toBeNull();
  });
  it("rejects foreign schema, duplicate IDs and dangling references", () => {
    expect(() => validateWorkspace({ schema: 4 })).toThrow();
    const d = seedWorkspace();
    d.projects.push(d.projects[0]);
    expect(() => validateWorkspace(d)).toThrow("duplicados");
    const e = seedWorkspace();
    e.tasks = [
      {
        id: "t",
        projectId: "missing",
        title: "Task",
        priority: "Alta",
        status: "Pendiente",
        updatedAt: 0,
      },
    ];
    expect(() => validateWorkspace(e)).toThrow("inexistente");
  });
  it("rejects multiple unfinished sessions", () => {
    const d = seedWorkspace();
    d.sessions = [session, { ...session, id: "s2" }];
    expect(() => validateWorkspace(d)).toThrow("más de una");
  });
});

it("skips invalid legacy override IDs while retaining good projects", () => {
  const { data, warnings } = migrateLegacy({
    getItem: (key) =>
      key === "facu-ai-hub-v12-projects"
        ? JSON.stringify({ "bad/id": { status: "Pendiente" } })
        : null,
  });
  expect(data.projects).toHaveLength(8);
  expect(warnings.length).toBeGreaterThan(0);
});

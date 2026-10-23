import { expect, it } from "vitest";
import { prioritize, continuation, validChatUrl } from "../src/lib/assistant";
import { seedWorkspace } from "../src/lib/seeds";
import { validateWorkspace } from "../src/lib/storage";
it("ranks blocked and overdue work, caps at three, never recommends completed or snoozed tasks", () => {
  const d = seedWorkspace();
  const p = d.projects[0];
  p.status = "Bloqueado";
  d.tasks = [
    {
      id: "due",
      projectId: p.id,
      title: "Reparar Henris",
      status: "Pendiente",
      priority: "Alta",
      dueAt: 1,
      updatedAt: 0,
    },
    {
      id: "done",
      projectId: p.id,
      title: "Listo",
      status: "Terminado",
      priority: "Alta",
      updatedAt: 0,
    },
    {
      id: "later",
      projectId: p.id,
      title: "Luego",
      status: "Pendiente",
      priority: "Alta",
      snoozedUntil: 999999,
      updatedAt: 0,
    },
  ];
  const a = prioritize(d, 10000);
  expect(a).toHaveLength(3);
  expect(a[0].task?.id).toBe("due");
  expect(a[0].reason).toContain("Bloqueo reportado");
  expect(a.some((x) => ["done", "later"].includes(x.task?.id || ""))).toBe(
    false,
  );
});
it("continuation states provenance, pending work and limitations", () => {
  const d = seedWorkspace();
  const p = d.projects[0];
  d.tasks = [
    {
      id: "t",
      projectId: p.id,
      title: "Prueba pendiente",
      status: "Pendiente",
      priority: "Alta",
      updatedAt: 0,
    },
  ];
  const text = continuation(p, d.tasks);
  expect(text).toContain(p.name);
  expect(text).toContain("Versión reportada");
  expect(text).toContain("Prueba pendiente");
  expect(text).toContain("No implica acceso");
  expect(text).toContain("no usar servicios pagos");
});
it("accepts only real official chat URL shapes and preserves optional fields in backups", () => {
  for (const u of [
    "javascript:alert(1)",
    "https://chatgpt.com.evil.test/c/a",
    "https://user@chatgpt.com/c/a",
    "https://chatgpt.com/",
    "https://chatgpt.com/c/a?redirect=evil",
  ])
    expect(validChatUrl(u)).toBe(false);
  expect(validChatUrl("https://chatgpt.com/c/abc-123")).toBe(true);
  const d = seedWorkspace();
  Object.assign(d.projects[0], {
    chatUrl: "https://chatgpt.com/c/abc-123",
    dueAt: 123,
    snoozedUntil: 456,
  });
  expect(
    validateWorkspace(JSON.parse(JSON.stringify(d))).projects[0].chatUrl,
  ).toContain("abc-123");
  expect(() =>
    validateWorkspace({
      ...d,
      projects: [{ ...d.projects[0], snoozedUntil: -1 }],
    }),
  ).toThrow();
});

it("rejects out-of-range optional dates before they can crash the assistant", () => {
  const d = seedWorkspace();
  d.projects[0].dueAt = 1e100;
  expect(() => validateWorkspace(d)).toThrow();
  expect(validChatUrl("https://chatgpt.com/c/a#")).toBe(false);
});

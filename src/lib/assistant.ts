import type { Project, Task, Workspace } from "./types";
export function validChatUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (
      value === `${u.origin}${u.pathname}` &&
      u.protocol === "https:" &&
      ["chatgpt.com", "chat.openai.com"].includes(u.hostname) &&
      !u.username &&
      !u.password &&
      !u.port &&
      /^\/c\/[a-zA-Z0-9-]+\/?$/.test(u.pathname) &&
      !u.search &&
      !u.hash
    );
  } catch {
    return false;
  }
}
export function continuation(p: Project, tasks: Task[]): string {
  return `Continuemos el proyecto ${p.name}.\nVersión reportada por el usuario: ${p.version || "sin informar"} (no verificada).\nEstado reportado: ${p.status}.\nContexto guardado: ${p.notes || "sin contexto"}.\nPróximo paso: ${p.next || "por definir"}.\nPendientes:\n${
    tasks
      .filter((t) => t.projectId === p.id && t.status !== "Terminado")
      .map(
        (t) =>
          `- ${t.title} (${t.status}, prioridad ${t.priority})${t.dueAt ? ", fecha reportada " + new Date(t.dueAt).toISOString().slice(0, 10) : ""}`,
      )
      .join("\n") || "- No hay tareas pendientes registradas."
  }\nReferencias reportadas: ${p.url || "sin web"}; ${p.github || "sin repositorio"}.\nRestricciones: conservar la versión estable; trabajar en rama de prueba; no usar servicios pagos ni datos confidenciales sin autorización.\nEste resumen proviene del Hub. No implica acceso al historial de ChatGPT ni a chats archivados. Confirmá lo que falte y proponé un próximo paso concreto. No afirmes verificaciones que no realizaste.`;
}
export interface Action {
  project: Project;
  task?: Task;
  title: string;
  reason: string;
  score: number;
}
export function prioritize(data: Workspace, now = Date.now()): Action[] {
  const rank = { Alta: 30, Media: 20, Baja: 10 };
  const actions: Action[] = [];
  for (const p of data.projects) {
    if (/^(terminado|completado|archivado)$/i.test(p.status)) continue;
    const tasks = data.tasks.filter(
      (t) => t.projectId === p.id && t.status !== "Terminado",
    );
    for (const t of tasks.length ? tasks : [undefined]) {
      if (((t || p).snoozedUntil || 0) > now) continue;
      const due = t?.dueAt || p.dueAt;
      const blocked = /bloque|blocked/i.test(p.status);
      const stale = Math.max(
        0,
        Math.floor((now - (t?.updatedAt ?? p.updatedAt)) / 86400000),
      );
      const reason = [
        blocked ? "Bloqueo reportado" : "",
        due
          ? `${due <= now ? "Fecha vencida" : "Fecha prevista"}: ${new Date(due).toISOString().slice(0, 10)}`
          : "",
        t
          ? "Tarea incompleta"
          : p.next
            ? "Próximo paso guardado"
            : "Falta definir el próximo paso",
        `Prioridad ${t?.priority || p.priority}`,
        `${stale} días sin actualizar`,
      ]
        .filter(Boolean)
        .join(" · ");
      actions.push({
        project: p,
        task: t,
        title: t?.title || p.next || "Definir próximo paso",
        reason,
        score:
          rank[t?.priority || p.priority] +
          (blocked ? 100 : 0) +
          (due
            ? due <= now
              ? 80
              : Math.max(0, 40 - (due - now) / 86400000)
            : 0) +
          Math.min(stale, 20),
      });
    }
  }
  return actions
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.project.id.localeCompare(b.project.id) ||
        (a.task?.id || "").localeCompare(b.task?.id || ""),
    )
    .slice(0, 3);
}

import { useEffect, useState } from "react";
import { continuation, validChatUrl } from "../lib/assistant";
import { prioritizeReconciled } from "../lib/reconciliation";
import type { Project, Workspace, Collection, Entity } from "../lib/types";
import type { MasterProject } from "../lib/masterRegistry";
export function Assistant({
  data,
  source,
  put,
  edit,
  continueProject,
  run,
  saving,
  master,
}: {
  data: Workspace;
  source: string;
  master: MasterProject[];
  put: (k: Collection, e: Entity) => Promise<void>;
  edit: (p: Project) => void;
  continueProject: (p: Project) => void;
  run: (fn: () => Promise<unknown>) => Promise<void>;
  saving: boolean;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  const actions = prioritizeReconciled(data, master, now);
  return (
    <section className="panel assistant-actions">
      <span className="eyebrow">REGLAS LOCALES · SIN COSTO DE API</span>
      <h2>Tus próximas acciones</h2>
      <p className="muted">
        Fuente: {source}. Cuando existe registro auditado, se prioriza su último
        paso conocido sin sobrescribir tus datos personales. Tareas propias pendientes
        pueden requerir reconfirmación.
      </p>
      {!actions.length && (
        <p>
          No hay acciones disponibles. Revisá tareas terminadas o pospuestas y
          los proyectos archivados.
        </p>
      )}
      {actions.map((a) => (
        <article className="action-card" key={a.task?.id || a.project.id}>
          <small>{a.project.name}</small>
          <h3>{a.title}</h3>
          <p>{a.reason}</p>
          <div className="button-row">
            {a.task && (
              <button
                className="button primary"
                disabled={saving}
                onClick={() =>
                  void run(() =>
                    put("tasks", {
                      ...a.task!,
                      status: "Terminado",
                      updatedAt: Date.now(),
                    }),
                  )
                }
              >
                Marcar tarea terminada
              </button>
            )}
            <button
              className="button secondary"
              disabled={saving}
              onClick={() =>
                void run(() =>
                  put(a.task ? "tasks" : "projects", {
                    ...(a.task || a.project),
                    snoozedUntil: Date.now() + 86400000,
                    updatedAt: Date.now(),
                  }),
                )
              }
            >
              Posponer 24 h
            </button>
            <button
              className="button secondary"
              onClick={() => continueProject(a.project)}
            >
              Continuar con ChatGPT
            </button>
            <button className="text-button" onClick={() => edit(a.project)}>
              Editar proyecto
            </button>
          </div>
        </article>
      ))}
      <p className="muted small">
        Marcar tarea terminada afecta únicamente esa tarea. Los pasos auditados son
        sugerencias: no borran notas ni proyectos. Posponer oculta la acción 24 horas.
      </p>
      <details>
        <summary>Revisar acciones pospuestas</summary>
        {data.projects.flatMap((p) => [
          ...data.tasks
            .filter((t) => t.projectId === p.id && (t.snoozedUntil || 0) > now)
            .map((t) => (
              <div key={t.id}>
                {p.name}: {t.title}
                <button
                  disabled={saving}
                  onClick={() =>
                    void run(() =>
                      put("tasks", {
                        ...t,
                        snoozedUntil: 0,
                        updatedAt: Date.now(),
                      }),
                    )
                  }
                >
                  Reactivar tarea
                </button>
              </div>
            )),
          ...(p.snoozedUntil && p.snoozedUntil > now
            ? [
                <div key={p.id}>
                  {p.name}
                  <button
                    disabled={saving}
                    onClick={() =>
                      void run(() =>
                        put("projects", {
                          ...p,
                          snoozedUntil: 0,
                          updatedAt: Date.now(),
                        }),
                      )
                    }
                  >
                    Reactivar proyecto
                  </button>
                </div>,
              ]
            : []),
        ])}
      </details>
    </section>
  );
}
export function Continuation({
  project,
  tasks,
  master,
  masterSource,
  copy,
  edit,
}: {
  project: Project;
  tasks: Workspace["tasks"];
  master?: MasterProject;
  masterSource: string;
  copy: (s: string) => Promise<void>;
  edit: () => void;
}) {
  const audit = master
    ? "FUENTE PRIORITARIA — REGISTRO AUDITADO (" + masterSource + "):\n" +
      "Proyecto: " + master.name + "\n" +
      "Estado comprobado documentalmente: " + master.status + "\n" +
      "Evidencia: " + master.evidence + "\n" +
      "Próximo paso del registro: " + master.next + "\n" +
      "No repetir pruebas históricas sin demostrar que el error sigue vigente. " +
      "Distinguir producción, candidata y STAGING.\n\n"
    : "SIN REGISTRO AUDITADO: no inventar una versión nueva.\n\n";
  const prompt = audit + "DATOS PRIVADOS GUARDADOS (pueden estar desactualizados; conservarlos pero no asumirlos vigentes):\n" +
    continuation(project, tasks) +
    "\n\nAntes de proponer ejecución, contrastá cualquier tarea guardada con la evidencia auditada. " +
    "No sobrescribir producción ni borrar datos personales sin autorización.";
  return (
    <>
      <p>
        Copiá este resumen y pegalo en ChatGPT. Abrir el enlace no transfiere
        contexto ni historial. Revisá las notas antes de compartirlas.
      </p>
      <label>
        Resumen para ChatGPT
        <textarea readOnly rows={12} value={prompt} />
      </label>
      <div className="button-row">
        <button className="button primary" onClick={() => void copy(prompt)}>
          Copiar resumen
        </button>
        <a
          className="button secondary"
          href={
            validChatUrl(project.chatUrl || "")
              ? project.chatUrl
              : "https://chatgpt.com/"
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          {project.chatUrl ? "Abrir chat principal" : "Abrir ChatGPT"}
        </a>
        <button className="button secondary" onClick={edit}>
          {project.chatUrl ? "Editar enlace" : "Agregar enlace"}
        </button>
      </div>
    </>
  );
}

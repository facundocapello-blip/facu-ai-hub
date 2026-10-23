import { useEffect, useState } from "react";
import { continuation, prioritize, validChatUrl } from "../lib/assistant";
import type { Project, Workspace, Collection, Entity } from "../lib/types";
export function Assistant({
  data,
  source,
  put,
  edit,
  continueProject,
  run,
  saving,
}: {
  data: Workspace;
  source: string;
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
  const actions = prioritize(data, now);
  return (
    <section className="panel assistant-actions">
      <span className="eyebrow">REGLAS LOCALES · SIN COSTO DE API</span>
      <h2>Tus próximas acciones</h2>
      <p className="muted">
        Fuente: {source}. Estados, versiones y fechas reportados por vos; no
        verificados automáticamente.
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
            <button
              className="button primary"
              disabled={saving}
              onClick={() =>
                void run(() =>
                  a.task
                    ? put("tasks", {
                        ...a.task,
                        status: "Terminado",
                        updatedAt: Date.now(),
                      })
                    : put("projects", {
                        ...a.project,
                        next: "",
                        status: "Pendiente de definir próximo paso",
                        snoozedUntil: Date.now() + 86400000,
                        updatedAt: Date.now(),
                      }),
                )
              }
            >
              Resolver
            </button>
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
        Resolver completa la tarea existente. Para un próximo paso de proyecto,
        lo limpia y pide definir otro mañana. Posponer conserva los datos y
        oculta la acción durante 24 horas.
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
  copy,
  edit,
}: {
  project: Project;
  tasks: Workspace["tasks"];
  copy: (s: string) => Promise<void>;
  edit: () => void;
}) {
  const prompt = continuation(project, tasks);
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

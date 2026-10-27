import { Assistant, Continuation } from "./components/Assistant";
import { MasterRegistryPanel, MasterVersion, useMasterRegistry } from "./components/MasterRegistry";
import { findMasterProject } from "./lib/masterRegistry";
import { validChatUrl } from "./lib/assistant";
import { useRef, useState, type FormEvent } from "react";
import {
  LayoutGrid,
  Sparkles,
  BookOpen,
  Settings,
  ArrowUpRight,
  Search,
  Plus,
  ChevronRight,
  Play,
  Download,
  Upload,
  LogOut,
  Cloud,
  CloudOff,
  WifiOff,
  Check,
  Pencil,
  Trash2,
  Zap,
  CircleHelp,
} from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useWorkspace, message } from "./lib/useWorkspace";
import {
  uid,
  type Project,
  type Priority,
  type Task,
  type Prompt,
  type Workspace,
} from "./lib/types";
import {
  buildRecommendation,
  intents,
  type Intent,
  type Recommendation,
} from "./lib/intents";
import { readWorkspace, validateWorkspace } from "./lib/storage";
import { seedWorkspace } from "./lib/seeds";
import { Modal } from "./components/Modal";
const tabs = [
  { id: "projects", label: "Proyectos", icon: LayoutGrid },
  { id: "ia", label: "IA Hub", icon: Sparkles },
  { id: "prompts", label: "Prompts", icon: BookOpen },
  { id: "settings", label: "Ajustes", icon: Settings },
] as const;
type Tab = (typeof tabs)[number]["id"];
const safeUrl = (s: string) => {
  try {
    const u = new URL(s);
    return ["https:", "http:"].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
};
const blankProject = (): Project => ({
  id: uid(),
  name: "",
  category: "Personal",
  priority: "Media",
  status: "Pendiente",
  version: "",
  url: "",
  github: "",
  notes: "",
  next: "",
  updatedAt: Date.now(),
});
export default function App() {
  const store = useWorkspace();
  const masterRegistry = useMasterRegistry();
  const { data, user, ready, online, pending, cached } = store;
  const [continuing, setContinuing] = useState<Project | null>(null);
  const [tab, setTab] = useState<Tab>("projects");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Project | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskProject, setTaskProject] = useState("");
  const [taskFilter, setTaskFilter] = useState("all");
  const [goal, setGoal] = useState("");
  const [aiProject, setAIProject] = useState("");
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [useModel, setUseModel] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);
  const [promptEdit, setPromptEdit] = useState<Prompt | null>(null);
  const [confirmImport, setConfirmImport] = useState<Workspace | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Task | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [installHelp, setInstallHelp] = useState(false);
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(e) {
      store.setError("No se pudo preparar el modo sin conexión. " + message(e));
    },
  });
  const openCount = data.tasks.filter((t) => t.status !== "Terminado").length;
  const search = query.trim().toLocaleLowerCase("es");
  const matches = (...values: string[]) =>
    values.join(" ").toLocaleLowerCase("es").includes(search);
  async function run(action: () => Promise<unknown>) {
    setSaving(true);
    store.setError("");
    try {
      await action();
    } catch (e) {
      store.setError(message(e));
    } finally {
      setSaving(false);
    }
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Copiado al portapapeles.");
    } catch {
      setNotice(
        "No se pudo copiar. Seleccioná el texto del prompt para copiarlo.",
      );
    }
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facu-hub-5-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  async function recommend(e: FormEvent) {
    e.preventDefault();
    const project = data.projects.find(
      (p) => p.id === (aiProject || data.projects[0]?.id),
    );
    if (!project || !goal.trim()) return;
    setAiBusy(true);
    store.setError("");
    const local = buildRecommendation(goal, project);
    setRec(local);
    try {
      if (useModel) {
        if (!online || !user)
          throw Error(
            "El modelo requiere conexión y una sesión iniciada. Se usaron reglas locales.",
          );
        const endpoint = import.meta.env.VITE_AI_ENDPOINT;
        if (!endpoint)
          throw Error(
            "El modelo remoto no está configurado. Se usaron reglas locales.",
          );
        await user.reload();
        const token = await user.getIdToken(true);
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ goal: goal.trim() }),
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok)
          throw Error(
            `El modelo no respondió (${response.status}). Se usaron reglas locales.`,
          );
        const result = await response.json();
        if (!intents.includes(result.intent))
          throw Error(
            "Respuesta de intención inválida. Se usaron reglas locales.",
          );
        setRec(buildRecommendation(goal, project, result.intent as Intent));
      }
    } catch (e) {
      store.setError(message(e));
    } finally {
      setAiBusy(false);
    }
  }
  const syncLabel = !user
    ? online
      ? "Solo este dispositivo"
      : "Local · sin conexión"
    : !online
      ? "Sin conexión"
      : pending
        ? "Cambios pendientes"
        : cached
          ? "Consultando la nube"
          : "Sincronizado";
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Ir al contenido
      </a>
      <aside className="desktop-sidebar">
        <a className="brand" href="#">
          <span className="logo">
            <Zap size={22} fill="currentColor" />
          </span>
          <span>
            FACU <em>AI</em> HUB<small>ESPACIO PERSONAL</small>
          </span>
        </a>
        <nav aria-label="Navegación principal">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setQuery("");
              }}
              className={tab === t.id ? "selected" : ""}
              aria-current={tab === t.id ? "page" : undefined}
            >
              <t.icon size={19} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="badge">VERSIÓN 5.1 STAGING</span>
          <p>
            Menos ruido.
            <br />
            Más foco en lo que sigue.
          </p>
          <button className="text-button" onClick={() => setInstallHelp(true)}>
            <CircleHelp size={16} /> Instalar en iPhone
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="logo">
              <Zap size={19} fill="currentColor" />
            </span>
            <strong>
              FACU AI HUB <small>5.1 STAGING</small>
            </strong>
          </div>
          <span className="desktop-eyebrow">TU ESPACIO DE TRABAJO</span>
          <button
            className="sync-status"
            onClick={() => setTab("settings")}
            aria-label={`Estado: ${syncLabel}. Abrir ajustes`}
          >
            {!online ? (
              <WifiOff size={14} />
            ) : user ? (
              <Cloud size={14} />
            ) : (
              <CloudOff size={14} />
            )}
            <span>{syncLabel}</span>
            {user && online && !cached && !pending && <Check size={13} />}
          </button>
        </header>
        <main id="main" className="content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                {tab === "projects"
                  ? "PANORAMA GENERAL"
                  : tab === "ia"
                    ? "TU PRÓXIMO PASO"
                    : tab === "prompts"
                      ? "INSTRUCCIONES QUE FUNCIONAN"
                      : "TU ESPACIO, TUS DATOS"}
              </span>
              <h1>
                {tab === "projects"
                  ? "Todo bajo control."
                  : tab === "ia"
                    ? "Decidí tu próximo paso."
                    : tab === "prompts"
                      ? "Tu biblioteca de prompts."
                      : "Ajustes del espacio."}
              </h1>
              <p>
                {tab === "projects"
                  ? "Tus proyectos, tus prioridades y lo que viene. En un solo lugar."
                  : tab === "ia"
                    ? "Prioridades de tu espacio y continuidad manual con ChatGPT."
                    : tab === "prompts"
                      ? "Guardá las instrucciones que querés volver a usar."
                      : "Controlá dónde se guardan tus datos y cómo se sincronizan."}
              </p>
            </div>
            {tab === "projects" && (
              <button
                className="button primary"
                disabled={!ready}
                onClick={() => setEditing(blankProject())}
              >
                <Plus size={17} />
                Nuevo proyecto
              </button>
            )}
          </div>
          <div aria-live="polite">
            {notice && (
              <div className="banner info">
                {notice}
                <button onClick={() => setNotice("")} aria-label="Cerrar aviso">
                  ×
                </button>
              </div>
            )}
            {store.error && (
              <div className="banner error" role="alert">
                {store.error}
                <button
                  onClick={() => store.setError("")}
                  aria-label="Cerrar error"
                >
                  ×
                </button>
              </div>
            )}
            {store.warnings.map((w) => (
              <div className="banner info" key={w}>
                {w}
              </div>
            ))}
          </div>
          {needRefresh && (
            <div className="banner info">
              Hay una nueva versión. Guardá tus cambios antes de actualizar.
              <button
                disabled={
                  saving ||
                  pending ||
                  !!editing ||
                  !!promptEdit ||
                  !!goal ||
                  !!taskTitle
                }
                onClick={() => void updateServiceWorker(true)}
              >
                Actualizar
              </button>
            </div>
          )}
          {!online && (
            <div className="offline-strip">
              <WifiOff size={14} />
              Sin conexión.{" "}
              {user
                ? "Los cambios quedan pendientes de sincronización."
                : "Tus cambios se guardan en este dispositivo."}
            </div>
          )}
          {!ready ? (
            <div className="panel loading" role="status">
              Preparando tu espacio…
            </div>
          ) : (
            <>
              {["projects", "prompts"].includes(tab) && (
                <label className="search">
                  <Search size={18} />
                  <input
                    aria-label="Buscar en el espacio"
                    placeholder={
                      tab === "projects"
                        ? "Buscar proyectos, tareas o contexto…"
                        : "Buscar en tus prompts…"
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <kbd>⌕</kbd>
                </label>
              )}
              {tab === "projects" && (
                <>
                  <MasterRegistryPanel state={masterRegistry} />
                  <div className="metrics">
                    <div>
                      <span>PROYECTOS</span>
                      <strong>
                        {data.projects.length.toString().padStart(2, "0")}
                      </strong>
                      <small>En tu espacio</small>
                    </div>
                    <div>
                      <span>POR RESOLVER</span>
                      <strong>{openCount.toString().padStart(2, "0")}</strong>
                      <small>Tareas pendientes</small>
                    </div>
                  </div>
                  <section>
                    <div className="section-title">
                      <h2>Proyectos activos</h2>
                      <span>Tu próximo paso, a la vista</span>
                    </div>
                    <div className="project-grid">
                      {data.projects
                        .filter((p) =>
                          matches(p.name, p.category, p.notes, p.next),
                        )
                        .map((p, i) => (
                          <article className="project-card" key={p.id}>
                            <div className="card-top">
                              <div className={`project-icon tone-${i % 4}`}>
                                {p.name.slice(0, 1)}
                              </div>
                              <span
                                className={`priority priority-${p.priority}`}
                              >
                                {p.priority}
                              </span>
                              <button
                                className="icon-button"
                                aria-label={`Editar ${p.name}`}
                                onClick={() => setEditing({ ...p })}
                              >
                                <Pencil size={16} />
                              </button>
                            </div>
                            <span className="category">{p.category}</span>
                            <h3>{p.name}</h3>
                            <p className="project-notes">
                              {p.notes ||
                                "Agregá contexto para tu próximo paso."}
                            </p>
                            <small className="muted">MI DATO GUARDADO · PUEDE ESTAR DESACTUALIZADO</small>
                            <div className="project-state">
                              <span className="state-dot" />
                              {p.status}
                              <span className="version">{p.version}</span>
                            </div>
                            <MasterVersion name={p.name} state={masterRegistry} />
                            {p.next && (
                              <div className="next-step">
                                <ChevronRight size={15} />
                                <span>{p.next}</span>
                              </div>
                            )}
                            <button
                              className="button secondary full"
                              onClick={() => setContinuing(p)}
                            >
                              Continuar con ChatGPT
                            </button>
                            {!p.chatUrl && (
                              <button
                                className="text-button"
                                onClick={() => setEditing({ ...p })}
                              >
                                Agregar enlace
                              </button>
                            )}
                            <div className="card-footer">
                              <div className="project-links">
                                {safeUrl(p.github) && (
                                  <a
                                    href={safeUrl(p.github)!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    GitHub <ArrowUpRight size={12} />
                                  </a>
                                )}
                                {safeUrl(p.url) && (
                                  <a
                                    href={safeUrl(p.url)!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Abrir <ArrowUpRight size={12} />
                                  </a>
                                )}
                              </div>
                            </div>
                          </article>
                        ))}
                    </div>
                    {!data.projects.filter((p) =>
                      matches(p.name, p.category, p.notes, p.next),
                    ).length && (
                      <div className="empty">
                        No hay proyectos para esta búsqueda.
                      </div>
                    )}
                  </section>
                  <section className="panel tasks-panel">
                    <div className="section-title">
                      <div>
                        <span className="eyebrow">DEL PLAN A LA ACCIÓN</span>
                        <h2>Mis tareas</h2>
                      </div>
                      <select
                        aria-label="Filtrar tareas por estado"
                        value={taskFilter}
                        onChange={(e) => setTaskFilter(e.target.value)}
                      >
                        <option value="all">Todos los estados</option>
                        <option>Pendiente</option>
                        <option>En curso</option>
                        <option>Terminado</option>
                      </select>
                    </div>
                    <form
                      className="task-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void run(async () => {
                          await store.put("tasks", {
                            id: uid(),
                            title: taskTitle.trim(),
                            projectId: taskProject || data.projects[0]?.id,
                            priority: "Media",
                            status: "Pendiente",
                            updatedAt: Date.now(),
                          });
                          setTaskTitle("");
                        });
                      }}
                    >
                      <input
                        aria-label="Nueva tarea"
                        placeholder="¿Qué querés resolver?"
                        value={taskTitle}
                        maxLength={220}
                        required
                        onChange={(e) => setTaskTitle(e.target.value)}
                      />
                      <select
                        aria-label="Proyecto de la tarea"
                        value={taskProject || data.projects[0]?.id || ""}
                        onChange={(e) => setTaskProject(e.target.value)}
                        required
                      >
                        {data.projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="button primary"
                        disabled={
                          saving || !taskTitle.trim() || !data.projects.length
                        }
                      >
                        <Plus size={17} />
                        Agregar
                      </button>
                    </form>
                    <div className="task-list">
                      {data.tasks
                        .filter(
                          (t) =>
                            (taskFilter === "all" || t.status === taskFilter) &&
                            matches(
                              t.title,
                              data.projects.find((p) => p.id === t.projectId)
                                ?.name || "",
                            ),
                        )
                        .map((t) => (
                          <div className="task-row" key={t.id}>
                            <button
                              className={`task-check ${t.status === "Terminado" ? "done" : ""}`}
                              disabled={saving}
                              aria-label={`Cambiar estado de ${t.title}: ${t.status}`}
                              onClick={() =>
                                void run(() =>
                                  store.put("tasks", {
                                    ...t,
                                    status:
                                      t.status === "Pendiente"
                                        ? "En curso"
                                        : t.status === "En curso"
                                          ? "Terminado"
                                          : "Pendiente",
                                    updatedAt: Date.now(),
                                  }),
                                )
                              }
                            >
                              {t.status === "Terminado" ? (
                                <Check size={16} />
                              ) : t.status === "En curso" ? (
                                <Play size={12} />
                              ) : null}
                            </button>
                            <div className="task-description">
                              <strong>{t.title}</strong>
                              <small>
                                {
                                  data.projects.find(
                                    (p) => p.id === t.projectId,
                                  )?.name
                                }{" "}
                                · {t.status}
                              </small>
                            </div>
                            <button
                              className="icon-button"
                              aria-label={`Crear prompt para ${t.title}`}
                              onClick={() => {
                                setAIProject(t.projectId);
                                setGoal(t.title);
                                setRec(null);
                                setTab("ia");
                              }}
                            >
                              <Sparkles size={16} />
                            </button>
                            <button
                              className="icon-button"
                              aria-label={`Eliminar ${t.title}`}
                              onClick={() => setConfirmDelete(t)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                    </div>
                    {!data.tasks.length && (
                      <p className="empty">
                        Una tarea pequeña es un buen comienzo.
                      </p>
                    )}
                  </section>
                </>
              )}
              {tab === "ia" && (
                <>
                  <Assistant
                    data={data}
                    source={
                      !user
                        ? "datos locales"
                        : cached || pending || !online
                          ? "caché de cuenta · sincronización pendiente"
                          : "datos sincronizados"
                    }
                    put={store.put}
                    edit={setEditing}
                    continueProject={setContinuing}
                    run={run}
                    saving={saving}
                  />
                  <div className="two-columns">
                    <section className="panel">
                      <div className="panel-icon">
                        <Sparkles size={23} />
                      </div>
                      <h2>Asistente de trabajo</h2>
                      <p className="muted">
                        Clasifica tu intención y prepara una instrucción con
                        contexto. Vos decidís qué ejecutar.
                      </p>
                      <form onSubmit={(e) => void recommend(e)}>
                        <label>
                          Proyecto
                          <select
                            value={aiProject || data.projects[0]?.id || ""}
                            onChange={(e) => {
                              setAIProject(e.target.value);
                              setRec(null);
                            }}
                            required
                          >
                            {data.projects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          ¿Qué querés hacer?
                          <textarea
                            placeholder="Ej.: Corregir el audio online en iPhone sin tocar producción…"
                            value={goal}
                            maxLength={4000}
                            onChange={(e) => {
                              setGoal(e.target.value);
                              setRec(null);
                            }}
                            required
                            rows={6}
                          />
                        </label>
                        {import.meta.env.VITE_AI_ENDPOINT && (
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={useModel}
                              onChange={(e) => setUseModel(e.target.checked)}
                            />
                            Usar modelo remoto (envía solo el objetivo; puede
                            consumir cuota)
                          </label>
                        )}
                        <button
                          className="button primary full"
                          disabled={
                            aiBusy || !goal.trim() || !data.projects.length
                          }
                        >
                          <Sparkles size={17} />
                          {aiBusy ? "Analizando…" : "Recomendar flujo"}
                        </button>
                      </form>
                    </section>
                    <section
                      className={`panel recommendation ${rec ? "" : "awaiting"}`}
                      aria-live="polite"
                    >
                      {rec ? (
                        <>
                          <span className="eyebrow">
                            {rec.source === "local"
                              ? "REGLAS LOCALES · SIN COSTO DE API"
                              : "CLASIFICACIÓN CON MODELO"}
                          </span>
                          <h2>{rec.tool}</h2>
                          <p>{rec.reason}</p>
                          <div className="next-step">
                            <ChevronRight size={16} />
                            {rec.next}
                          </div>
                          <label>
                            Tu instrucción
                            <textarea
                              aria-label="Prompt recomendado"
                              readOnly
                              value={rec.prompt}
                              rows={10}
                            />
                          </label>
                          <div className="button-row">
                            <button
                              className="button primary"
                              onClick={() => void copy(rec.prompt)}
                            >
                              Copiar prompt
                            </button>
                            <button
                              className="button secondary"
                              disabled={saving}
                              onClick={() =>
                                void run(async () => {
                                  await store.put("prompts", {
                                    id: uid(),
                                    title: goal.slice(0, 200),
                                    text: rec.prompt,
                                    updatedAt: Date.now(),
                                  });
                                  setNotice(
                                    "Prompt guardado en tu biblioteca.",
                                  );
                                })
                              }
                            >
                              Guardar
                            </button>
                            <a
                              className="button secondary"
                              href={
                                rec.tool === "Codex"
                                  ? "https://chatgpt.com/codex"
                                  : "https://chatgpt.com"
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Abrir herramienta
                              <ArrowUpRight size={15} />
                            </a>
                          </div>
                        </>
                      ) : (
                        <>
                          <Sparkles size={36} />
                          <h2>Una intención, un camino.</h2>
                          <p>
                            Tu recomendación aparecerá acá.
                            <br />
                            Las reglas locales también funcionan offline.
                          </p>
                        </>
                      )}
                    </section>
                  </div>
                </>
              )}
              {tab === "prompts" && (
                <>
                  <div className="section-title">
                    <h2>Guardados para volver a usar</h2>
                    <button
                      className="button secondary"
                      onClick={() =>
                        setPromptEdit({
                          id: uid(),
                          title: "",
                          text: "",
                          updatedAt: Date.now(),
                        })
                      }
                    >
                      <Plus size={17} />
                      Nuevo prompt
                    </button>
                  </div>
                  <div className="project-grid">
                    {data.prompts
                      .filter((p) => matches(p.title, p.text))
                      .map((p) => (
                        <article key={p.id} className="panel prompt-card">
                          <BookOpen size={20} />
                          <h2>{p.title}</h2>
                          <pre>{p.text}</pre>
                          <div className="button-row">
                            <button
                              className="button secondary"
                              onClick={() => void copy(p.text)}
                            >
                              Copiar
                            </button>
                            <button
                              className="button secondary"
                              onClick={() => setPromptEdit({ ...p })}
                            >
                              Editar
                            </button>
                          </div>
                        </article>
                      ))}
                  </div>
                  {!data.prompts.filter((p) => matches(p.title, p.text))
                    .length && (
                    <div className="empty">
                      Todavía no hay prompts para mostrar.
                    </div>
                  )}
                </>
              )}
              {tab === "settings" && (
                <div className="two-columns">
                  <div className="stack">
                    <section className="panel">
                      <div className="panel-icon">
                        <Cloud size={23} />
                      </div>
                      <h2>Cuenta y sincronización</h2>
                      {!store.configured ? (
                        <>
                          <p className="muted">
                            Estás en modo local. No hay un proyecto Firebase
                            vinculado todavía. Los datos quedan en este
                            navegador.
                          </p>
                          <div className="subtle-box">
                            Para conectar la nube, seguí la guía Firebase del
                            repositorio. No necesitás una cuenta para usar el
                            modo local.
                          </div>
                        </>
                      ) : user ? (
                        <>
                          <p className="muted">
                            Sesión iniciada como <strong>{user.email}</strong>
                          </p>
                          <p className="sync-description">{syncLabel}</p>
                          {!user.emailVerified && (
                            <>
                              <p className="muted small">
                                Para usar el modelo remoto, verificá tu email.
                              </p>
                              <button
                                className="button secondary"
                                disabled={saving || !online}
                                onClick={() =>
                                  void run(async () => {
                                    await store.verifyEmail();
                                    setNotice(
                                      "Email de verificación enviado. Revisá tu bandeja.",
                                    );
                                  })
                                }
                              >
                                Enviar verificación
                              </button>
                            </>
                          )}
                          <button
                            className="button secondary"
                            disabled={store.busy || pending || !online}
                            onClick={() => void run(() => store.logout())}
                          >
                            <LogOut size={16} />
                            Cerrar sesión y limpiar caché
                          </button>
                          <p className="muted small">
                            En dispositivos compartidos, cerrá las otras
                            pestañas antes de salir. La caché local de tu cuenta
                            se limpia al cerrar sesión.
                          </p>
                          {data.projects.length === 0 && !cached && (
                            <button
                              className="button primary"
                              disabled={saving}
                              onClick={() =>
                                void run(() =>
                                  store.importData(seedWorkspace()),
                                )
                              }
                            >
                              Crear proyectos iniciales
                            </button>
                          )}
                          <button
                            className="button secondary"
                            disabled={saving}
                            onClick={() =>
                              void run(async () => {
                                const guest = await readWorkspace();
                                if (!guest)
                                  throw Error(
                                    "No hay datos locales para importar.",
                                  );
                                setConfirmImport(validateWorkspace(guest));
                              })
                            }
                          >
                            Importar datos del modo local
                          </button>
                        </>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            void run(() =>
                              store.login(email, password, signup),
                            );
                          }}
                        >
                          <p className="muted">
                            La cuenta usa un espacio separado. Tus datos locales
                            se conservan hasta que decidas importarlos.
                          </p>
                          <label>
                            Email
                            <input
                              type="email"
                              autoComplete="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </label>
                          <label>
                            Contraseña
                            <input
                              type="password"
                              autoComplete={
                                signup ? "new-password" : "current-password"
                              }
                              minLength={6}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </label>
                          <button
                            className="button primary full"
                            disabled={store.busy || saving || !online}
                          >
                            {signup ? "Crear cuenta" : "Iniciar sesión"}
                          </button>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => setSignup(!signup)}
                          >
                            {signup ? "Ya tengo cuenta" : "Crear una cuenta"}
                          </button>
                          <button
                            type="button"
                            className="text-button"
                            disabled={!email || saving || !online}
                            onClick={() =>
                              void run(async () => {
                                await store.resetPassword(email);
                                setNotice(
                                  "Si el email corresponde a una cuenta, recibirás las instrucciones de recuperación.",
                                );
                              })
                            }
                          >
                            Recuperar contraseña
                          </button>
                          <p className="muted small">
                            Usá persistencia de cuenta solo en dispositivos de
                            confianza.
                          </p>
                        </form>
                      )}
                    </section>
                    <section className="panel">
                      <h2>Respaldo de tu espacio</h2>
                      <p className="muted">
                        Exportá proyectos, tareas y prompts. El archivo incluye
                        tus notas: guardalo en un lugar seguro.
                      </p>
                      <div className="button-row">
                        <button
                          className="button secondary"
                          onClick={exportData}
                        >
                          <Download size={16} />
                          Exportar JSON
                        </button>
                        <button
                          className="button secondary"
                          onClick={() => fileRef.current?.click()}
                        >
                          <Upload size={16} />
                          Importar JSON
                        </button>
                      </div>
                      <input
                        type="file"
                        accept="application/json,.json"
                        hidden
                        ref={fileRef}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (!f) return;
                          void run(async () => {
                            if (f.size > 5_000_000)
                              throw Error(
                                "El respaldo debe pesar menos de 5 MB.",
                              );
                            setConfirmImport(
                              validateWorkspace(JSON.parse(await f.text())),
                            );
                          });
                        }}
                      />
                      <p className="muted small">
                        La importación combina por ID y actualiza los registros
                        coincidentes. No borra los demás.
                      </p>
                    </section>
                  </div>
                  <div className="stack">
                    <section className="panel">
                      <h2>Siempre a mano</h2>
                      <p className="muted">
                        Instalá FACU HUB en tu pantalla de inicio para trabajar
                        con menos distracciones.
                      </p>
                      <button
                        className="button secondary"
                        onClick={() => setInstallHelp(true)}
                      >
                        Cómo instalar en iPhone
                        <ArrowUpRight size={16} />
                      </button>
                      <div className="status-list">
                        <div>
                          <span>Aplicación offline</span>
                          <strong>
                            {offlineReady
                              ? "Preparada"
                              : navigator.serviceWorker?.controller
                                ? "Disponible"
                                : "Pendiente de preparar"}
                          </strong>
                        </div>
                        <div>
                          <span>Datos</span>
                          <strong>
                            {user
                              ? "Firestore + caché local"
                              : "IndexedDB local"}
                          </strong>
                        </div>
                        <div>
                          <span>Recomendador</span>
                          <strong>Reglas disponibles</strong>
                        </div>
                        <div>
                          <span>Modelo remoto</span>
                          <strong>
                            {import.meta.env.VITE_AI_ENDPOINT
                              ? "Endpoint configurado"
                              : "Sin conectar"}
                          </strong>
                        </div>
                      </div>
                      <p className="muted small">
                        El modo offline requiere una primera carga completa con
                        conexión. iOS puede eliminar datos del sitio por falta
                        de espacio; conservá respaldos.
                      </p>
                    </section>
                    <section className="panel">
                      <h2>Acerca de tu espacio</h2>
                      <p className="muted">
                        FACU AI HUB 5.1 STAGING
                        <br />
                        Diseñado para elegir, crear y avanzar.
                      </p>
                      <p className="muted small">
                        Los estados iniciales de los proyectos son referencias
                        importadas, no verificaciones automáticas de sus sitios
                        o repositorios.
                      </p>
                    </section>
                  </div>
                </div>
              )}
            </>
          )}
          <footer className="footer">
            FACU AI HUB <span>·</span> Un espacio para avanzar con intención.
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Navegación móvil">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "selected" : ""}
            aria-current={tab === t.id ? "page" : undefined}
            onClick={() => {
              setTab(t.id);
              setQuery("");
              window.scrollTo({ top: 0 });
            }}
          >
            <t.icon size={21} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
      {continuing && (
        <Modal
          title={`Continuar ${continuing.name}`}
          onClose={() => setContinuing(null)}
        >
          <Continuation
            project={continuing}
            tasks={data.tasks}
            master={findMasterProject(continuing.name, masterRegistry.snapshot?.projects || [])}
            masterSource={masterRegistry.mode === "live" ? "GitHub en línea" : masterRegistry.mode === "cache" ? "copia local del registro" : "no disponible"}
            copy={copy}
            edit={() => {
              setEditing({ ...continuing });
              setContinuing(null);
            }}
          />
        </Modal>
      )}
      {editing && (
        <Modal
          title={
            data.projects.some((p) => p.id === editing.id)
              ? "Editar proyecto"
              : "Nuevo proyecto"
          }
          onClose={() => setEditing(null)}
        >
          {store.error && <p role="alert">{store.error}</p>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                if (
                  (editing.url && !safeUrl(editing.url)) ||
                  (editing.github && !safeUrl(editing.github))
                )
                  throw Error("Usá enlaces http o https válidos.");
                if (editing.chatUrl && !validChatUrl(editing.chatUrl))
                  throw Error(
                    "Usá el enlace HTTPS real de una conversación de ChatGPT: https://chatgpt.com/c/…",
                  );
                await store.put("projects", {
                  ...editing,
                  name: editing.name.trim(),
                  updatedAt: Date.now(),
                });
                setEditing(null);
              });
            }}
          >
            <label>
              Nombre
              <input
                required
                maxLength={200}
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />
            </label>
            <div className="form-grid">
              <label>
                Categoría
                <input
                  maxLength={200}
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                />
              </label>
              <label>
                Prioridad
                <select
                  value={editing.priority}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      priority: e.target.value as Priority,
                    })
                  }
                >
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
              </label>
            </div>
            <div className="form-grid">
              <label>
                Estado
                <input
                  maxLength={100}
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({ ...editing, status: e.target.value })
                  }
                />
              </label>
              <label>
                Versión
                <input
                  maxLength={100}
                  value={editing.version}
                  onChange={(e) =>
                    setEditing({ ...editing, version: e.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Contexto
              <textarea
                rows={4}
                maxLength={10000}
                value={editing.notes}
                onChange={(e) =>
                  setEditing({ ...editing, notes: e.target.value })
                }
              />
            </label>
            <label>
              Próximo paso
              <input
                maxLength={1000}
                value={editing.next}
                onChange={(e) =>
                  setEditing({ ...editing, next: e.target.value })
                }
              />
            </label>
            <label>
              Chat principal (opcional)
              <input
                type="url"
                maxLength={2048}
                value={editing.chatUrl || ""}
                onChange={(e) =>
                  setEditing({ ...editing, chatUrl: e.target.value })
                }
                placeholder="https://chatgpt.com/c/…"
              />
            </label>
            <label>
              Fecha prevista (reportada)
              <input
                type="date"
                value={
                  editing.dueAt
                    ? new Date(editing.dueAt).toISOString().slice(0, 10)
                    : ""
                }
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    dueAt: e.target.value
                      ? Date.parse(e.target.value + "T23:59:59Z")
                      : 0,
                  })
                }
              />
            </label>
            <label>
              Web o demo
              <input
                type="url"
                maxLength={2048}
                value={editing.url}
                onChange={(e) =>
                  setEditing({ ...editing, url: e.target.value })
                }
              />
            </label>
            <label>
              Repositorio
              <input
                type="url"
                maxLength={2048}
                value={editing.github}
                onChange={(e) =>
                  setEditing({ ...editing, github: e.target.value })
                }
              />
            </label>
            <button
              className="button primary full"
              disabled={saving || !editing.name.trim()}
            >
              Guardar proyecto
            </button>
          </form>
        </Modal>
      )}
      {promptEdit && (
        <Modal title="Editar prompt" onClose={() => setPromptEdit(null)}>
          {store.error && <p role="alert">{store.error}</p>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await store.put("prompts", {
                  ...promptEdit,
                  updatedAt: Date.now(),
                });
                setPromptEdit(null);
              });
            }}
          >
            <label>
              Título
              <input
                required
                maxLength={200}
                value={promptEdit.title}
                onChange={(e) =>
                  setPromptEdit({ ...promptEdit, title: e.target.value })
                }
              />
            </label>
            <label>
              Instrucción
              <textarea
                required
                rows={10}
                maxLength={10000}
                value={promptEdit.text}
                onChange={(e) =>
                  setPromptEdit({ ...promptEdit, text: e.target.value })
                }
              />
            </label>
            <button className="button primary full" disabled={saving}>
              Guardar prompt
            </button>
          </form>
        </Modal>
      )}
      {confirmImport && (
        <Modal title="Importar respaldo" onClose={() => setConfirmImport(null)}>
          {store.error && <p role="alert">{store.error}</p>}
          <p>
            Se combinarán {confirmImport.projects.length} proyectos,{" "}
            {confirmImport.tasks.length} tareas, {confirmImport.sessions.length}{" "}
            sesiones y {confirmImport.prompts.length} prompts. Los registros con
            el mismo ID se actualizarán.
          </p>
          <p className="muted">
            Exportá primero tu espacio si querés conservar las versiones
            actuales.
          </p>
          <div className="button-row">
            <button className="button secondary" onClick={exportData}>
              Exportar actual
            </button>
            <button
              className="button primary"
              disabled={saving}
              onClick={() =>
                void run(async () => {
                  await store.importData(confirmImport);
                  setConfirmImport(null);
                  setNotice(
                    "Importación incorporada. En nube, revisá el estado de sincronización.",
                  );
                })
              }
            >
              Confirmar importación
            </button>
          </div>
        </Modal>
      )}
      {confirmDelete && (
        <Modal title="Eliminar tarea" onClose={() => setConfirmDelete(null)}>
          <p>
            ¿Eliminar “{confirmDelete.title}”? Esta acción no se puede deshacer.
          </p>
          <button
            className="button danger"
            disabled={saving}
            onClick={() =>
              void run(async () => {
                await store.remove("tasks", confirmDelete.id);
                setConfirmDelete(null);
              })
            }
          >
            Eliminar tarea
          </button>
        </Modal>
      )}
      {installHelp && (
        <Modal
          title="FACU HUB en tu iPhone"
          onClose={() => setInstallHelp(false)}
        >
          <ol className="install-steps">
            <li>Abrí la app con Safari desde una dirección HTTPS.</li>
            <li>Tocá Compartir y elegí “Agregar a inicio”.</li>
            <li>
              Abrila una vez con conexión y esperá a que el modo offline esté
              preparado.
            </li>
          </ol>
          <p className="muted">
            Las pestañas de Safari y la app instalada pueden usar
            almacenamientos separados. Exportá e importá tu respaldo o usá tu
            cuenta para transferir los datos.
          </p>
        </Modal>
      )}
    </div>
  );
}

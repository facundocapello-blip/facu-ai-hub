import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, RefreshCcw, ShieldCheck } from "lucide-react";
import {
  findMasterProject, MASTER_DOCUMENT_URL, MASTER_RAW_URL,
  parseMasterRegistry, REGISTRY_CACHE_KEY,
  type MasterRegistry, type MasterProject,
} from "../lib/masterRegistry";
import "./MasterRegistry.css";

type Mode = "loading" | "live" | "cache" | "error";
export interface RegistryState {
  snapshot: MasterRegistry | null;
  mode: Mode;
  refresh: (signal?: AbortSignal) => Promise<void>;
}
function cached(): MasterRegistry | null {
  try {
    const text = localStorage.getItem(REGISTRY_CACHE_KEY);
    return text ? parseMasterRegistry(text) : null;
  } catch {
    return null;
  }
}
/**
 * La fuente es pública. Se consulta al cargar y bajo petición.
 * Ninguna respuesta remota se copia a Firestore, IndexedDB ni al espacio del usuario.
 */
export function useMasterRegistry(): RegistryState {
  const [snapshot, setSnapshot] = useState<MasterRegistry | null>(cached);
  const [mode, setMode] = useState<Mode>("loading");
  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(MASTER_RAW_URL, { cache: "no-store", signal });
      if (!response.ok) throw Error("No se pudo consultar el registro.");
      const markdown = await response.text();
      const parsed = parseMasterRegistry(markdown);
      if (signal?.aborted) return;
      setSnapshot(parsed);
      setMode("live");
      try { localStorage.setItem(REGISTRY_CACHE_KEY, markdown); } catch { /* sin caché */ }
    } catch {
      if (signal?.aborted) return;
      setMode((current) => current === "live" || cached() ? "cache" : "error");
      setSnapshot((current) => current || cached());
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);
  return { snapshot, mode, refresh };
}

export function MasterVersion({ name, state }: { name: string; state: RegistryState }) {
  const entry = findMasterProject(name, state.snapshot?.projects || []);
  if (!entry) return null;
  return (
    <div className="master-version" aria-label={"Registro maestro de " + name}>
      <small>REGISTRO AUDITADO · {state.mode === "cache" ? "copia guardada" : "fuente pública"}</small>
      <strong>{entry.status}</strong>
      <span>Tu versión guardada arriba no se modifica automáticamente.</span>
    </div>
  );
}
function Item({ entry }: { entry: MasterProject }) {
  return (
    <li className="master-item">
      <div className="master-item-heading">
        <strong>{entry.name}</strong>
        <span>{entry.priority}</span>
      </div>
      <p>{entry.status}</p>
      <details>
        <summary>Ver evidencia y próximo paso</summary>
        <p><b>Evidencia:</b> {entry.evidence}</p>
        <p><b>Próximo paso:</b> {entry.next}</p>
        {entry.url && (
          <a href={entry.url} target="_blank" rel="noopener noreferrer">
            Abrir referencia <ArrowUpRight size={13} />
          </a>
        )}
      </details>
    </li>
  );
}
export function MasterRegistryPanel({ state }: { state: RegistryState }) {
  const [showAll, setShowAll] = useState(false);
  const projects = state.snapshot?.projects || [];
  const visible = showAll ? projects : projects.filter((p) => p.priority === "P1" || p.priority === "P2");
  return (
    <section className="panel master-panel" aria-labelledby="master-title">
      <div className="master-panel-top">
        <div>
          <span className="eyebrow"><ShieldCheck size={14} /> CONTINUIDAD DE PROYECTOS</span>
          <h2 id="master-title">Último registro auditado</h2>
          <p className="muted">
            Información revisada por el coordinador, distinta de los datos personales del Hub.
            No se reemplazan tus proyectos ni se repiten pruebas antiguas por defecto.
          </p>
        </div>
        <button className="button secondary master-refresh" type="button"
          onClick={() => void state.refresh()} aria-label="Actualizar registro maestro">
          <RefreshCcw size={16} /> Actualizar
        </button>
      </div>
      <div className="master-source" aria-live="polite">
        {state.mode === "live"
          ? "Consultado desde GitHub"
          : state.mode === "cache"
            ? "Sin conexión a GitHub · mostrando última copia guardada"
            : state.mode === "loading"
              ? "Consultando registro…"
              : "Registro no disponible. Tus datos del Hub siguen intactos."}
        {state.snapshot && " · Actualización registrada: " + state.snapshot.updated}
        {state.snapshot && " · " + projects.length + " proyectos y flujos"}
      </div>
      {!!visible.length && (
        <>
          <ul className="master-list">
            {visible.map((p) => <Item entry={p} key={p.name} />)}
          </ul>
          <button className="button secondary master-toggle" type="button"
            onClick={() => setShowAll(!showAll)}>
            {showAll ? "Mostrar prioridades" : "Ver todos los " + projects.length + " proyectos y flujos"}
          </button>
        </>
      )}
      <a href={MASTER_DOCUMENT_URL} target="_blank" rel="noopener noreferrer" className="master-source-link">
        Consultar documento y fuentes en GitHub <ArrowUpRight size={13} />
      </a>
    </section>
  );
}

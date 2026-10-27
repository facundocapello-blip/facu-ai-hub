import type { Project, Workspace } from "./types";
import type { MasterProject } from "./masterRegistry";
import { findMasterProject } from "./masterRegistry";
import { prioritize, type Action } from "./assistant";

export interface ReconciledProject {
  personal: Project;
  master?: MasterProject;
  /** Estado vigente de presentación; jamás se escribe en la cuenta del usuario. */
  displayedStatus: string;
  displayedNext: string;
  displayedUrl: string;
  changed: boolean;
}
/** Concilia solamente en memoria. No modifica proyectos, tareas, IDs ni Firebase. */
export function reconcileProject(personal: Project, entries: MasterProject[]): ReconciledProject {
  const master = findMasterProject(personal.name, entries);
  return {
    personal,
    master,
    displayedStatus: master?.status || personal.status,
    displayedNext: master?.next || personal.next,
    displayedUrl: master?.url || personal.url,
    changed: Boolean(master && (master.status !== personal.status || master.next !== personal.next)),
  };
}

/** Genera recomendaciones actuales sin reescribir el workspace ni cerrar tareas antiguas. */
export function prioritizeReconciled(
  data: Workspace,
  entries: MasterProject[],
  now = Date.now(),
): Action[] {
  return prioritize(data, now).map((action) => {
    const view = reconcileProject(action.project, entries);
    if (!view.master) return action;
    const onlyProject = !action.task;
    return {
      ...action,
      title: onlyProject ? view.displayedNext || "Revisar registro auditado" : action.title,
      reason: onlyProject
        ? "Registro auditado: " + view.master.status + " · Próximo paso verificado documentalmente"
        : "Tarea guardada por vos (reconfirmar vigencia) · Registro auditado: " + view.master.status,
    };
  });
}

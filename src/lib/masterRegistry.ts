/**
 * Vista pública y de solo lectura del registro maestro.
 * Fuente auditada en otra rama; nunca sobrescribir proyectos ni tareas privadas.
 */
export const MASTER_DOCUMENT_URL =
  "https://github.com/facundocapello-blip/facu-ai-hub/blob/audit/version-index-2026-10-24/docs/PROJECT_MASTER_CURRENT.md";
export const MASTER_RAW_URL =
  "https://raw.githubusercontent.com/facundocapello-blip/facu-ai-hub/audit/version-index-2026-10-24/docs/PROJECT_MASTER_CURRENT.md";
export const REGISTRY_CACHE_KEY = "facu-master-registry-public-v1";

export interface MasterProject {
  priority: string;
  name: string;
  status: string;
  evidence: string;
  next: string;
  url: string;
}
export interface MasterRegistry {
  projects: MasterProject[];
  updated: string;
}

/** Solo interpreta la matriz, sin suponer que sus estados son todos validados. */
export function parseMasterRegistry(markdown: string): MasterRegistry {
  if (markdown.length > 150_000) throw Error("El registro supera el límite de lectura.");
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) =>
    /^\|\s*Prioridad\s*\|\s*Proyecto\s*\|\s*Estado más reciente\s*\|/.test(line),
  );
  if (start < 0) throw Error("No se encontró la matriz del registro maestro.");
  const projects: MasterProject[] = [];
  for (let i = start + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("|")) break;
    const fields = line.split(/(?<!\\)\|/).slice(1, -1).map((value) =>
      value.trim().replace(/\\\|/g, "|"),
    );
    if (fields.length !== 6 || !/^(P[1-4]|PERM)$/.test(fields[0])) continue;
    const [priority, name, status, evidence, next, sourceUrl] = fields;
    if (!name || !status) continue;
    let url = "";
    if (sourceUrl && sourceUrl !== "—") {
      try {
        const value = new URL(sourceUrl);
        if (value.protocol === "https:" && !value.username && !value.password)
          url = value.href;
      } catch {
        // Sin enlace público comprobable.
      }
    }
    projects.push({ priority, name, status, evidence, next, url });
  }
  if (!projects.length) throw Error("La matriz no contiene proyectos válidos.");
  const updated =
    markdown.match(/^\*\*Última actualización:\*\*\s*([0-9-]+)/m)?.[1] ||
    markdown.match(/^# Registro maestro actual — (.+?) \(ART\)/m)?.[1] ||
    "sin fecha";
  return { projects, updated };
}
function norm(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim().toLocaleLowerCase("es");
}
/** Correspondencia exacta y aliases explícitos: no hacer fusiones dudosas. */
export function findMasterProject(name: string, projects: MasterProject[]): MasterProject | undefined {
  const aliases: Record<string, string> = {
    "mambapalabra": "Mambapalabra estable",
    "juego sobrinas": "Juego sobrinas",
    "facu ai hub": "FACU AI HUB",
    "henris gallery": "Henris Gallery",
    "margoush": "MARGOUSH",
    "black mamba": "BLACK MAMBA",
    "exiliados": "EXILIADOS",
    "cepiphone": "Cepiphone",
    "sap hcm pt/tm": "SAP HCM PT/TM",
  };
  const target = aliases[norm(name)] || name;
  return projects.find((p) => norm(p.name) === norm(target));
}

export const intents = [
  "desarrollo",
  "sap",
  "operaciones",
  "analisis",
  "creativo",
] as const;
export type Intent = (typeof intents)[number];
export interface Recommendation {
  intent: Intent;
  tool: string;
  reason: string;
  next: string;
  source: "local" | "modelo";
  prompt: string;
}
const rules: {
  intent: Intent;
  regex: RegExp;
  tool: string;
  reason: string;
  next: string;
}[] = [
  {
    intent: "sap",
    regex: /\b(sap|hcm|pt60|pcr|nomina|ausencias|contingentes|esquemas?)\b/g,
    tool: "ChatGPT · SAP HCM",
    reason:
      "La tarea requiere diagnóstico funcional y trazabilidad en gestión de tiempos.",
    next: "Reuní el log de evaluación y las reglas implicadas.",
  },
  {
    intent: "desarrollo",
    regex:
      /\b(codigo|bug|error|react|css|iphone|audio|juego|desarroll\w*|program\w*|firebase|pwa|test|debug|correg\w*|implementar)\b/g,
    tool: "Codex",
    reason:
      "La intención requiere revisar código, implementar y comprobar cambios.",
    next: "Identificá el repositorio y reproducí el comportamiento.",
  },
  {
    intent: "operaciones",
    regex:
      /\b(excel|crm|automat\w*|planilla|ventas|pagos|deudores|workflow|appsheet|operaciones)\b/g,
    tool: "Work",
    reason: "La tarea combina procesos, datos y seguimiento operativo.",
    next: "Identificá la fuente de datos y el resultado esperado.",
  },
  {
    intent: "creativo",
    regex: /\b(imagen|diseno|video|creativ\w*|ilustr\w*|instagram|visual)\b/g,
    tool: "ChatGPT",
    reason: "La tarea requiere explorar o producir una dirección creativa.",
    next: "Definí formato, audiencia y una referencia visual.",
  },
];
export function classifyIntent(
  text: string,
): Omit<Recommendation, "source" | "prompt"> {
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const scored = rules
    .map((r) => ({ r, score: [...normalized.matchAll(r.regex)].length }))
    .sort((a, b) => b.score - a.score);
  if (!scored[0]?.score)
    return {
      intent: "analisis",
      tool: "ChatGPT",
      reason:
        "Conviene aclarar el objetivo y ordenar la información disponible.",
      next: "Definí el resultado esperado y las restricciones.",
    };
  const { intent, tool, reason, next } = scored[0].r;
  return { intent, tool, reason, next };
}
export function buildRecommendation(
  goal: string,
  project: { name: string; notes: string },
  remoteIntent?: Intent,
): Recommendation {
  let rec = classifyIntent(goal);
  if (remoteIntent) {
    const r = rules.find((r) => r.intent === remoteIntent);
    rec = r
      ? { intent: r.intent, tool: r.tool, reason: r.reason, next: r.next }
      : {
          intent: "analisis",
          tool: "ChatGPT",
          reason: "La tarea requiere análisis y planificación.",
          next: "Definí fuentes y restricciones.",
        };
  }
  return {
    ...rec,
    source: remoteIntent ? "modelo" : "local",
    prompt: `Actuá como especialista en ${rec.intent}.\n\nPROYECTO: ${project.name}\nOBJETIVO: ${goal}\nCONTEXTO A VERIFICAR: ${project.notes}\nHERRAMIENTA SUGERIDA: ${rec.tool}\n\nVerificá el estado real antes de actuar. Conservá la base existente. Separá hechos de hipótesis. Proponé y ejecutá pruebas pertinentes. No publiques ni modifiques producción sin autorización. Entregá resultado, evidencia y pendientes concretos en español.`,
  };
}

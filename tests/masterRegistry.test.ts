import { describe, expect, it } from "vitest";
import { findMasterProject, parseMasterRegistry } from "../src/lib/masterRegistry";

const md = [
  "# Registro maestro actual — 26/10/2026 (ART)",
  "## Matriz de continuidad",
  "| Prioridad | Proyecto | Estado más reciente | Evidencia / alcance | Próxima acción sin repetir trabajo | URL |",
  "|---|---|---|---|---|---|",
  "| P1 | Henris Gallery | STAGING Gemini Fusion | main \`2878a81\` | No repetir pruebas antiguas | https://example.org/henris |",
  "| P2 | Mambapalabra estable | B1.13.1 | release | Conservar producción | https://example.org/estable |",
  "| P2 | Mambapalabra STAGING | RC6 Fish398 | workflow | Probar audio físico | https://example.org/rc6 |",
  "| P3 | Sin web | Solo reportado | No verificado | Buscar fuente | javascript:alert(1) |",
  "",
  "**Última actualización:** 2026-10-26.",
].join("\n");
describe("registro maestro de solo lectura", () => {
  it("lee filas válidas y diferencia estable vs STAGING", () => {
    const parsed = parseMasterRegistry(md);
    expect(parsed.updated).toBe("2026-10-26");
    expect(parsed.projects).toHaveLength(4);
    expect(findMasterProject("Mambapalabra", parsed.projects)?.status).toBe("B1.13.1");
    expect(findMasterProject("Mambapalabra STAGING", parsed.projects)?.status).toBe("RC6 Fish398");
    expect(findMasterProject("Henris Gallery", parsed.projects)?.name).toBe("Henris Gallery");
  });
  it("rechaza enlaces no HTTPS e inventarios inválidos", () => {
    const parsed = parseMasterRegistry(md);
    expect(parsed.projects[3].url).toBe("");
    expect(() => parseMasterRegistry("texto viejo")).toThrow();
    expect(() => parseMasterRegistry("a".repeat(151000))).toThrow();
  });
});

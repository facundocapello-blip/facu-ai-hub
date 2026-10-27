import { describe, expect, it } from "vitest";
import { reconcileProject, prioritizeReconciled } from "../src/lib/reconciliation";
import { seedWorkspace } from "../src/lib/seeds";
import { packagedMaster } from "../src/data/masterSnapshot";

describe("conciliación automática segura", () => {
  it("actualiza la vista sin alterar los datos ni los vínculos del usuario", () => {
    const data = seedWorkspace();
    const before = JSON.stringify(data);
    const project = data.projects.find((p) => p.name === "Mambapalabra")!;
    const result = reconcileProject(project, packagedMaster.projects);
    expect(result.displayedStatus).toContain("B1.13.1");
    expect(result.displayedStatus).not.toContain("v0.9");
    expect(result.changed).toBe(true);
    expect(project.version).toContain("v0.9");
    expect(JSON.stringify(data)).toBe(before);
    expect(result.personal).toBe(project);
  });

  it("muestra lo que hay en el espacio cuando no hay coincidencia auditada", () => {
    const p = seedWorkspace().projects[0];
    const result = reconcileProject(p, []);
    expect(result.master).toBeUndefined();
    expect(result.displayedStatus).toBe(p.status);
    expect(result.displayedNext).toBe(p.next);
    expect(result.changed).toBe(false);
  });

  it("no mezcla los estados de Mambapalabra estable y RC6 STAGING", () => {
    const original = seedWorkspace().projects.find((p) => p.name === "Mambapalabra")!;
    const a = reconcileProject(original, packagedMaster.projects);
    expect(a.displayedStatus).toContain("estable");
    expect(a.displayedStatus).not.toContain("RC6");
    const b = reconcileProject({ ...original, name: "Mambapalabra STAGING" }, packagedMaster.projects);
    expect(b.displayedStatus).toContain("RC6");
  });

  it("prioriza el próximo paso auditado sin modificar proyectos o tareas", () => {
    const data = seedWorkspace();
    const before = JSON.stringify(data);
    const actions = prioritizeReconciled(data, packagedMaster.projects, Date.now());
    expect(actions.length).toBeGreaterThan(0);
    const henris = actions.find((a) => a.project.name === "Henris Gallery");
    expect(henris).toBeDefined();
    expect(henris?.title).toContain("No reabrir");
    expect(henris?.reason).toContain("Registro auditado");
    expect(JSON.stringify(data)).toBe(before);
  });

  it("conserva una tarea del usuario y advierte que requiere reconfirmación", () => {
    const data = seedWorkspace();
    data.tasks.push({
      id: "old-task", projectId: "henris", title: "Probar circuito antiguo",
      status: "Pendiente", priority: "Alta", updatedAt: 0,
    });
    const result = prioritizeReconciled(data, packagedMaster.projects, Date.now());
    const old = result.find((a) => a.task?.id === "old-task");
    expect(old?.title).toBe("Probar circuito antiguo");
    expect(old?.reason).toContain("reconfirmar vigencia");
    expect(data.tasks[0].status).toBe("Pendiente");
  });
});

import { test, expect } from "@playwright/test";
test("projects, tasks and recommendations persist on mobile without tracking", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Todo bajo control." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nuevo proyecto" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("Proyecto de prueba");
  await page.getByLabel("Contexto", { exact: true }).fill("Contexto personal");
  await page.getByRole("button", { name: "Guardar proyecto" }).click();
  await expect(
    page.getByRole("heading", { name: "Proyecto de prueba", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Proyecto de prueba", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Nueva tarea", { exact: true })
    .fill("Corregir audio en iPhone");
  await page
    .getByLabel("Proyecto de la tarea", { exact: true })
    .selectOption({ label: "Proyecto de prueba" });
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await expect(
    page.getByText("Corregir audio en iPhone", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Crear prompt para Corregir audio en iPhone" })
    .click();
  await page.getByRole("button", { name: "Recomendar flujo" }).click();
  await expect(
    page.getByRole("heading", { name: "Codex", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Navegación móvil" })
    .getByRole("button", { name: "Proyectos" })
    .click();
  await expect(
    page.getByRole("button", { name: "Trackear", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Tracking", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("SESIÓN ACTUAL", { exact: true })).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("PWA opens and edits data offline after a fresh page load", async ({
  page,
  context,
}) => {
  await page.goto("./");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Todo bajo control." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nuevo proyecto" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("Proyecto offline");
  await page.getByRole("button", { name: "Guardar proyecto" }).click();
  await expect(
    page.getByRole("heading", { name: "Proyecto offline", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Proyecto offline", exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
});
test("migrates 4.5 data and tolerates corrupt localStorage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("seeded")) {
      localStorage.setItem(
        "facu_hub_projects",
        JSON.stringify([
          {
            id: "8",
            name: "Mi SAP anterior",
            category: "SAP",
            priority: "Alta",
            notes: "Mi contexto",
          },
        ]),
      );
      localStorage.setItem(
        "facu_hub_tracking",
        JSON.stringify({
          projectId: "8",
          active: true,
          startTime: 1,
          elapsed: 42,
        }),
      );
      sessionStorage.setItem("seeded", "true");
    }
  });
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Mi SAP anterior" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Tracking", exact: true }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("facu_hub_tracking")!).elapsed,
    ),
  ).toBe(42);
});

test("recovers corrupt legacy projects without deleting the original", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("facu_hub_projects", "{broken"),
  );
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Henris Gallery", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "No se pudo leer facu_hub_projects; el original se conserva.",
      { exact: true },
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("facu_hub_projects")),
  ).toBe("{broken");
});

test("independent local tabs retain each other’s writes", async ({
  page,
  context,
}) => {
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Henris Gallery", exact: true }),
  ).toBeVisible();
  const second = await context.newPage();
  await second.goto("./");
  await expect(
    second.getByRole("heading", { name: "Henris Gallery", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nuevo proyecto" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("Proyecto compartido");
  await page.getByRole("button", { name: "Guardar proyecto" }).click();
  await expect(
    second.getByRole("heading", { name: "Proyecto compartido", exact: true }),
  ).toBeVisible();
  await second
    .getByLabel("Nueva tarea", { exact: true })
    .fill("Tarea desde otra pestaña");
  await second.getByRole("button", { name: "Agregar", exact: true }).click();
  await expect(
    page.getByText("Tarea desde otra pestaña", { exact: true }),
  ).toBeVisible();
  await second.close();
});

test("V5.1 priorities, chat links, offline postponement and task resolution", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto("./");
  await page
    .getByRole("button", { name: "Editar Henris Gallery", exact: true })
    .click();
  await page
    .getByLabel("Chat principal (opcional)")
    .fill("https://chatgpt.com/c/abc-123");
  await page.getByLabel("Fecha prevista (reportada)").fill("2026-01-01");
  await page.getByRole("button", { name: "Guardar proyecto" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByLabel("Nueva tarea", { exact: true })
    .fill("Resolver bloqueo de Henris");
  await page
    .getByLabel("Proyecto de la tarea", { exact: true })
    .selectOption({ label: "Henris Gallery" });
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Navegación móvil" })
    .getByRole("button", { name: "IA Hub" })
    .click();
  const actions = page.locator(".action-card");
  await expect(actions).toHaveCount(3);
  const henris = actions.filter({
    has: page.getByRole("heading", {
      name: "Resolver bloqueo de Henris",
      exact: true,
    }),
  });
  await expect(henris).toBeVisible();
  await expect(henris).toContainText("Fecha vencida");
  await henris.getByRole("button", { name: "Continuar con ChatGPT" }).click();
  await expect(page.getByLabel("Resumen para ChatGPT")).toContainText(
    "Versión reportada",
  );
  await expect(page.getByLabel("Resumen para ChatGPT")).toContainText(
    "Resolver bloqueo de Henris",
  );
  await expect(
    page.getByRole("link", { name: "Abrir chat principal" }),
  ).toHaveAttribute("href", "https://chatgpt.com/c/abc-123");
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page
    .getByRole("navigation", { name: "Navegación móvil" })
    .getByRole("button", { name: "IA Hub" })
    .click();
  await henris.getByRole("button", { name: "Posponer 24 h" }).click();
  await expect(henris).toHaveCount(0);
  await page.reload();
  await page
    .getByRole("navigation", { name: "Navegación móvil" })
    .getByRole("button", { name: "IA Hub" })
    .click();
  await expect(henris).toHaveCount(0);
  await page.getByText("Revisar acciones pospuestas", { exact: true }).click();
  await page.getByRole("button", { name: "Reactivar tarea" }).click();
  await expect(henris).toBeVisible();
  await henris.getByRole("button", { name: "Marcar tarea terminada", exact: true }).click();
  await expect(henris).toHaveCount(0);
  await context.setOffline(false);
  await page.reload();
  await expect(
    page.locator(".task-row").filter({ hasText: "Resolver bloqueo de Henris" }),
  ).toContainText("Terminado");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const mamba = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Mambapalabra", exact: true }),
  });
  await expect(
    mamba.getByRole("button", { name: "Agregar enlace" }),
  ).toBeVisible();
});

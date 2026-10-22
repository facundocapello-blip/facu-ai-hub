import { test, expect } from "@playwright/test";
test("Auth, account isolation, Firestore offline edits and reconnection", async ({
  page,
  context,
  browser,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("button", { name: "Ajustes" })
    .click();
  await page
    .getByRole("button", { name: "Crear una cuenta", exact: true })
    .click();
  await page
    .getByLabel("Email", { exact: true })
    .fill(`facu-${Date.now()}@example.test`);
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("local-test-password");
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(
    page.getByText("Sesión iniciada como", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Crear proyectos iniciales" }).click();
  await expect(
    page.getByRole("button", { name: "Crear proyectos iniciales" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Cerrar sesión y limpiar caché" }),
  ).toBeEnabled();
  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("button", { name: "Proyectos" })
    .click();
  await expect(
    page.getByRole("heading", { name: "SAP HCM PT/TM", exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "Editar SAP HCM PT/TM", exact: true })
    .click();
  await page
    .getByLabel("Próximo paso", { exact: true })
    .fill("Cambio hecho offline");
  await page.getByRole("button", { name: "Guardar proyecto" }).click();
  await expect(
    page.getByText("Cambio hecho offline", { exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
  await expect(
    page.getByRole("button", { name: "Estado: Sincronizado. Abrir ajustes" }),
  ).toBeVisible({ timeout: 15000 });
  await page.reload();
  await expect(
    page.getByText("Cambio hecho offline", { exact: true }),
  ).toBeVisible();
  const other = await browser.newPage();
  await other.goto("/");
  await other
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("button", { name: "Ajustes" })
    .click();
  await expect(
    other.getByRole("button", { name: "Iniciar sesión", exact: true }),
  ).toBeVisible();
  await other.close();
  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("button", { name: "Ajustes" })
    .click();
  await page
    .getByRole("button", { name: "Cerrar sesión y limpiar caché" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Todo bajo control." }),
  ).toBeVisible();
  await expect(
    page.getByText("Cambio hecho offline", { exact: true }),
  ).toHaveCount(0);
});

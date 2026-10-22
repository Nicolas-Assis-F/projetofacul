import { test, expect } from "@playwright/test";

test("professor can register, lend, return, search and export", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Visão geral." }),
  ).toBeVisible();
  await expect(page.getByText("Grandes ideias começam")).toBeVisible();
  const suffix = Date.now();
  const person = `Pessoa de avaliação ${suffix}`;
  const equipment = `Equipamento de avaliação ${suffix}`;
  await page.getByRole("button", { name: "Pessoas", exact: true }).click();
  await page.getByRole("button", { name: "Nova pessoa" }).click();
  await page.getByLabel("Nome completo").fill(person);
  await page
    .getByLabel("E-mail", { exact: true })
    .fill(`avaliacao-${suffix}@example.com`);
  await page.getByRole("button", { name: "Salvar cadastro" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("textbox", { name: "Buscar pessoas" }).fill(person);
  await expect(page.getByText(person, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Equipamentos", exact: true }).click();
  await page.getByRole("button", { name: "Novo equipamento" }).click();
  await page.getByLabel("Nome do equipamento").fill(equipment);
  await page.getByRole("button", { name: "Salvar cadastro" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("textbox", { name: "Buscar equipamentos" })
    .fill(equipment);
  await page.getByRole("button", { name: "Emprestar", exact: true }).click();
  await page.getByRole("combobox", { name: "Pessoa responsável" }).click();
  await page.getByRole("option", { name: person, exact: true }).click();
  await page.getByRole("button", { name: "Confirmar empréstimo" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Emprestar", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: /Empréstimos/ })
    .first()
    .click();
  await page
    .getByRole("textbox", { name: "Buscar empréstimos" })
    .fill(equipment);
  await page.getByRole("button", { name: "Devolver", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirmar devolução", exact: true })
    .click();
  await expect(page.getByRole("alertdialog")).not.toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Devolvido", exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar" }).click();
  expect((await download).suggestedFilename()).toContain("campuslab-loans");
  await page.getByRole("button", { name: "Equipamentos", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Buscar equipamentos" })
    .fill(equipment);
  await expect(
    page.getByRole("button", { name: "Emprestar", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: `Editar ${equipment}` }).click();
  await page.getByLabel("Nome do equipamento").fill(`${equipment} atualizado`);
  await page.getByRole("button", { name: "Salvar cadastro" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByText(`${equipment} atualizado`, { exact: true }),
  ).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("mobile navigation, responsive layout, empty and error states", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByText("Grandes ideias começam")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
  await page.getByRole("button", { name: "Equipamentos", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Buscar equipamentos" })
    .fill("registro-que-nao-existe");
  await expect(page.getByText("Nenhum registro por aqui")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.route("**/api/v1/**", (route) => route.abort());
  await page.getByRole("button", { name: "Atualizar", exact: true }).click();
  await expect(page.getByText("Não foi possível sincronizar")).toBeVisible();
  await page.unroute("**/api/v1/**");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(
    page.getByText("Não foi possível sincronizar"),
  ).not.toBeVisible();
});

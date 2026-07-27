import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("supports navigation, overflow, filters, and keyboard operation", async ({
  page,
}) => {
  await page.goto("./");

  const anchors = page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link");
  await expect(anchors).toHaveCount(4);
  await anchors.nth(1).click();
  await expect(page).toHaveURL(/#table$/);

  const standings = page.getByRole("region", {
    name: /Premier League standings/,
  });
  await expect(standings).toHaveCSS("overflow-x", "auto");
  await page.setViewportSize({ width: 400, height: 800 });
  expect(
    await standings.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    ),
  ).toBe(true);

  const team = page.getByRole("searchbox", { name: "Team" });
  await team.fill("Fulham");
  await page
    .getByRole("combobox", { name: "Status" })
    .selectOption("SCHEDULED");
  await expect(page.getByRole("status")).toHaveText("1 match shown");
  await expect(page.locator("#fixture-rows tr")).toHaveCount(1);

  await team.focus();
  await expect(team).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("combobox", { name: "Status" })).toBeFocused();
});

test("announces fixture loading errors", async ({ page }) => {
  await page.goto("./?fixtures=error");
  await expect(page.getByRole("alert")).toContainText(
    "temporarily unavailable",
  );
  await expect(page.getByRole("searchbox", { name: "Team" })).toBeDisabled();
});

test("has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("./");
  const assetPaths = await page
    .locator('link[rel="stylesheet"], script[src]')
    .evaluateAll((elements) =>
      elements.map(
        (element) =>
          (element as HTMLLinkElement | HTMLScriptElement).src ||
          (element as HTMLLinkElement).href,
      ),
    );
  expect(
    assetPaths.every((path) =>
      new URL(path).pathname.startsWith("/premier-league-stats/"),
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

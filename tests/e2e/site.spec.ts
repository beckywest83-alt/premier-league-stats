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

  const results = page.locator(".results-list");
  const team = page.getByRole("combobox", { name: "Team" });
  const matchweek = page.getByRole("combobox", { name: "Matchweek" });
  await team.selectOption("Fulham FC");
  await matchweek.selectOption("38");
  await expect(page.locator(".results-state")).toHaveText("1 fixture shown.");
  await expect(results.locator(".matchweek-group")).toHaveCount(1);
  await expect(results.locator(".matchweek-group h3")).toHaveText(
    "Matchweek 38",
  );
  await expect(results.locator(".fixture-row")).toHaveCount(1);
  await expect(results.locator(".fixture-row .fixture-teams span")).toHaveText([
    "Luton Town FC",
    "Fulham FC",
  ]);

  await team.focus();
  await expect(team).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(matchweek).toBeFocused();
});

test("announces fixture loading errors", async ({ page }) => {
  await page.route("**/data/premier-league-2023-24-fixtures.json", (route) =>
    route.fulfill({ status: 503, body: "Service Unavailable" }),
  );
  await page.goto("./");

  await expect(page.locator(".results-state")).toHaveText(
    "Fixtures could not be loaded.",
  );
  await expect(page.locator(".results-list .error-state")).toHaveText(
    "Fixture request failed (503).",
  );
  await expect(page.getByRole("combobox", { name: "Team" })).toBeDisabled();
  await expect(
    page.getByRole("combobox", { name: "Matchweek" }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
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

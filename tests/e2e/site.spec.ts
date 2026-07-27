import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const snapshotPath = new URL(
  "../../public/data/premier-league-2025-26-fixtures.json",
  import.meta.url,
);
const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));

async function serveSnapshot(page: Page) {
  const body = structuredClone(snapshot);
  body.matches[0] = {
    ...body.matches[0],
    status: "finished",
    homeScore: 2,
    awayScore: 1,
  };
  await page.route("**/data/premier-league-2025-26-fixtures.json", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(body),
    }),
  );
}

test("shows all matchweeks, status states, team filtering, and keyboard operation", async ({
  page,
}) => {
  await serveSnapshot(page);
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
  await expect(matchweek.locator("option")).toHaveCount(39);

  for (const value of ["1", "19", "38"]) {
    await matchweek.selectOption(value);
    await expect(results.locator(".matchweek-group h3")).toHaveText(
      `Matchweek ${Number(value)}`,
    );
    await expect(results.locator(".fixture-row")).toHaveCount(10);
  }

  await matchweek.selectOption("1");
  await expect(results.locator(".fixture-score--finished").first()).toHaveText(
    "2 – 1",
  );
  await expect(results.locator(".fixture-score--scheduled").first()).toHaveText(
    "Scheduled",
  );

  await team.selectOption("Fulham FC");
  await matchweek.selectOption("38");
  await expect(page.locator(".results-state")).toHaveText("1 fixture shown.");
  await expect(results.locator(".fixture-teams span")).toHaveText([
    "Manchester City FC",
    "Fulham FC",
  ]);

  await team.focus();
  await expect(team).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(matchweek).toBeFocused();
});

test("announces fixture loading errors and offers a keyboard-accessible retry", async ({
  page,
}) => {
  await page.route("**/data/premier-league-2025-26-fixtures.json", (route) =>
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
  const retry = page.getByRole("button", { name: "Retry" });
  await retry.focus();
  await expect(retry).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".results-state")).toHaveText(
    "Fixtures could not be loaded.",
  );
});

test("has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await serveSnapshot(page);
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

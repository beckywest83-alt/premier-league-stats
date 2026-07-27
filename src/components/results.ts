import { fetchFixtures } from "../services/fixtures";
import type { Fixture } from "../types/football";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short",
});

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function fixtureSort(a: Fixture, b: Fixture): number {
  return (
    a.matchweek - b.matchweek ||
    Date.parse(a.kickoff) - Date.parse(b.kickoff) ||
    a.homeTeam.localeCompare(b.homeTeam) ||
    a.id.localeCompare(b.id)
  );
}

export interface FixtureTotals {
  fixtures: number;
  completed: number;
  goals: number;
}

export function initializeResults(
  root: HTMLElement,
  onLoaded?: (totals: FixtureTotals) => void,
): void {
  const heading = element("div", undefined, "panel-heading");
  const titleWrap = element("div");
  titleWrap.append(element("p", "Fixtures & results", "section-kicker"));
  const title = element("h2", "Results");
  title.id = "results-title";
  titleWrap.append(title);
  heading.append(titleWrap);
  const state = element("p", "Loading fixtures…", "results-state");
  state.setAttribute("aria-live", "polite");
  heading.append(state);

  const controls = element("div", undefined, "results-filters");
  const teamLabel = element("label", "Team");
  const team = element("select");
  teamLabel.append(team);
  const weekLabel = element("label", "Matchweek");
  const week = element("select");
  weekLabel.append(week);
  controls.append(teamLabel, weekLabel);
  const output = element("div", undefined, "results-list");
  root.replaceChildren(heading, controls, output);
  let fixtures: Fixture[] = [];

  function option(value: string, label: string): HTMLOptionElement {
    const item = element("option", label);
    item.value = value;
    return item;
  }
  function setDisabled(disabled: boolean): void {
    team.disabled = disabled;
    week.disabled = disabled;
  }

  function render(): void {
    output.replaceChildren();
    const selected = fixtures
      .filter(
        (fixture) =>
          (!team.value ||
            fixture.homeTeam === team.value ||
            fixture.awayTeam === team.value) &&
          (!week.value || fixture.matchweek === Number(week.value)),
      )
      .sort(fixtureSort);
    if (!selected.length) {
      state.textContent = "No fixtures match these filters.";
      output.append(
        element("p", "Try another team or matchweek.", "empty-state"),
      );
      return;
    }
    state.textContent = `${selected.length} ${selected.length === 1 ? "fixture" : "fixtures"} shown.`;
    const groups = new Map<number, Fixture[]>();
    selected.forEach((fixture) =>
      groups.set(fixture.matchweek, [
        ...(groups.get(fixture.matchweek) ?? []),
        fixture,
      ]),
    );
    for (const [matchweek, matches] of groups) {
      const section = element("section", undefined, "matchweek-group");
      section.append(element("h3", `Matchweek ${matchweek}`));
      for (const fixture of matches) {
        const match = element("article", undefined, "fixture-row");
        const teams = element("div", undefined, "fixture-teams");
        teams.append(
          element("span", fixture.homeTeam),
          element("span", fixture.awayTeam),
        );
        const statusLabels: Record<Fixture["status"], string> = {
          finished: "Finished",
          scheduled: "Scheduled",
          "in-play": "In play",
          paused: "Paused",
          postponed: "Postponed",
          suspended: "Suspended",
          cancelled: "Cancelled",
          awarded: "Awarded",
        };
        const result =
          fixture.status === "finished"
            ? `${fixture.homeScore} – ${fixture.awayScore}`
            : statusLabels[fixture.status];
        match.append(
          teams,
          element(
            "strong",
            result,
            `fixture-score fixture-score--${fixture.status}`,
          ),
          element(
            "time",
            dateFormatter.format(new Date(fixture.kickoff)),
            "fixture-date",
          ),
        );
        match.querySelector("time")?.setAttribute("datetime", fixture.kickoff);
        section.append(match);
      }
      output.append(section);
    }
  }

  async function load(): Promise<void> {
    state.textContent = "Loading fixtures…";
    setDisabled(true);
    output.replaceChildren();
    try {
      fixtures = await fetchFixtures();
      onLoaded?.({
        fixtures: fixtures.length,
        completed: fixtures.filter(({ status }) => status === "finished")
          .length,
        goals: fixtures.reduce(
          (total, fixture) =>
            fixture.status === "finished"
              ? total + (fixture.homeScore ?? 0) + (fixture.awayScore ?? 0)
              : total,
          0,
        ),
      });
      const teams = [
        ...new Set(
          fixtures.flatMap(({ homeTeam, awayTeam }) => [homeTeam, awayTeam]),
        ),
      ].sort((a, b) => a.localeCompare(b));
      const weeks = [
        ...new Set(fixtures.map(({ matchweek }) => matchweek)),
      ].sort((a, b) => a - b);
      team.replaceChildren(
        option("", "All teams"),
        ...teams.map((name) => option(name, name)),
      );
      week.replaceChildren(
        option("", "All matchweeks"),
        ...weeks.map((value) => option(String(value), `Matchweek ${value}`)),
      );
      setDisabled(false);
      render();
    } catch (error) {
      state.textContent = "Fixtures could not be loaded.";
      const message = element(
        "p",
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
        "error-state",
      );
      const retry = element("button", "Retry", "retry-button");
      retry.type = "button";
      retry.addEventListener("click", () => {
        void load();
      });
      output.replaceChildren(message, retry);
    }
  }
  team.addEventListener("change", render);
  week.addEventListener("change", render);
  void load();
}

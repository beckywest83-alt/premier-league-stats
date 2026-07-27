import "./styles.css";
import { renderScorers } from "./components/scorers";
import { renderStandings } from "./components/standings";
import { fixtures } from "./data/fixtures";
import {
  filterFixtures,
  normalizeFixture,
  renderFixtures,
  sortFixtures,
} from "./fixtures";
import type { FixtureStatus } from "./types/football";

const home = document.querySelector<HTMLElement>("#home");
const table = document.querySelector<HTMLElement>("#table");
const scorers = document.querySelector<HTMLElement>("#scorers");
const results = document.querySelector<HTMLElement>("#results");

if (!home || !table || !scorers || !results) {
  throw new Error("One or more application regions were not found.");
}

home.innerHTML = `<div><p class="eyebrow">Premier League</p><h1 id="page-title">The season,<br><em>by numbers.</em></h1></div>
  <div class="hero-copy"><p class="intro">The complete 2023/24 picture: every point, every goal, and the players who set the pace.</p><a class="cta" href="#table">Explore the final table</a></div>`;

table.innerHTML = renderStandings();
scorers.innerHTML = renderScorers();
results.innerHTML = `<div class="panel-heading"><div><p class="section-kicker">Match centre</p><h2 id="results-title">Fixtures</h2></div><span class="status">2023/24 &amp; 2024/25</span></div>
  <form class="fixture-filters" aria-label="Filter fixtures">
    <label>Team <input id="team-filter" name="team" type="search" autocomplete="off"></label>
    <label>Status <select id="status-filter" name="status"><option value="ALL">All</option><option value="FINISHED">Played</option><option value="SCHEDULED">Not played</option></select></label>
  </form>
  <p id="fixture-feedback" class="fixture-feedback" role="status" aria-live="polite"></p>
  <div class="table-scroll" tabindex="0" role="region" aria-label="Final-day results; scroll horizontally to see all columns"><table class="results-table">
    <caption>Selected Premier League fixtures</caption>
    <thead><tr><th scope="col">Home team</th><th scope="col"><abbr title="Home team score">H</abbr></th><th scope="col"><abbr title="Away team score">A</abbr></th><th scope="col">Away team</th></tr></thead>
    <tbody id="fixture-rows"></tbody>
  </table></div>`;

const teamFilter = document.querySelector<HTMLInputElement>("#team-filter");
const statusFilter =
  document.querySelector<HTMLSelectElement>("#status-filter");
const fixtureRows =
  document.querySelector<HTMLTableSectionElement>("#fixture-rows");
const fixtureFeedback =
  document.querySelector<HTMLElement>("#fixture-feedback");

if (!teamFilter || !statusFilter || !fixtureRows || !fixtureFeedback) {
  throw new Error("Fixture controls were not found.");
}

try {
  if (new URLSearchParams(window.location.search).get("fixtures") === "error") {
    throw new Error("Fixtures are temporarily unavailable.");
  }
  const normalizedFixtures = sortFixtures(fixtures.map(normalizeFixture));
  const updateFixtures = (): void => {
    const filtered = filterFixtures(normalizedFixtures, {
      team: teamFilter.value,
      status: statusFilter.value as FixtureStatus | "ALL",
    });
    fixtureRows.innerHTML = renderFixtures(filtered);
    fixtureFeedback.textContent = `${filtered.length} ${filtered.length === 1 ? "match" : "matches"} shown`;
  };
  teamFilter.addEventListener("input", updateFixtures);
  statusFilter.addEventListener("change", updateFixtures);
  updateFixtures();
} catch (error) {
  fixtureRows.innerHTML =
    '<tr><td colspan="4" class="error-state">Fixtures could not be loaded.</td></tr>';
  fixtureFeedback.setAttribute("role", "alert");
  fixtureFeedback.textContent =
    error instanceof Error ? error.message : "An unexpected error occurred.";
  teamFilter.disabled = true;
  statusFilter.disabled = true;
}

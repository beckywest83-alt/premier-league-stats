import "./styles.css";
import { renderScorers } from "./components/scorers";
import { renderStandings } from "./components/standings";
import { initializeResults } from "./components/results";

const home = document.querySelector<HTMLElement>("#home");
const table = document.querySelector<HTMLElement>("#table");
const scorers = document.querySelector<HTMLElement>("#scorers");
const results = document.querySelector<HTMLElement>("#results");

if (!home || !table || !scorers || !results) {
  throw new Error("One or more application regions were not found.");
}

home.innerHTML = `<div><p class="eyebrow">Premier League · 2025/26</p><h1 id="page-title">The season,<br><em>as it unfolds.</em></h1></div>
  <div class="hero-copy"><p class="intro">Explore the provisional Premier League schedule, table, and Golden Boot picture from one documented snapshot.</p><a class="cta" href="#results">Explore every fixture</a></div>
  <div class="summary-grid" aria-label="Season summary">
    <div class="summary-card"><strong>20</strong><span>clubs</span></div>
    <div class="summary-card"><strong id="match-total">—</strong><span>fixtures scheduled</span></div>
    <div class="summary-card"><strong id="goal-total">—</strong><span>goals at cutoff</span></div>
  </div>`;

table.insertAdjacentHTML(
  "beforebegin",
  `<ul class="view-filters" aria-label="Jump to a statistics view">
  <li><a href="#table" aria-current="true">Standings</a></li>
  <li><a href="#scorers">Top scorers</a></li>
  <li><a href="#results">Fixtures & results</a></li>
</ul>`,
);

table.innerHTML = renderStandings();
scorers.innerHTML = renderScorers();
initializeResults(results, ({ fixtures, goals }) => {
  const matchTotal = document.querySelector("#match-total");
  const goalTotal = document.querySelector("#goal-total");
  if (matchTotal) matchTotal.textContent = String(fixtures);
  if (goalTotal) goalTotal.textContent = String(goals);
});

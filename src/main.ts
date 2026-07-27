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

home.innerHTML = `<div><p class="eyebrow">Premier League · 2025/2026</p><h1 id="page-title">The season,<br><em>by numbers.</em></h1></div>
  <div class="hero-copy"><p class="intro">Explore the Premier League picture: every point, every goal, and the players who set the pace.</p><a class="cta" href="#table">Explore the final table</a></div>
  <div class="summary-grid" aria-label="Season summary">
    <div class="summary-card"><strong>20</strong><span>clubs</span></div>
    <div class="summary-card"><strong>380</strong><span>matches played</span></div>
    <div class="summary-card"><strong>1,246</strong><span>goals scored</span></div>
  </div>`;

table.insertAdjacentHTML(
  "beforebegin",
  `<ul class="view-filters" aria-label="Jump to a statistics view">
  <li><a href="#table" aria-current="true">Standings</a></li>
  <li><a href="#scorers">Top scorers</a></li>
  <li><a href="#results">Final day</a></li>
</ul>`,
);

table.innerHTML = renderStandings();
scorers.innerHTML = renderScorers();
initializeResults(results);

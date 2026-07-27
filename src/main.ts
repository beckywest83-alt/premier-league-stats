import "./styles.css";
import { renderScorers } from "./components/scorers";
import { renderStandings } from "./components/standings";

const home = document.querySelector<HTMLElement>("#home");
const table = document.querySelector<HTMLElement>("#table");
const scorers = document.querySelector<HTMLElement>("#scorers");
const results = document.querySelector<HTMLElement>("#results");

if (!home || !table || !scorers || !results) {
  throw new Error("One or more application regions were not found.");
}

home.innerHTML = `<div><p class="eyebrow">Premier League</p><h1 id="page-title">The season,<br><em>by numbers.</em></h1></div>
  <div class="hero-copy"><p class="intro">The complete 2023/24 picture: every point, every goal, and the players who set the pace.</p><a class="cta" href="#table">Explore the final table</a></div>
  <div class="summary-grid" aria-label="Season summary">
    <div class="summary-card"><strong>20</strong><span>clubs</span></div>
    <div class="summary-card"><strong>380</strong><span>matches played</span></div>
    <div class="summary-card"><strong>1,246</strong><span>goals scored</span></div>
  </div>`;

table.insertAdjacentHTML("beforebegin", `<ul class="view-filters" aria-label="Jump to a statistics view">
  <li><a href="#table" aria-current="true">Standings</a></li>
  <li><a href="#scorers">Top scorers</a></li>
  <li><a href="#results">Final day</a></li>
</ul>`);

table.innerHTML = renderStandings();
scorers.innerHTML = renderScorers();
results.innerHTML = `<div class="panel-heading"><div><p class="section-kicker">Final day</p><h2 id="results-title">Results</h2></div><span class="status">19 May 2024</span></div>
  <div class="table-scroll" tabindex="0" role="region" aria-label="Final-day results; scroll horizontally to see all columns"><table class="results-table">
    <caption>Selected Premier League results from the final day of the 2023/24 season</caption>
    <thead><tr><th scope="col">Home team</th><th scope="col"><abbr title="Home team score">H</abbr></th><th scope="col"><abbr title="Away team score">A</abbr></th><th scope="col">Away team</th></tr></thead>
    <tbody><tr><th scope="row">Arsenal</th><td>2</td><td>1</td><td>Everton</td></tr><tr><th scope="row">Manchester City</th><td>3</td><td>1</td><td>West Ham United</td></tr><tr><th scope="row">Liverpool</th><td>2</td><td>0</td><td>Wolverhampton Wanderers</td></tr></tbody>
  </table></div>`;

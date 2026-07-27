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

home.innerHTML = `<div><p class="eyebrow">Premier League</p><h1 id="page-title">The season,<br><em>by numbers.</em></h1></div>
  <div class="hero-copy"><p class="intro">The complete 2023/24 picture: every point, every goal, and the players who set the pace.</p><a class="cta" href="#table">Explore the final table</a></div>`;

table.innerHTML = renderStandings();
scorers.innerHTML = renderScorers();
initializeResults(results);

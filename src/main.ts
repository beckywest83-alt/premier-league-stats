import "./styles.css";
import { renderScorers } from "./components/scorers";
import { renderStandings } from "./components/standings";

const app = document.querySelector<HTMLElement>("#app");

if (!app) {
  throw new Error("Application root element was not found.");
}

app.innerHTML = `<div class="page-shell">
  <header class="hero" aria-labelledby="page-title">
    <p class="eyebrow">Premier League</p>
    <h1 id="page-title">The season,<br><em>by numbers.</em></h1>
    <p class="intro">The complete 2023/24 picture: every point, every goal, and the players who set the pace.</p>
  </header>
  <div class="dashboard">${renderStandings()}${renderScorers()}</div>
</div>`;

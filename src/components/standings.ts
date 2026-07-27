import { standings, standingsMetadata } from "../data/standings";
import type { Standing } from "../types/football";

export function validateStanding(standing: Standing): number {
  const goalDifference = standing.goalsFor - standing.goalsAgainst;
  const calculatedPoints = standing.won * 3 + standing.drawn + (standing.pointsAdjustment ?? 0);

  if (standing.played !== standing.won + standing.drawn + standing.lost) {
    throw new Error(`Matches played do not balance for ${standing.club}.`);
  }
  if (standing.points !== calculatedPoints) {
    throw new Error(`Points do not balance for ${standing.club}.`);
  }
  return goalDifference;
}

function renderStanding(standing: Standing): string {
  const goalDifference = validateStanding(standing);

  const modifier = standing.state ? ` standing-row--${standing.state}` : "";
  const adjustment = standing.pointsAdjustment
    ? `<span class="deduction" title="Points adjustment">${standing.pointsAdjustment}</span>`
    : "";

  return `<tr class="standing-row${modifier}">
    <td class="position">${standing.position}</td>
    <th scope="row"><span class="club-code">${standing.shortName}</span><span class="club-name">${standing.club}</span>${adjustment}</th>
    <td>${standing.played}</td><td>${standing.won}</td><td>${standing.drawn}</td><td>${standing.lost}</td>
    <td>${standing.goalsFor}</td><td>${standing.goalsAgainst}</td><td>${goalDifference > 0 ? "+" : ""}${goalDifference}</td>
    <td class="points">${standing.points}</td>
  </tr>`;
}

export function renderStandings(): string {
  return `<div class="panel-heading">
      <div><p class="section-kicker">League table</p><h2 id="standings-title">Standings</h2></div>
      <span class="status status--${standingsMetadata.status}">${standingsMetadata.season} · ${standingsMetadata.status}</span>
    </div>
    <div class="table-scroll" tabindex="0" role="region" aria-label="Premier League standings; scroll horizontally to see all columns"><table>
      <caption>Provisional Premier League standings for the 2025/26 season</caption>
      <thead><tr><th scope="col"><abbr title="Position">Pos</abbr></th><th scope="col">Club</th><th scope="col"><abbr title="Played">P</abbr></th><th scope="col"><abbr title="Won">W</abbr></th><th scope="col"><abbr title="Drawn">D</abbr></th><th scope="col"><abbr title="Lost">L</abbr></th><th scope="col"><abbr title="Goals for">GF</abbr></th><th scope="col"><abbr title="Goals against">GA</abbr></th><th scope="col"><abbr title="Goal difference">GD</abbr></th><th scope="col"><abbr title="Points">Pts</abbr></th></tr></thead>
      <tbody>${standings.map(renderStanding).join("")}</tbody>
    </table></div>
    <div class="table-notes"><p class="data-note">${standingsMetadata.note}</p></div>`;
}

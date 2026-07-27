import { standings, standingsMetadata } from "../data/standings";
import type { Standing } from "../types/football";

function renderStanding(standing: Standing): string {
  const goalDifference = standing.goalsFor - standing.goalsAgainst;
  const calculatedPoints = standing.won * 3 + standing.drawn + (standing.pointsAdjustment ?? 0);

  if (standing.played !== standing.won + standing.drawn + standing.lost) {
    throw new Error(`Matches played do not balance for ${standing.club}.`);
  }
  if (standing.points !== calculatedPoints) {
    throw new Error(`Points do not balance for ${standing.club}.`);
  }

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
  return `<section class="panel standings-panel" aria-labelledby="standings-title">
    <div class="panel-heading">
      <div><p class="section-kicker">League table</p><h2 id="standings-title">Standings</h2></div>
      <span class="status status--${standingsMetadata.status}">${standingsMetadata.season} · ${standingsMetadata.status}</span>
    </div>
    <div class="table-scroll"><table>
      <thead><tr><th scope="col">#</th><th scope="col">Club</th><th scope="col">P</th><th scope="col">W</th><th scope="col">D</th><th scope="col">L</th><th scope="col">GF</th><th scope="col">GA</th><th scope="col">GD</th><th scope="col">Pts</th></tr></thead>
      <tbody>${standings.map(renderStanding).join("")}</tbody>
    </table></div>
    <p class="data-note">${standingsMetadata.note}</p>
  </section>`;
}

import { scorers, scorersMetadata } from "../data/scorers";

export function renderScorers(): string {
  const rows = scorers.map((scorer) => `<li class="scorer-row">
    <span class="scorer-position">${scorer.position}</span>
    <img class="scorer-avatar" src="${scorer.avatarSrc}" alt="" width="48" height="48">
    <span class="scorer-person"><strong>${scorer.player}</strong><small>${scorer.club}${scorer.appearances ? ` · ${scorer.appearances} apps` : ""}</small></span>
    <span class="goal-count"><strong>${scorer.goals}</strong><small>goals</small></span>
  </li>`).join("");

  return `<div class="panel-heading">
      <div><p class="section-kicker">Golden Boot</p><h2 id="scorers-title">Top scorers</h2></div>
      <span class="status status--${scorersMetadata.status}">${scorersMetadata.season} · ${scorersMetadata.status}</span>
    </div>
    ${rows ? `<ol class="scorer-list">${rows}</ol>` : `<p class="empty-state">The Golden Boot race begins when the season kicks off.</p>`}
    <p class="data-note">${scorersMetadata.note}</p>`;
}

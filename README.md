# Premier League Stats

A Vite/TypeScript season review for the 2023/24 Premier League.

## Fixture data

Fixtures use the documented [football-data.org API v4 competition matches resource](https://docs.football-data.org/general/v4/match.html) (`GET /v4/competitions/PL/matches?season=2023`). The API requires an authentication token and is therefore unsuitable for a public browser client: exposing the token would leak it, and direct requests would make the UI dependent on a third party. The application consequently uses only the committed, validated snapshot at `public/data/premier-league-2023-24-fixtures.json`; there is no live/fallback schema split.

`src/services/fixtures.ts` is the boundary between the football-data.org response names and the app's `Fixture` model. It validates every record before normalizing it. UI code consumes only the normalized model.

### Refreshing the snapshot

1. Create an API token at football-data.org and keep it outside the repository.
2. Download the desired season response:
   ```sh
   curl --fail --header "X-Auth-Token: $FOOTBALL_DATA_TOKEN" \
     "https://api.football-data.org/v4/competitions/PL/matches?season=2023" \
     --output public/data/premier-league-2023-24-fixtures.json
   ```
3. Preserve the API's `matches` array (extra top-level metadata is accepted), update the snapshot's retrieval metadata if it is curated, then run `npm run check`.
4. Start `npm run dev` and verify the Results filters and displayed totals. Invalid IDs, dates, matchweeks, statuses, team names, or scores will put the panel in its explicit error state rather than rendering unchecked data.

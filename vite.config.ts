import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages serves this project below the repository name. An explicit
  // base keeps generated scripts, styles, images, and fixture requests inside
  // that subpath instead of resolving them against the site root.
  base: "/premier-league-stats/",
});

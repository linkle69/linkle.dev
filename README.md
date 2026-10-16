# Website

My personal website using [Astro](https://astro.build/) and [GitHub Pages](https://pages.github.com/).

The avatar in `src/` is synced from Discord every 6 hours by the [Update Avatar](.github/workflows/update-avatar.yml) workflow, which redeploys the site when it changes. It needs the `DISCORD_ID` and `DISCORD_TOKEN` (bot token) repository secrets.

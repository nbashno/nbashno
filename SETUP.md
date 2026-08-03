# Setup

This repository is a **GitHub profile README** repo. It becomes your profile
when its name equals your username.

## 1. Create the profile repo

Create a **public** repository named exactly your username:

```
nbashno/nbashno
```

Push everything in this folder to its `main` branch.

## 2. Fix the username references

The generators default to the repo owner automatically inside Actions, but the
`README.md` has hardcoded `nbashno` in third-party image URLs. Replace them:

```bash
# from the repo root, on macOS/Linux:
grep -rl 'nbashno' README.md | xargs sed -i '' 's/nbashno/YOUR_USERNAME/g'   # macOS
# or
grep -rl 'nbashno' README.md | xargs sed -i    's/nbashno/YOUR_USERNAME/g'   # Linux
```

Do the same in `LICENSE` (the copyright line) if you want.

## 3. Add secrets (Settings → Secrets and variables → Actions)

| Secret | Needed for | How to get it |
| --- | --- | --- |
| `METRICS_TOKEN` | Section 5 metrics + full private-contribution counts | Create a **classic PAT** with scopes `repo`, `read:user`, `read:org`. |
| `WAKATIME_API_KEY` | Section 15 coding time (optional) | From your Wakatime account settings. |

`GITHUB_TOKEN` is provided automatically — no action needed. If you skip
`METRICS_TOKEN`, everything still works; the metrics panel just won't render and
the dashboard falls back to public-only numbers.

## 4. Enable Actions write access

Settings → Actions → General → **Workflow permissions** → select
**Read and write permissions**. This lets the workflows commit refreshed SVGs.

## 5. Trigger the first build

Actions tab → **Update Profile** → **Run workflow**. Also run **Snake** and
**Metrics** once. After that they run automatically every 6 hours.

## Run locally

No dependencies to install — the generators use only the Node standard library.

```bash
npm run build:static          # banner, terminal, architecture, matrix, divider, footer
GH_USERNAME=YOUR_USERNAME GH_TOKEN=YOUR_PAT npm run build   # + live dashboard, languages, visitors
```

Preview any SVG by opening it in a browser; the SMIL animations play there and
on GitHub, but not inside VS Code's markdown preview.

## What updates how

| Visual | Source | Refresh |
| --- | --- | --- |
| Banner, terminal, architecture, matrix, divider, footer | `scripts/` (offline) | on push to scripts, or manual |
| Dashboard, language radar, visitor SVG | `scripts/generate-metrics.js` (GitHub API) | every 6h |
| Metrics panel | `lowlighter/metrics` action | every 6h |
| Contribution snake | `Platane/snk` → `output` branch | every 6h |
| Stat cards, streak, activity graph, quote, visitor badge | third-party services in README | on every page view |

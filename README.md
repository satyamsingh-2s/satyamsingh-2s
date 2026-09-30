# GitHub Profile Card

<img src="./generated/dark_mode.svg" alt="GitHub Profile Card">

## How it works

This profile card is generated automatically from live GitHub profile and repository data.

The workflow is:

```
GitHub API
   ↓
src/fetch-github.mjs
   ↓
src/data.json
   ↓
src/generate.mjs
   ↓
generated/dark_mode.svg
```

GitHub Actions updates the card automatically on pushes to `main` and on a daily schedule.

The SVG design lives in `src/template.svg`, while the generated card is stored in `generated/dark_mode.svg`.

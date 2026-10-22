# Adopting `gd-docs-theme-next` in a Hugo site

## 0. Where the theme lives

**This directory — `gdc-ui/sdk/docs/themes/gd-docs-theme-next/` — is the only copy.**
Edit the theme here. gdc-ui is the repo that ships it (Netlify builds `sdk/docs`), so a
change is live the moment it lands here; there is no second copy and nothing to sync.

Earlier there *were* two copies: this one plus `theme/` in the docs-analysis repo, with
gdc-ui selecting this one via classic `theme = ["gd-docs-theme-next"]`. Because classic
`theme=` resolves the local `themes/` dir and silently wins over any
`[[module.imports]]`, every edit made in docs-analysis was invisible here while the
build still "succeeded" — which is how five layouts drifted apart unnoticed. The second
copy is gone. If you are ever tempted to re-add one, don't: the failure mode is a build
that passes and renders the wrong thing.

Other sites consume this directory as a Hugo module (see §1). docs-analysis's
`output/site` scaffold does exactly that, pointing at this path.

## 1. Consuming it from another site

gdc-ui itself needs no module wiring — `theme = ["gd-docs-theme-next"]` plus this
directory is the whole story.

Any *other* site imports it as a Hugo Module
(`github.com/gooddata/gd-docs-theme-next`). Until it is published to GitHub, map the
module path onto this directory with `replacements`:

```toml
# config/_default/config.toml  (or hugo.toml)
theme = []   # a classic theme= would shadow the module — leave it empty

[module]
  # local dev until the module is published; drop this line once published:
  replacements = "github.com/gooddata/gd-docs-theme-next -> /abs/path/to/gdc-ui/sdk/docs/themes/gd-docs-theme-next"
  [[module.imports]]
    path = "github.com/gooddata/gd-docs-theme-next"
```

`replacements` resolves relative paths against the site's **themesDir** (`./themes`),
not the project root — so prefer an absolute path, or count directory levels from
`themes/`. (docs-analysis's `output/site` uses
`../../../gdc-ui/sdk/docs/themes/gd-docs-theme-next`.) Note: `theme = []` supplied via a
`--config` list does NOT override a base `theme=` — edit the real config file.

## 2. Site-side build config (NOT theme-default-able)

Required for the Tailwind v4 (`css.TailwindCSS`) pipeline:

```toml
[build]
  [build.buildStats]
    enable = true
  [[build.cachebusters]]
    source = "assets/notwatching/hugo_stats\\.json"
    target = "css"
  [[build.cachebusters]]
    source = "(postcss|tailwind)\\.config\\.js"
    target = "css"
[module]
  [[module.mounts]]
    source = "assets"
    target = "assets"
  [[module.mounts]]
    source = "hugo_stats.json"
    target = "assets/notwatching/hugo_stats.json"
    disableWatch = true
```

## 3. Required params

```toml
[params]
  homeSlug = "latest"           # the landing section for this site (gdc-ui: "latest" in every build)
  activeVersions = 1              # leading [[versions]] entries that are canonical; archived versions point their canonical link at the newest active one
```

## 4. Chrome param map (Docsy → theme contract)

The theme's chrome is param-gated; map gdc-ui's current Docsy values onto the contract:

| Docsy (current gdc-ui) | Theme contract |
| --- | --- |
| hardcoded kapa in `hooks/body-end.html` | `[params.askAI] enable = true; websiteId = "…"; projectColor = "#ED26B7"; …` |
| version data | `[[params.versions]]` entries (`version` / `dirpath` / `url`) |
| `[menu.main]` | unchanged — rendered as the cross-product top strip |

### Search

Docsy's `addSearchTab = "gd-ui-doc"` is an AddSearch **UI tab/filter id**, NOT the site key — do not put it in `addSearchKey`.

Portal AddSearch — one index across gooddata.ai docs, used in every environment:

```toml
[params.search]
  provider           = "addsearch"
  addSearchKey       = "2651a9f9545535cb82cf902c4727759e"  # live-observed 2026-07-21 — re-verify in AddSearch dashboard before shipping
  customFieldVersion = "11.47"                             # emits <meta name="addsearch-custom-field" content="version=…"> for crawler faceting
```

Ops prerequisite (outside any repo): AddSearch dashboard must include `/docs/gooddata-ui/**/reference/**` in crawl scope; +8.3k pages on a ≥10k-page index → check page quota/plan.

AddSearch is the only provider. Previews and local servers point at the same hosted
index, so results deep-link to the production page rather than the preview copy — a
known trade-off, taken because a build-time index (pagefind) needed a post-build step
no pipeline ever ran, which left every preview with no search box at all.

Set `provider = "none"` to hide the box entirely.

### Ask AI

The theme pins `data-modal-open-on-command-k="true"` on the Kapa embed, so cmd-K opens Ask AI.

## 5. Output formats

The theme defines `LLM_TXT` / `LLM_FULL` in its `hugo.toml`. A site selects them per kind via `[outputs]`.
gdc-ui's Docsy `REDIR` / `LLMS` formats are out of theme scope — define
them site-side or drop them from `[outputs]`.

The per-page Markdown version (`index.md`, output format `MARKDOWN`) is a theme feature: the
site defines the format and enables it with a cascade (docs/site-config.md §3). gdc-ui's
`llms.txt` (`layouts/index.llms.txt`) links every page's Markdown version.

## 6. Remove the Docsy overrides

**The Docsy override layouts** `sdk/docs/layouts/` shadow any theme and call Docsy-only
partials. In the current gdc-ui checkout they are already disabled as
`layouts.probe-off/`.

(The other former shadowing hazard — a duplicate theme copy in docs-analysis — is
resolved; see §0.)

## 7. Verified behaviour on gdc-ui content

With the live theme + the params above, all five chrome features render on gdc-ui's real
`content/en/latest/` pages (verified 2026-07-01):

- **Breadcrumbs** — render from `.Ancestors` on every content page (Home › … › page). No
  content restructuring needed. (Earlier "sparse breadcrumbs" was the stale vendored copy,
  not `.Ancestors`.)
- **Cross-product topbar** — renders from gdc-ui's own `[menu.main]` plus `[params.headerCTA]`, with
  GoodData Cloud's first-row markup and a ported stylesheet (`assets/css/gd-header.css`; DP-3706). To
  resync with Cloud, diff against gdc-cloud-docs' `navbar.html`, gooddata-docs-theme's `header-menu.html`
  at the pin gdc-cloud-docs uses, and `https://www.gooddata.ai/learn-assets/css/Header.css`. Cloud's
  links are static config too; marketing's `learn-assets/js/header-definition.json` is not what Cloud
  renders, so it is deliberately not used.
- **Search / ask-AI** — light up once `params.search` / `params.askAI` are set (§4).
- **Version selector** — renders when the `versions.html` partial returns more than one entry.
  The prod build (`--environment public`) sets `params.versions` from
  `config/public/params.toml`. Other builds set no list; they point
  `params.versionsSource.file` at that same file, and the partial reads it, puts
  `versionsSource.local` first and prefixes relative urls with `versionsSource.liveURL`.
  The banner and the versions archive table use the same partial.

## 8. Card icons + links (done)

`blocks/card` now renders the icon (`icon=` → site-root path, e.g. `/integration.svg`,
`dark:invert`) and links the card from `link` / `url` / **`extLink`** (gdc-ui's param).
Icons that don't resolve just show nothing (no build break). Verified on gdc-ui's
`/latest/` landing (icons render; icon-only cards stay `<div>`, linked cards become `<a>`).

## 9. Reference source links + guide→reference panel

Two data-driven features; both degrade to nothing when their inputs are absent
(clean clone, no reference build), so enabling them is content/config-only:

- **"Source:" chip on reference pages** — renders when a page has `source_path`
  frontmatter (upstream-repo-relative, e.g. `libs/sdk-ui-charts/src/...`; emitted
  by `docs:reference`) AND the site sets `params.repoURL`. Optional
  `params.sourceRef` picks the git ref (default `master`; pin a `vX.Y.0` tag to
  make links immune to upstream refactors).
- **"API reference" panel on guide pages** (tutorial/howto/explanation/default) —
  renders a page's `api_symbols` frontmatter (`"@gooddata/<pkg>:<Symbol>"`) as
  links into `/reference/`. Symbols resolve through the `data/api_refs.json`
  lookup emitted by `docs:reference`; entries are double-checked with
  `site.GetPage`, so missing data, known misses, and stale entries all render
  nothing rather than dead links.

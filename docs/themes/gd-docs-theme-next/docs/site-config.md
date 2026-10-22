# Required site-side config

The `gd-docs-theme-next` theme cannot supply these values — they must exist in the consuming site's `hugo.toml`.

---

## 1. Build stats + cachebusters

Required so Tailwind's JIT can see every class in the built HTML and CSS pipeline invalidates on config change.

```toml
[build]
  [build.buildStats]
    enable = true
  [[build.cachebusters]]
    source = "assets/notwatching/hugo_stats\\.json"
    target = "css"
```

## 2. hugo_stats.json module mount

Hugo writes `hugo_stats.json` to the site root; this mount makes it readable as an asset. The `@source "hugo_stats.json"` directive in `main.css.tmpl` resolves through this mount — no `@source` fallback required in the theme because the mount is the single source.

```toml
[module]
  [[module.mounts]]
    source = "assets"
    target = "assets"
  [[module.mounts]]
    source = "hugo_stats.json"
    target = "assets/notwatching/hugo_stats.json"
    disableWatch = true
```

## 3. Output formats

The theme ships templates for `LLM_TXT` and `LLM_FULL` outputs and defines both formats in its
`hugo.toml` (`llms.txt`, `llms-full.txt`). Turn them on in the site config:

```toml
[outputs]
  home = ["HTML", "LLM_TXT", "LLM_FULL"]
```

The theme also renders a page or section as Markdown, for its output format `MARKDOWN` (defined
in the theme's `hugo.toml`): the per-page `index.md` the llms.txt convention asks for. `head.html`
links it from the HTML page with `rel="alternate"`, and the site's llms.txt with
`rel="describedby"`. Every Markdown version starts with a pointer to the site's llms.txt (the home
page's `LLMS` or `LLM_TXT` output), the title and the description, then the body with shortcodes
rendered, api-documenter's HTML tables as Markdown tables, CRLF line ends as LF, and links made
absolute, pointing to the linked page's Markdown version when it has one
(`_partials/page-markdown.html`).

- `_default/single.markdown.md`: a page.
- `_default/list.markdown.md`: a section, then its child pages, each linked to its Markdown version.
- `reference/list.markdown.md`: the API reference landing page and each package page.
- `reference/single.markdown.md`: one file per API symbol. A generated symbol (`source:
  api-documenter`) lists its package, kind, stability, source and guides first, and carries its
  folded members (`folded: true`, `parent_symbol` the symbol) grouped by kind (`## Property
  details`, `## Method details`, each member a `###` section), as the HTML page does
  (`_partials/api-member-sections.html`, styled by the `.api-member` rules in `main.css.tmpl`). A folded member has no page of its own
  (`build.render: link`): every link to it points at its section.

Turn it on for every page and section in `[outputs]` (a page can also opt in with
`outputs: [HTML, MARKDOWN]` in its frontmatter):

```toml
[outputs]
  section = ["HTML", "MARKDOWN"]
  page    = ["HTML", "MARKDOWN"]
```

Shortcodes with a Markdown rendering live next to their HTML one as `<name>.markdown.md`
(`alert`, `figure`, `embedded-image`, `blocks/card`, `blocks/cards-container`,
`dashboard-catalog`, `versions-archive`). A shortcode without a Markdown template falls back to its
HTML output, raw HTML in the Markdown, so give every shortcode the site's pages use one; gdc-ui's
`scripts/tests/llms-exports.test.ts` checks that.

## 4. Required params

```toml
[params]
  homeSlug = "getting-started"   # slug of page the home redirect points to
```

## 5. Full reference example

From `output/site/hugo.toml` (the canonical consuming site):

```toml
baseURL = "https://davidzoufaly.github.io/gd-ui-docs-beast-moded/"
languageCode = "en-us"
title = "GoodData.UI SDK Documentation"
enableRobotsTXT = true

theme = "gd-docs-theme-next"

[build]
  [build.buildStats]
    enable = true
  [[build.cachebusters]]
    source = "assets/notwatching/hugo_stats\\.json"
    target = "css"

[params]
  description = "Documentation for GoodData.UI SDK, organized around tutorials, how-to guides, reference, and explanations."
  repoURL = "https://github.com/gooddata/gooddata-ui-sdk"
  homeSlug = "getting-started"

[outputs]
  home = ["HTML", "LLM_TXT", "LLM_FULL"]

[module]
  [module.hugoVersion]
    extended = true
    min = "0.156.0"
  [[module.mounts]]
    source = "assets"
    target = "assets"
  [[module.mounts]]
    source = "hugo_stats.json"
    target = "assets/notwatching/hugo_stats.json"
    disableWatch = true
```

## 6. Deploy notes

- `baseURL` must match the deploy sub-path exactly (GitHub Pages: `https://<user>.github.io/<repo>/`).
- `hugo extended` required (Sass pipeline). Min version `0.128.0`.
- `enableRobotsTXT = true` optional but recommended for production.
- `[markup.goldmark.renderer] unsafe = true` required if content uses raw HTML in markdown.

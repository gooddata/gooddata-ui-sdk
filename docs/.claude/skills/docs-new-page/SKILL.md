---
name: docs-new-page
description: Creates a new hand-written GoodData.UI docs page in sdk/docs/content/en/latest that fits gd-docs-theme-next. Covers the Diátaxis type, folder, weight, all frontmatter (api_symbols, related_pages, aliases), the API chips, the generated Props table and a check script. Use when adding, splitting out or scaffolding a guide, how-to, tutorial, explanation, or component or hook page in the SDK docs.
---

# New docs page

Hand-written pages live in `sdk/docs/content/en/latest/`. Everything under
`api-reference/` is generated in the build, so never add pages there.

Read [STYLE_GUIDE.md](../../../STYLE_GUIDE.md) for voice and wording, and
[CONTENT_PIPELINE.md](../../../CONTENT_PIPELINE.md) for what the build generates. This skill
covers putting a page together. Frontmatter and body templates for each type are in
[TEMPLATES.md](TEMPLATES.md).

## 1. Pick the Diátaxis type

Ask what the reader is trying to do. Use one type per page. If the draft mixes two, split it.

| Reader wants to… | `diataxis_type` | Examples in this tree |
| --- | --- | --- |
| learn by building something, start to finish | `tutorial` | `dashboard-plugins/develop-your-first-plugin.md` |
| get one task done, already knows the basics | `howto` | `filters/filter-visual-components.md`, `dashboard-plugins/customize-widgets.md` |
| look up a component, hook or function | `reference` | `visualisations/bar-chart.md`, `data-layer/use-execution-data-view.md` |
| understand why or how something works | `explanation` | `ai-modules/key-driver-analysis.md` |

A component or hook page is `reference`, even though a person writes it. The theme renders
each type differently, so the type is more than a label:

- `tutorial`: every `##` becomes a numbered step, so each `##` must be a step. A **Tutorial** pill is shown above the title.
- `howto`: no description under the H1. Open the body with what the reader will have done.
- `explanation`: an **Explanation** pill. Blockquotes are styled as callouts.
- `reference`: on a section `_index.md`, it hides the child-card grid unless `section_overview: true` is set.

## 2. Place it

1. Choose a section folder: `getting-started`, `visualisations`, `filters`, `data-layer`,
   `dashboard-plugins`, `analytical-designer`, `integrations`, `ai-modules`. Keep British folder names like
   `visualisations/`, because they are part of the URLs.
2. File name: kebab-case, with `use-*.md` for hooks. The file name becomes the URL slug.
3. `weight`: read the sibling pages' weights and choose a free number. Order rule: guides
   first, `use*` hooks last (Dashboard & plugins, Filters, Data layer). The sidebar is built
   from these weights, and there is no nav file to edit.
4. Don't add your page to the section's `_index.md`: landings list their children as cards built from each page's `description` (see [Page templates](../../../STYLE_GUIDE.md#page-templates)).

## 3. Write the frontmatter

Copy the template for your type from [TEMPLATES.md](TEMPLATES.md). The fields that drive features:

| Field | What it does | Rule |
| --- | --- | --- |
| `title` | H1, nav label, `<title>` | Sentence case, except the feature names in the style guide (AI Assistant, Analytics Catalog, Semantic Search, Key Driver Analysis, Analytical Designer). About five words, so the sidebar row does not wrap. A how-to title is a verb phrase that names the goal ("Add totals to a table"); reference and explanation titles are a noun phrase ("Version compatibility"). Change the title, never the file name. An empty title fails the build. |
| `description` | Line under the H1 (not on howto), section cards, SEO, `llms.txt`, the quote under the title in the Markdown copy | One sentence. It must not repeat the first paragraph. |
| `api_symbols` | **API chips** above the title. Adds a **Guide:** chip on each symbol's reference page. Picks the Props table. Steers inline auto-links. | `"@gooddata/<package>:<Symbol>"`. Only `@public` / `@beta` symbols have pages. Put the main symbol first, for example the component before its props interface. |
| `related_pages` | The **Related** box at the bottom (first 5 entries) | Absolute `/docs/<path>` with no version. Choose them by hand: the next step, the sibling task, the concept behind it. An entry that doesn't resolve is dropped with a build warning. |
| `aliases` + `legacy_path` | 301 redirect from an old URL. Version-menu deep links. | Only when the page replaces an old one. Aliases are page-relative, lowercase, with a trailing slash. |
| `linkTitle` | Don't set it | The sidebar must show the same words as the H1, so shorten `title` instead. `scripts/tests/nav-titles.test.ts` fails on it. |
| `ai_generated_body` / `ai_generated_description` | Marks AI-written text | Set to `true` when you wrote the text. |
| `source_files` | SDK source paths behind the page. The `docs-changelog-drift` skill uses them to match SDK changes to pages. | Paths relative to the package, for example `src/charts/barChart/BarChart.tsx`. |
| `section`, `category`, `subsection` | Nothing reads them today | Copy them from a sibling page so the files stay consistent. |

`props_interfaces` only counts when a page has no `api_symbols`. Don't add it to new pages.

## 4. Write the body

- Don't start with an H1, because the theme prints `title`. Use `##` for sections and `###` below them.
- **Section order**: tutorials, section landings, hook pages and chart pages each have a fixed shape. Follow [Page templates](../../../STYLE_GUIDE.md#page-templates). Never put "Step 1" in a heading.
- **Props**: if `api_symbols` names a component or props interface, end the page with
  `## Props` followed by `{{% props %}}`. The table is generated from the SDK. Write a table by
  hand only when the symbol is `@internal` (no reference page). `@alpha` symbols are published
  (since 2026-10-19), so they get the generated table too.
- **Inline code** like `` `IChartConfig` `` or `` `IMeasure[]` `` links itself to the reference.
  Don't write those links by hand. Lowercase names never link, so link functions by hand if needed.
- **Notes**: `{{% alert color="info|warning" title="…" %}}`. Use `warning` for caveats,
  deprecations and beta or alpha maturity. Don't use bare `>` blockquotes except in explanations.
- **Images**: `{{< figure src="/gd-ui/<file>.png" alt="<what the image shows>" >}}`. `alt` is
  required (the build warns without it). Alt text with double quotes goes in backticks:
  ``alt=`The "Sales" chart` ``, because a `"` inside `alt="…"` breaks the build. Image files go in
  `sdk/docs/static/gd-ui/`.
- **Code**: use `tsx` for JSX, `ts` for other TypeScript, then `bash`, `html`, `json`.
  Examples must compile against the current SDK. Check every prop and function you use in
  `sdk/libs/<package>/src` or in its api model. Follow the [code conventions](../../../STYLE_GUIDE.md#code-blocks):
  `./catalog.js` for the catalog, the named `tigerFactory` import, `TIGER_API_TOKEN`, quoted placeholders.
- **Links in prose**: relative, like `[InsightView](../visualisations/insightview/)`, with
  link text that says where it goes.
- **Dashboard events and commands**: use `{{% dashboard-catalog "event" %}}` or `"command"`
  instead of copying the list by hand.
- **Markdown copy**: the build also publishes the page as `<URL>index.md` for agents and links it
  from llms.txt. You don't set anything for it. Keep the body Markdown: raw HTML (`<div>`,
  `<span style>`) lands in the copy as is, while the theme's shortcodes (`alert`, `figure`,
  `blocks/card`, `props`, `dashboard-catalog`, and the docs home's `home/*`) come out as clean Markdown. A new shortcode needs a
  `<name>.markdown.md` version next to its `.html`, or its HTML ends up in the copy.

## 5. Check it

Run from `sdk/docs`:

```bash
node .claude/skills/docs-new-page/scripts/check-page.mjs content/en/latest/<section>/<page>.md
npm test                                    # alias / redirect tests
hugo -e local -d "$(mktemp -d)"             # full build into a temp dir; keeps public/ untouched
```

Fix every `ERROR`. For each `WARN`, either fix it or be able to say why it's fine. Open the
page's Markdown copy in the build output (`<temp dir>/latest/<section>/<page>/index.md`)
and check it reads cleanly, without leftover HTML. In the
Hugo output, look for `related_pages: … does not resolve`, `REF_NOT_FOUND` and props
warnings that name your page. Without a built SDK, the reference links and Props table are
only warnings in the `local` environment. CI builds them for real.

Last, go through the [Pre-publish checklist](../../../STYLE_GUIDE.md#pre-publish-checklist).

## Common mistakes

- Choosing `howto` for a component page. Component and hook pages are `reference`.
- Writing a Props table by hand for a public symbol. It goes stale with the next release.
- `related_pages` written as `../foo` or `/latest/foo`. Only `/docs/foo` works in every version.
- `api_symbols` naming an `@internal` symbol. No chip appears and the generator warns. For an
  `@alpha` or `@beta` symbol the chip and table work; still mention the maturity in an alert.
- A tutorial with a "Background" or "Next steps" `##`, which the theme then numbers as a step. Put background in the intro and next steps in a closing list.
- A hand-written list of child pages on a section landing. The cards already list them.

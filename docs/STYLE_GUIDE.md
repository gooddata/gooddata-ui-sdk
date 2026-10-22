# GoodData.UI documentation style guide

This is the authoring style guide for the GoodData.UI documentation. It defines the **voice, tone, and terminology** every page should follow, plus the mechanics and Hugo conventions that keep the docs consistent.

> **This file is not published.** It lives at the docs package root (`sdk/docs/`), outside Hugo's content directory (`content/en/`), so it never appears on the public site. It is for contributors and for the AI assistant that generates and syncs docs.

## Who this is for

- **Human contributors** writing or editing pages under `content/en/`.
- **The AI doc-generation agent.** Many pages carry `ai_generated_body: true`, and the docs skills in [`.claude/skills/`](.claude/skills/) (`docs-new-page`, `docs-changelog-drift`) write and fix pages. This guide *is* their voice.

When a choice is not covered here, default to the [Google developer documentation style guide](https://developers.google.com/style) and the [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome/).

## How to use this guide

1. Before you write, find the page's `diataxis_type` and read the matching tone profile in [Tone by content type](#tone-by-content-type).
2. While you write, follow [Voice and tone](#voice-and-tone), [Terminology](#terminology), and [Mechanics](#mechanics).
3. Before you commit, run the [Pre-publish checklist](#pre-publish-checklist).

This guide covers *how to write*. For where content comes from — which pages are
generated, how to regenerate the API reference, and which frontmatter fields drive
the theme's cross-linking — see [CONTENT_PIPELINE.md](./CONTENT_PIPELINE.md).

---

## Voice and tone

Write for a developer who is busy, capable, and looking for an answer — not for a marketing audience. Our voice is **a knowledgeable colleague**: clear, direct, and friendly, never salesy or pedantic.

### Core principles

- **Clarity over cleverness.** The reader is here for information, often in a hurry. Say the useful thing first.
- **Second person.** Address the reader as "you." Avoid "the user" or "one."
- **Active voice, present tense.** "The `Treemap` component renders the data," not "The data will be rendered by the component."
- **Imperative for instructions.** "Run the command," "Install the package," "Import the component."
- **No marketing or brand-speak.** Drop "powerful," "seamless," "best-in-class," "effortless." Describe what the thing does, not how great it is. (Stripe keeps a deliberately neutral product voice — so do we.)
- **Front-load.** Lead each page, section, and sentence with the point. Put prerequisites and caveats where they help, not as a preamble.
- **Be concise.** Prune every word that does not carry meaning. One idea per sentence.
- **Contractions are fine.** "You'll," "it's," "don't" — they read naturally.

### Person and mood — quick rules

| Situation | Use | Example |
| --- | --- | --- |
| Addressing the reader | second person "you" | "You can sort by any measure." |
| Steps and commands | imperative | "Install the package," "Add the provider." |
| A recommendation | first-person plural "we recommend" | "We recommend enabling the compact legend." |
| A guided tutorial moment | "Let's …" (tutorials only) | "Let's build a pie chart in two steps." |

Do **not** use "we" to mean the product ("we render the chart"). Use it only for guidance from the docs team ("we recommend").

### Tone by content type

Tone shifts with the page's `diataxis_type`. Match it.

| `diataxis_type` | Reader's goal | Tone |
| --- | --- | --- |
| `tutorial` | Learn by doing | Encouraging and hand-holding. "Let's …", short wins, reassurance. Don't digress into reference detail. |
| `howto` | Solve a specific task | Direct and goal-first. Lead with the outcome, then the imperative steps. Assume competence. |
| `reference` | Look up a fact | Terse and factual. Tables, signatures, defaults. No narrative, no "we recommend." |
| `explanation` | Understand the "why" | Reflective prose. Background, trade-offs, mental models. The one place longer paragraphs belong. |

---

## Terminology

Consistent terminology is the single highest-leverage thing in these docs. Use the canonical term every time.

### Product and platform names

| Use | Don't use | Notes |
| --- | --- | --- |
| **GoodData.UI** | "GoodData UI", "GoodData.UI SDK" | Period, no space. Drop "SDK" unless you specifically need to distinguish the library from the product. |
| **GoodData Cloud** | "GD Cloud", "the cloud" | The hosted platform. |
| **GoodData.CN** | "GoodData CN", "Cloud Native" | The cloud-native (self-managed) platform. |
| **GoodData Legacy** | "the platform", "GoodData platform" | The deprecated platform; relevant to version 9 only. |
| **GoodData analytics engine** | "the engine", "backend" (in prose) | When referring to the server that computes results. |

#### Feature names

These GoodData features are product names: keep them capitalized everywhere, titles included.

**AI Assistant** · **Analytics Catalog** · **Semantic Search** · **Key Driver Analysis**

Every other feature and UI part is a common noun in sentence case: "Notifications panel", "the
dashboard filter bar". Component and package names keep their code casing (`NotificationsPanel`,
`@gooddata/sdk-ui-gen-ai`).

### Domain glossary

| Use | Avoid | Notes |
| --- | --- | --- |
| **visualization** | *insight* | "Insight" is the legacy term. Keep it **only** in API and object names (`InsightView`, `insightId`, "a saved insight" as a stored object). In prose describing the concept, write "visualization." |
| **measure** | *metric* | Use "metric" **only** in MAQL context or when naming a GoodData Cloud UI concept. |
| **workspace** | *project* | "Project" means a software project, never a GoodData workspace. |
| **attribute** | — | A dimension / grouping field. |
| **dashboard** | — | Consistent across the docs. |
| **execution** | *query* | The act of computing a result from the analytics engine. |
| **data model** (LDM) | *schema* | Spell out "logical data model (LDM)" on first use per page. |

When you must reference the legacy term on a page, reuse the canonical deprecation note verbatim:

```markdown
{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}
```

### Component and package naming

- **React components** are PascalCase and wrapped in backticks in prose: `` `InsightView` ``, `` `PieChart` ``, `` `DashboardView` ``, `` `Treemap` ``.
- **Props and functions** are in backticks: `` `measures` ``, `` `viewBy` ``, `` `modifyMeasure` ``.
- **npm packages** use the full scoped name in backticks: `` `@gooddata/sdk-ui-charts` ``. Don't abbreviate to "sdk-ui-charts."

Canonical package names, as readers install them (each is a library under `sdk/libs`). The API reference covers the ones `sdk/docs/scripts/generate-reference.ts` does not skip (`LIBS_TO_SKIP`): `@gooddata/sdk-ui-kit`, `@gooddata/sdk-ui-web-components` and `@gooddata/api-client-tiger` have no reference pages, so their symbols don't auto-link.

`@gooddata/sdk-ui` · `@gooddata/sdk-ui-charts` · `@gooddata/sdk-ui-dashboard` · `@gooddata/sdk-ui-filters` · `@gooddata/sdk-model` · `@gooddata/sdk-ui-ext` · `@gooddata/sdk-ui-geo` · `@gooddata/sdk-ui-pivot` · `@gooddata/sdk-ui-kit` · `@gooddata/sdk-ui-theme-provider` · `@gooddata/sdk-ui-gen-ai` · `@gooddata/sdk-ui-semantic-search` · `@gooddata/sdk-ui-catalog` · `@gooddata/sdk-ui-loaders` · `@gooddata/sdk-ui-web-components` · `@gooddata/sdk-ui-vis-commons` · `@gooddata/sdk-backend-tiger` · `@gooddata/api-client-tiger`

---

## Mechanics

### Capitalization

- **Headings use sentence case.** Capitalize only the first word and proper nouns: "Build a visualization programmatically," not "Build a Visualization Programmatically." (This is the industry norm — Google, Microsoft, GitLab, Kubernetes — and the target for new and updated pages.)
- Keep product names, component names, and package names cased as defined above, even at the start of a heading.

### Spelling and grammar

- **US English in prose:** "visualization," "color," "behavior," "customize." This is the established house style — the original `/latest/` docs use US spelling over British by roughly 980 to 17. (Existing British directory slugs such as `visualisations/` stay as-is for URL and `aliases` stability — this rule applies to prose and visible text, not to paths, slugs, or code identifiers.)
- **Serial (Oxford) comma:** "measures, attributes, and filters."
- One idea per sentence; prefer short sentences. Spell out numbers zero through nine in prose; use numerals for 10+, versions, and code.

### Inclusive, bias-free language

- Use gender-neutral wording. Prefer "you"; never "he/she" for a generic reader.
- Avoid ableist or militaristic metaphors ("sanity check," "kill," "first-class citizen" used loosely). Prefer plain alternatives ("quick check," "stop," "fully supported").
- Describe people, not conditions, when accessibility comes up.

---

## Formatting and Hugo conventions

### Code blocks

Use a consistent language tag. New and updated content standardizes on TypeScript:

| Language tag | Use for |
| --- | --- |
| `tsx` | React / JSX examples |
| `ts` | Non-JSX TypeScript (model factories, plain functions) |
| `bash` | CLI commands |
| `html` | Web Components markup |
| `json` | Configuration |
| `diff` | Showing before/after changes |

Examples must compile against the current SDK, and they share these conventions:

- The generated catalog is imported as `import * as Md from "./catalog.js";` (catalog-export writes `catalog.ts`; the `.js` suffix is required under `NodeNext`).
- `tigerFactory` is a named import: `import { tigerFactory } from "@gooddata/sdk-backend-tiger";` (the default export is deprecated). Backend setup matches the "Authenticate to the backend" page (`integrations/authentication.md`): `onHostname` before `withAuthentication`, and `ContextDeferredAuthProvider` gets `redirectToTigerAuthentication`.
- The API token variable is `TIGER_API_TOKEN` (`VITE_TIGER_API_TOKEN` in Vite apps). Never read a token in browser code.
- Placeholders in JSX are quoted strings: `insight="<visualization-id>"`, never a bare `<…>`.

Avoid bare `javascript`/`jsx` for new code — prefer `tsx`. (Existing pages mix `javascript`, `jsx`, and `typescript`; these are tracked in the [normalization backlog](#normalization-backlog).)

### Inline code

Wrap in backticks: component names, props, function names, package names, file paths, CLI commands, and literal values. Don't use bold or quotes for these.

Backticked PascalCase names that match a public SDK symbol are auto-linked to their API reference page, also inside arrays and unions (`` `IMeasure[]` ``, `` `IBucket | undefined` ``) — so write `` `IChartConfig` ``, not a hand-written link. See [CONTENT_PIPELINE.md](./CONTENT_PIPELINE.md#auto-linked-inline-code).

### Admonitions (alerts)

Use the theme's `alert` shortcode. Pick the color by intent:

| Color | When |
| --- | --- |
| `info` | Tips, context, "good to know." |
| `warning` | Caveats, gotchas, breaking changes, deprecations. |

```markdown
{{% alert color="info" title="Consider Web Components" %}}
Markdown content here — the `{{%  %}}` form renders the body as Markdown.
{{% /alert %}}
```

Use `{{% %}}` (percent) when the body contains Markdown; use `{{< >}}` (angle brackets) for shortcodes that output raw HTML, such as `figure` and the `blocks/card` components. The docs home (`_index.md` of the version folder) is built only from the `home/*` shortcodes (`home/actions`, `home/links` + `home/link`, `home/clients` + `home/client`, `home/note`, `home/community` + `home/community-link`); don't write raw HTML in it, because every page also ships as Markdown (`index.md`) and each shortcode has a `.markdown.md` variant.

### Images

Use the `figure` shortcode, always with `alt` text that says what the image shows. Don't use bare `![](…)`. Image files go in `static/gd-ui/`.

```markdown
{{< figure src="/gd-ui/treemap.png" alt="Treemap of checks by state, one rectangle per state" >}}
```

- `alt` is required: without it the build prints a `figure-no-alt` warning. Optional: `caption` (Markdown), `width`, `height`, `class`.
- An `alt` that contains double quotes goes in backticks, which Hugo reads as a raw string: ``alt=`The "Sales" column chart` ``. A `"` inside `alt="…"` ends the argument and breaks the build.
- The theme still renders `embedded-image` for the older versioned docs. Don't use it in new content.

### Links

- In prose, use **relative paths** with a trailing slash and **descriptive anchor text**. A relative link resolves against the page's URL (`/latest/integrations/authentication/`), so from `integrations/authentication.md` the `InsightView` page is `[InsightView](../../visualisations/insightview/)`. Never "click [here](…)".
- In frontmatter `related_pages`, use **absolute** `/docs/...` paths. `/docs/<path>` means `<path>` in the page's own version, so it holds in every versioned copy. An entry that does not resolve is dropped with a build warning.
- Link to external GoodData Cloud docs with full URLs.

### Frontmatter

Model new pages on [getting-started/_index.md](content/en/latest/getting-started/_index.md).

```yaml
---
title: Charts and plots
linkTitle: "Charts and plots"        # optional: shorter nav label
weight: 1                             # sort order within the section
description: Shared behavior of GoodData.UI visual components.  # one sentence; used for SEO
diataxis_type: explanation            # tutorial | howto | reference | explanation
type: docs
related_pages:                        # optional: absolute /docs/... paths
  - /docs/visualisations/insightview
legacy_path: learn/visualize_data/charts_and_plots  # optional: the old page this one replaces
aliases:                              # optional: old URLs that should redirect here
  - "../learn/visualize_data/charts_and_plots/"
ai_generated_body: true               # set when the body was AI-assisted
---
```

#### Aliases redirect the pre-reorg URLs

Every page the reorganization replaced keeps its old URL alive through `aliases`. Write them
**page-relative**, lowercase, with a trailing slash — never starting with `/`.

The relative form is what makes them survive: the same page is built under `/latest/`
and under `/11.xx/` in every archived copy, and a relative alias
resolves inside whichever of those folders it lands in. A site-absolute alias would be written
identically by every versioned copy, so the last build would win.

Count the `../` from the directory the page is written into, which for an `_index.md` is the
section's **parent**:

| Page | Old URL | Alias |
| --- | --- | --- |
| `visualisations/insightview.md` | `/latest/learn/visualize_data/insightview/` | `"../learn/visualize_data/insightview/"` |
| `integrations/interactivity/on-drill.md` | `/latest/learn/add_interactivity/on_drill/` | `"../../learn/add_interactivity/on_drill/"` |
| `getting-started/_index.md` | `/latest/introduction/` | `"introduction/"` |

Set `legacy_path` too whenever one old page maps 1:1 to the new one — the version menu uses it
to deep-link the archived versions, and `scripts/tests/aliases.test.ts` checks that every
`legacy_path` also has an alias redirecting from it. That test also rejects absolute, uppercase
or colliding aliases; `layouts/index.redir` turns each alias into a forced Netlify 301, and a
forced rule outranks a real file, so an alias that collides with a live page would hide it.

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Display title. Sentence case. |
| `description` | yes | One sentence; powers SEO and section overviews. |
| `weight` | yes | Lower sorts earlier. |
| `type: docs` | yes | Hugo content type. The docs home (`_index.md` of the version folder) gets it from the config cascade. |
| `diataxis_type` | yes | Drives the tone you should write in. |
| `linkTitle` | no | Shorter nav/breadcrumb label. |
| `related_pages` | no | Absolute `/docs/...` paths. |
| `legacy_path` | no | The old page this one replaces, 1:1. Drives the version menu's deep links. |
| `aliases` | no | Old URLs to redirect from. Page-relative, lowercase, trailing slash — see above. |
| `ai_generated_body` | no | Flags AI-assisted bodies. |
| `section_overview` | no | Set to `true` on a section landing to show child-page cards with descriptions, or `false` to suppress them. Reference sections do not show cards unless explicitly enabled. |

### Page templates

Pages of the same kind follow the same shape, so a reader who knows one knows them all. Leave out the sections that don't apply; don't add others between them.

**Tutorials.** The theme numbers every `##` of a `tutorial` page as a step (the `.tutorial-steps > h2` counter). So every `##` is a step, named for what the reader does ("Create the app", not "Step 1: Create the app"). Prerequisites and "what you'll use" go in the intro paragraph or under a `###`, never in a `##`. On how-tos and every other page, don't number headings either ("Step 1.", "Step 2:"): use imperative headings, or a numbered list for short sequences.

**Section landings** (`_index.md`). A short intro, then the theme's `section_overview` cards, which list the child pages with their descriptions (the default for every non-reference landing). Don't also write a hand list or table of the children: it duplicates the cards and goes stale. Links in a landing are relative with a trailing slash (`quickstart/`).

**Hooks** (`integrations/hooks/`, `dashboard-plugins/use-*.md`, and every other `use*` page). A one-sentence intro, then these `##`s in this order:

1. `Basic usage`
2. `Parameters`
3. `Return value`
4. `Notes`
5. `Props`

No "What it does" or "When to use it" sections and no implementation internals: keep what a user needs to call the hook, and link to an explanation page for the background.

**Charts** (the chart component pages in `visualisations/`, such as `bar-chart.md`, `heatmap.md` or `treemap.md`). These `##`s in this order:

1. `Buckets`
2. `Sorting`
3. `Configuration`
4. `Limits`
5. `Structure`
6. `Example`
7. `Props`

A topic of its own (for example, a geo chart's map settings) is an extra `##` before `Example`. `Example` and `Props` always come last.

---

## Pre-publish checklist

Run through this before you commit a page. It doubles as the AI agent's self-check.

- [ ] **Terminology:** visualization (not insight), measure (not metric), workspace (not project); `GoodData.UI` spelled correctly.
- [ ] **Voice:** second person, active voice, imperative for steps; no marketing adjectives.
- [ ] **Tone** matches the page's `diataxis_type`.
- [ ] **Heading** is sentence case; feature names from [Feature names](#feature-names) keep their capitals.
- [ ] **Structure** follows the [page template](#page-templates) for tutorials, landings, hooks and charts.
- [ ] **Spelling** is US English in prose.
- [ ] **Code blocks** use the standardized tags (`tsx`/`ts`/`bash`/…).
- [ ] **Components, props, packages** are in backticks; components are PascalCase.
- [ ] **Images** use `figure` and have descriptive `alt` text.
- [ ] **Links** are relative in prose with descriptive anchor text.
- [ ] **Frontmatter** has `title`, `description`, `weight`, `type: docs`, `diataxis_type`.

---

## Normalization backlog

Known divergences between current content and this guide. Fix them **incrementally** as you touch a page — not as a single mass sweep.

- `GoodData UI` (no period) → `GoodData.UI`.
- Title Case headings → sentence case.
- British spelling in prose → US English (directory slugs such as `visualisations/` stay).
- Mixed code tags (`javascript`, `jsx`, `typescript`) → standardized `tsx`/`ts`.
- Stray "metric" used for SDK measures → "measure".

This work overlaps DP-3543 (re-audit and enrich thin pages). Information architecture and navigation are out of scope here (see DP-3560, DP-3558).

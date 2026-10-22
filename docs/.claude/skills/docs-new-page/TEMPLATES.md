# Page templates

One template per `diataxis_type`. Replace everything in `<…>`, and delete optional lines
you don't need. Each template's headings match pages that already exist in the tree. The
section order for tutorials, landings, hooks and charts is fixed in
[STYLE_GUIDE.md › Page templates](../../../STYLE_GUIDE.md#page-templates).

## Reference: component or hook page

Model: `visualisations/bar-chart.md`, `data-layer/use-execution-data-view.md`.

````markdown
---
title: <Component name in sentence case, e.g. "Bar chart">
description: <One sentence: what the component shows or the hook returns.>
diataxis_type: reference
type: docs
weight: <free number among siblings; hooks after guides>
api_symbols:
  - "@gooddata/<package>:<Component>"          # first: the component or hook
  - "@gooddata/<package>:<IComponentProps>"    # then its props interface
source_files:
  - src/<path/to/Component.tsx>
related_pages:
  - /docs/<section>/<sibling-component>
  - /docs/<section>/<config-or-concept-page>
section: <copy from a sibling>
category: <copy from a sibling>
ai_generated_body: true                        # only if AI wrote the body
---

<One paragraph: what it is and when to use it. Not the description again.>

<!-- Chart page: Buckets, Sorting, Configuration, Limits, Structure, Example, Props.
     Hook page:  Basic usage, Parameters, Return value, Notes, Props.
     Skip the ones that don't apply; don't add others between them. -->

## <Buckets | Basic usage>

<For charts: a table with Prop | Required | Takes | What it does. For hooks: a minimal tsx example.>

## <Sorting | Parameters>

## <Configuration | Return value>

## <Limits | Notes>

## Example

```tsx
import { <Component> } from "@gooddata/<package>";
import * as Md from "./catalog.js";
// a complete example that compiles
```

## Props

{{% props %}}
````

## How-to

Model: `filters/filter-visual-components.md`, `dashboard-plugins/customize-widgets.md`.
The description is **not** shown on a howto, so the first paragraph has to say what the
reader will have done by the end.

````markdown
---
title: <Verb phrase that names the goal: "Apply filters to visualizations", "Customize the automation dialogs">
linkTitle: <Optional short sidebar label, e.g. "Filter visualizations">
description: <One sentence: the task and its result.>
diataxis_type: howto
type: docs
weight: <free number; guides come before hooks>
api_symbols:                                   # the symbols the steps use, if any
  - "@gooddata/<package>:<Symbol>"
related_pages:
  - /docs/<section>/<the reference page for the main symbol>
  - /docs/<section>/<the next task>
---

<What you'll have at the end, in one or two sentences. Prerequisites, if any, as a short list.>

## <First task step or variant>

<Imperative steps with tsx examples.>

## <Second step or variant>

{{% alert color="warning" title="<Caveat in a few words>" %}}
<Only if there is a real gotcha.>
{{% /alert %}}
````

## Tutorial

Model: `dashboard-plugins/develop-your-first-plugin.md`, `integrations/embedding/build-custom-frontend.md`.
Every `##` becomes a numbered step, so each one must be a step: no "Step 1" text in it, no
"Prerequisites" or "Next steps" `##`. Tutorials may say "Let's".

````markdown
---
title: <Outcome: "Develop your first plugin", "Build a fully custom frontend">
description: <One sentence: what the reader builds and with which parts of GoodData.UI.>
diataxis_type: tutorial
type: docs
weight: <free number>
related_pages:
  - /docs/getting-started/quickstart
  - /docs/<section>/<the how-to the reader needs next>
ai_generated_body: true
---

<Two or three sentences: what you'll build, and what you need before you start (a short list is fine).>

## <Step 1, a verb: "Create the project">

## <Step 2>

## <Step N>

Where to go next:

- [<Next page>](../<path>/) – <why go there>
````

## Explanation

Model: `ai-modules/key-driver-analysis.md`.

````markdown
---
title: <The topic: "Key Driver Analysis", "API maturity">
description: <One sentence: what the page helps you understand.>
diataxis_type: explanation
type: docs
weight: <free number>
api_symbols:                                   # optional, when the topic maps to symbols
  - "@gooddata/<package>:<Symbol>"
related_pages:
  - /docs/<section>/<the how-to that applies this>
---

<Why this topic matters, in a short paragraph.>

## <Where it appears | How it works>

## <What it needs | Trade-offs>

## <Related design decisions or limits>
````

## Section landing (`_index.md`)

Only for a new section or sub-folder. A landing lists its children only as the theme's
`section_overview` cards, built from each child's `description`; never add a hand list. Cards are
the default on a non-reference landing; a `reference` landing needs `section_overview: true`.
Model: `data-layer/_index.md` (reference) or `filters/_index.md` (explanation).

````markdown
---
title: <Section name>
linkTitle: "<Section name>"
weight: <position among sections>
description: <One sentence.>
diataxis_type: reference
section_overview: true            # child-page cards
type: docs
---

<One paragraph about the section.>
````

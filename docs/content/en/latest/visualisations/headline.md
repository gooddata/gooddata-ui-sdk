---
legacy_path: references/visual_components/headline
title: Headline
description: Display a single KPI value or comparison with the Headline component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:Headline"
  - "@gooddata/sdk-ui-charts:IHeadlineProps"
source_files:
  - src/charts/headline/Headline.tsx
props_interfaces:
  - IHeadlineProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IHeadlineBucketProps
related_pages:
  - /docs/visualisations/bullet-chart
  - /docs/data-layer/execution/time-over-time
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 17
section: Visualisations
aliases:
  - "../references/visual_components/headline/"
---

A **headline** shows a single number or compares two numbers. It can show a primary value with up to two secondary values, or a primary value, a secondary value, and a comparison. Use it to highlight key values, for example, this year's revenue compared with the same period last year.

{{< figure src="/gd-ui/headline.png" alt="Two headlines: one primary measure value, and a primary value with a secondary measure and the percentage change between them" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `primaryMeasure` | Yes | One measure | Sets the main value of the headline. |
| `secondaryMeasures` | No | Up to two measures | Adds values to compare with the primary value. With one measure, the headline also shows how the two values compare. |
| `secondaryMeasure` | No | One measure | Deprecated. Use `secondaryMeasures`. |
| `filters` | No | Filters | Limits the data the headline shows. |

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details. The `comparison` options (`IComparison`) apply only when the headline has exactly one secondary measure.

| Option | What it changes |
| --- | --- |
| `comparison.enabled` | `false` turns the comparison off, so the headline shows only the values. The comparison is on by default. |
| `comparison.calculationType` | How the comparison value is calculated: `"change"` ((primary - secondary) / secondary), `"ratio"` (primary / secondary), `"difference"` (primary - secondary), or `"change_difference"` (both change and difference). Defaults to `"change"` when the secondary measure is a period-over-period or previous-period measure, and to `"ratio"` otherwise. |
| `comparison.format` | Number format of the comparison value. Defaults to a rounded percentage (`#,##0%`), or to the primary measure's format for `"difference"`. `null` uses the primary measure's format. |
| `comparison.subFormat` | Number format of the difference with `"change_difference"`. Defaults to the primary measure's format. |
| `comparison.position` | Where the comparison value shows: `"left"` or `"auto"` (default) left of the secondary value, `"right"` right of it, and `"top"` in place of the primary value, which moves to the left of the secondary value. |
| `comparison.isArrowEnabled` | `true` adds an arrow that points up when the primary value is greater than the secondary value and down when it's smaller. |
| `comparison.colorConfig` | Colors of the comparison value: `positive` when the primary value is greater, `negative` when it's smaller, and `equals`. They default to green, red, and gray. With `colorPalette`, they default to its colors with the guids `positive`, `negative`, and `equals`, or else its first three colors. `disabled: true` turns the colors off. |
| `comparison.labelConfig` | Label of the comparison value. `unconditionalValue` sets the text, which defaults to a label based on `calculationType`, such as `Change` or `of`. `isConditional: true` with `positive`, `negative`, and `equals` sets a label for each case, except with `"ratio"`. |
| `enableCompactSize` | `true` adapts the headline to small containers. |
| `disableDrillUnderline` | `true` removes the underline from drillable values. |
| `separators` | Thousands and decimal separators in the number format. |

## Limits

- With two secondary measures, the headline shows the three values without a comparison.
- A headline shows up to two secondary measures. If you pass more, it shows only the first one.

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Headline } from "@gooddata/sdk-ui-charts";

<Headline
    primaryMeasure={<measure>}
/>
```

## Example

### Headline with a single measure (primary measure)

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Headline } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

<Headline
    primaryMeasure={Md.$FranchiseFees}
/>
```

### Headline with two measures (primary and secondary measures)

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Headline } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

<Headline
    primaryMeasure={Md.$FranchiseFees}
    secondaryMeasures={[Md.$FranchiseFeesAdRoyalty]}
/>
```

## Props

{{% props %}}

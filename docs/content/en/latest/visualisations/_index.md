---
title: Visualizations
weight: 20
description: Chart and table components for rendering analytics data.
diataxis_type: reference
ai_generated_body: true
type: docs
section_overview: true
aliases:
  - "learn/visualize_data/"
  - "references/visual_components/"
  - "references/visual_components/interactive_examples/"
---

GoodData.UI provides React components that render data from the GoodData analytics engine. The chart family in `@gooddata/sdk-ui-charts` covers the common analytical shapes: bar, column, line, area, combo, pie, donut, scatter, bubble, funnel, pyramid, heatmap, treemap, sankey, dependency wheel, waterfall, bullet, Mekko, radar, and headline. Each chart takes measures, attributes to view or stack by, and a `filters` array.

If you already have saved visualizations in your workspace, use [InsightView](insightview/). It renders a saved visualization by its identifier, picks the right chart type, and keeps the configuration it was saved with. For tables, use [Pivot table](pivot-table/). For list-style rows with inline charts, use [Repeater](repeater/). For maps, use the [geo charts](geo-chart/). Every chart accepts a shared [chart configuration](chart-config/) object for colors, legends, axes, and data labels, and [Charts and plots](charts-and-plots/) explains the behavior all of them share.

Pick the component that matches the shape of your data: bar, column, or pie charts for categorical comparisons; line, area, or combo charts for trends over time; headlines and bullet charts for single values against targets; pivot tables for tabular breakdowns; and the geo charts for geographic data.

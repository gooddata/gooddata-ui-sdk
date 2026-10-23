---
legacy_path: learn/visualize_data/charts_and_plots
title: Charts and plots
description: Shared behavior of GoodData.UI visual components — responsive sizing, the style and data props model, and the visualization lifecycle callbacks.
category: Visualisations
diataxis_type: explanation
api_symbols:
  - "@gooddata/sdk-ui:IVisualizationCallbacks"
  - "@gooddata/sdk-ui:ErrorComponent"
  - "@gooddata/sdk-ui:LoadingComponent"
  - "@gooddata/sdk-ui:GoodDataSdkError"
related_pages:
  - /docs/visualisations/chart-config
  - /docs/visualisations/insightview
  - /docs/integrations/interactivity/drillable-items
  - /docs/integrations/interactivity/on-export-ready
  - /docs/integrations/interactivity/on-legend-ready
type: docs
weight: 1
section: Visualisations
aliases:
  - "../learn/visualize_data/charts_and_plots/"
---

GoodData.UI comes with ready-made visual components. You can use them as they are or customize them. The [InsightView](../insightview/) component renders any visualization that you save in GoodData.

This page explains the behavior that these visual components share. Each component has its own page in this section.

## Responsive UI

The visual components are responsive by nature and take the whole space of their wrapper element. This means that if you want to create a visualization with a specific height and width, you must specify those dimensions on the wrapper element. Otherwise, the visualization may not be visible. Charts from `@gooddata/sdk-ui-charts` also accept optional `height` and `width` props (in pixels) that fix the chart size regardless of the wrapper.

### Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { AreaChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

<div style={{ height: 400, width: 600 }}>
    <AreaChart measures={[Md.$TotalSales]} />
</div>;
```

## Visual component props

The component props can be of the following types:

- **Style props** that define the style and interaction.
- **Data props** that define what data to calculate and render.

The style props define the style and interaction of a visualization. For more information, see [Chart configuration](../chart-config/).

The data props pass measures and attributes. These props are similar to the drag-and-drop sections in Analyze and use similar names such as "View by", "Stack by", and so on. A data prop can be a single value or an array of either the `IMeasure` or `IAttribute` type, which is passed to the component as an object literal.

You can find more information about data props in the articles about the individual components in the [Visualizations](../) section.

### Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { AreaChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <AreaChart
        measures={[Md.$TotalSales]}
        viewBy={Md.TimelineMonth.Long}
    />
</div>;
```

## Visualization lifecycle

The visualization lifecycle is a series of events that take place between mounting and rendering a visualization.

The following component props can be used as lifecycle callbacks:

| Property | Description | Parameters |
| :--- | :--- | :--- |
| `onLoadingChanged` | Called when a loading state changes | `{ isLoading: boolean }` |
| `onError` | Called when the execution or rendering fails | `GoodDataSdkError` (read the code from `seType` or `getErrorCode()`, and the text from `getMessage()`) |
| `onExportReady` | Called when the underlying data can be exported | `IExportFunction` |
| `onLegendReady` | Called when a chart legend is rendered (charts from `@gooddata/sdk-ui-charts` only) | `{ legendItems: [...] }` |

### Visualization rendered successfully

If a visualization is successfully rendered, the following events occur:

1. The visualization is mounted and rendered immediately using `LoadingComponent`.
2. The `onLoadingChanged` callback is called with a parameter of `{ isLoading: true }`.
3. The `onLoadingChanged` callback is called with a parameter of `{ isLoading: false }`.
4. The `onExportReady` callback is called with a function that you can call to trigger the export.
5. The visualization is rendered.
6. For charts that have a legend, the `onLegendReady` callback is called with a parameter of `{ legendItems: [...] }`.

### Visualization failed to render

If an error is encountered while rendering a visualization (for example, too much data to display), the following events occur:

1. The visualization is mounted and rendered immediately using `LoadingComponent`.
2. The `onLoadingChanged` callback is called with a parameter of `{ isLoading: true }`.
3. The `onLoadingChanged` callback is called with a parameter of `{ isLoading: false }`.
4. The `onExportReady` callback is called with a function that rejects with the error when called.
5. The `onError` callback is called with a `GoodDataSdkError` instance. For example, for too much data the error is a `DataTooLargeToDisplaySdkError` whose `seType` is `"DATA_TOO_LARGE_TO_DISPLAY"`. The list of error codes is available as `ErrorCodes` in `@gooddata/sdk-ui`.
6. The visualization is re-rendered using `ErrorComponent`.

---
legacy_path: learn/visualize_data/insightview
title: InsightView
description: Render any saved GoodData visualization by reference with the InsightView component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-ext:InsightView"
  - "@gooddata/sdk-ui-ext:IInsightViewProps"
source_files:
  - src/insightView/InsightView.tsx
  - src/internal/interfaces/InsightView.ts
props_interfaces:
  - IInsightViewProps
  - Partial<IVisualizationCallbacks>
related_pages:
  - /docs/integrations/embedding/embed-visualizations
  - /docs/integrations/interactivity/drillable-items
  - /docs/visualisations/chart-config
  - /docs/integrations/web-components/insight-custom-element
  - /docs/data-layer/use-insight-data-view
type: docs
weight: 2
section: Visualisations
aliases:
  - "../learn/visualize_data/insightview/"
---

The **InsightView component** is a generic component that renders visualizations created and saved in Analyze.

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

You pass a reference to the saved visualization in the `insight` prop: an identifier string, or an `ObjRef` created with `idRef`. GoodData Cloud and GoodData.CN reference objects by identifier. `InsightView` loads the definition from the workspace, so the buckets, filters, and properties come from the saved visualization. Use the individual chart components, such as [Treemap](../../visualisations/treemap/), when you define the buckets in your code instead.

## How it works

1. `InsightView` loads the saved visualization together with the workspace color palette, the user workspace settings, and the permissions of the current user.
2. Unless `executeByReference` is set, it adds the filters from the `filters` prop to the visualization's own filters.
3. It reads the visualization type from the saved visualization and renders the matching visualization.

| Type | Renders as |
| --- | --- |
| `area`, `bar`, `bubble`, `bullet`, `column`, `combo`, `combo2`, `dependencywheel`, `donut`, `funnel`, `heatmap`, `line`, `mekko`, `pie`, `pyramid`, `radar`, `sankey`, `scatter`, `treemap`, `waterfall` | The chart of that type. `combo` is the older combo chart. |
| `headline` | Headline |
| `table` | Pivot table. The new pivot table is used unless the workspace setting `enableNewPivotTable` is `false`. |
| `pushpin` | Geo pushpin chart. The new MapLibre-based implementation is used when the workspace setting `enableNewGeoPushpin` is `true`, which is the default on GoodData Cloud and GoodData.CN. With `false`, the legacy Mapbox-based chart renders, and it needs a Mapbox token. |
| `choropleth` | Geo area chart |
| `repeater` | Repeater |
| `xirr` | XIRR |

The saved types `tablenext` and `pushpinnext` render the new pivot table and the new geo pushpin chart directly. For any other type, `InsightView` logs a warning to the console and shows the default error component with the "unknown visualization" message.

## Loading and errors

| Situation | What shows | Callbacks |
| --- | --- | --- |
| The visualization, color palette, settings, or permissions are loading | `LoadingComponent` (default: `LoadingComponent` from `@gooddata/sdk-ui`). The visualization area has zero height meanwhile. | None. `onLoadingChanged` doesn't fire for this phase. |
| The visualization is loaded | `LoadingComponent` | `onInsightLoaded` receives the saved visualization. It fires when a visualization with a different reference loads. It doesn't fire again when only `filters` change, but it does fire again after `InsightView` remounts. |
| The visualization loads or executes its data | `LoadingComponent` | `onLoadingChanged` with `{ isLoading: true }`, then `{ isLoading: false }` |
| The visualization is rendered | The visualization | `onDataView`, `onExportReady`, and `pushData` when the visualization calls them |
| Loading the visualization or the permissions fails | `ErrorComponent` (default: `ErrorComponent` from `@gooddata/sdk-ui`) | `onError`. A load that a newer load replaced doesn't call it. |
| Loading the color palette or the settings fails | `ErrorComponent` | None |
| The visualization fails to render or execute | `ErrorComponent` | `onError`, then `onLoadingChanged` with `{ isLoading: false }` |

- The error component shows only when none of the visualization, color palette, settings, or permissions is still loading. Errors with a known error code get a localized message and description. Errors that aren't GoodData.UI errors (`GoodDataSdkError`) show the generic unknown-error message. GoodData.UI errors with no mapped code show the error code as the message.
- A visualization error is cleared as soon as the visualization starts loading again.
- The function passed to `onExportReady` uses the saved visualization's title as the export title when you don't set `title` in the export config.
- You can replace `onDrill`, `onError`, `onLoadingChanged`, `onExportReady`, `onDataView`, and `pushData` between renders. The visualization always calls the latest one. Replacing `onInsightLoaded` loads the visualization again.

## When it reloads

Reloading compares props by reference. Recreating the rendered visualization compares values.

| Change | Effect |
| --- | --- |
| `insight`, `filters`, `executeByReference`, or `onInsightLoaded` | Loads the visualization again and shows the loading component. |
| `backend` or `workspace` | Also loads the color palette, settings, and permissions again. A change of `executeByReference` also loads the permissions again. |
| The loaded visualization (apart from its properties), `filters`, the workspace settings, or `workspace` | Recreates the rendered visualization. |
| `config`, `drillableItems`, `colorPalette`, `execConfig`, or the visualization's properties only | Updates the rendered visualization in place. |

- Switching `locale` to a language the component hasn't loaded yet renders nothing until the translations load. After that, `InsightView` mounts again and loads everything again.
- Keep `insight` (when it is an `ObjRef`), `filters`, and `onInsightLoaded` referentially stable, for example with `useMemo` and `useCallback`. A new reference, array, or function on every render loads the visualization again on every render.
- When a new load starts before the previous one finishes, the previous result is ignored. The request itself is not canceled.
- The loaded visualization definition, color palette, settings, and permissions are cached per workspace, so a reload doesn't always reach the backend. The cache keeps up to 20 visualizations per workspace for up to 5 workspaces. After you edit a saved visualization, call `clearInsightViewCacheForInsight(workspace, ref)` so that the next load (for example after a remount) fetches the new definition. Pass the same kind of reference that you pass to `insight`. See [Caching](#caching).

## Configuration

| Prop | What it does |
| --- | --- |
| `config` | Options for the visualization type, merged with the saved visualization's properties. For charts, top-level keys in `config` replace the saved values, so an object such as `legend` replaces the saved `legend` object as a whole. A few chart types adjust some keys afterwards; for example, pie and donut charts set `chart` themselves. The prop is typed loosely, so TypeScript doesn't check the options against the visualization type. |
| `filters` | Merged with the saved visualization's filters: attribute filters are combined; a date filter on the same date dataset or a measure value filter on the same measure replaces the saved one. Without `executeByReference`, the merge happens in the browser. With it, the backend merges them. See [Filters](#filters). |
| `executeByReference` | Asks the backend to compute the saved visualization by reference instead of sending the full execution definition. Use it only when the backend requires it. |
| `drillableItems` | Which parts of the visualization can be clicked. Clicks call `onDrill`. |
| `colorPalette` | Replaces the workspace color palette. Without it, the palette comes from the workspace styling settings. |
| `locale` | Locale for texts in the visualization. Without it, the locale comes from the user workspace settings. If that isn't a valid locale either, `en-US` is used. Values coming from the data aren't localized. |
| `showTitle` | `true` shows the saved visualization's title after loading. A string shows that string, also while loading. A function receives the loaded visualization and returns the title. |
| `TitleComponent` | Renders the title. It receives `title`. The default truncates the title to two lines. |
| `execConfig` | Execution settings passed to the visualization's execution. |

`config.mapboxToken` and `config.agGridToken` fall back to `MapboxTokenProvider` (legacy Mapbox-based geo charts only) / `AgGridTokenProvider`, then to the workspace settings of the same names. `config.maxZoomLevel` falls back to the workspace setting.

## Limits

- `InsightView` needs a backend and a workspace, either in the `backend` and `workspace` props or from `BackendProvider` and `WorkspaceProvider`. There is no explicit check. Rendering without a backend fails with a runtime error instead of showing the error component.
- For an unknown visualization type, the default error component shows, not your `ErrorComponent`, and `onError` isn't called.
- With `@gooddata/sdk-ui-ext/styles/css/main.css` imported, `InsightView` takes the full height of its parent. Give the parent element an explicit height, as in the examples below.

## Filters

To learn how to build the filters that you pass in the `filters` prop, see [Apply filters to visualizations](../../filters/filter-visual-components/).

## Caching

To render a visualization, `InsightView` needs more than the visualization itself: the workspace color palette, the current user's workspace settings (including feature flags), and the user's permissions in the workspace. To avoid repeated requests, `InsightView` caches this information together with the loaded visualization definitions. The cache is shared by all `InsightView` components in the application and is kept per workspace: up to 20 visualization definitions for each workspace, for up to 5 workspaces. A cached value is used until you clear it, even when the saved visualization changes on the backend.

To drop the cached definition of one visualization, for example after you edit it, call `clearInsightViewCacheForInsight`. Pass the same kind of reference that you pass to `insight`. The new definition is fetched the next time an `InsightView` loads that visualization, for example after it remounts.

To clear the cached visualization definitions, color palettes, and workspace settings at once, for example after logging out or when switching workspaces, call `clearInsightViewCaches`. It doesn't clear the cached user permissions.

```ts
import { clearInsightViewCaches, clearInsightViewCacheForInsight } from "@gooddata/sdk-ui-ext";
import { idRef } from "@gooddata/sdk-model";

clearInsightViewCacheForInsight("<workspace-id>", idRef("<visualization-id>"));
clearInsightViewCaches();
```

## Structure

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

<div style={{ height: 400, width: 600 }}>
    <InsightView
        insight="<visualization-id>"
        config={<chart-config>}
    />
</div>
```

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";
import { idRef } from "@gooddata/sdk-model";

<div style={{ height: 400, width: 600 }}>
    <InsightView
        insight={idRef("<visualization-id>", "insight")}
        config={<chart-config>}
    />
</div>
```

The options in `config` are different for each visualization type. `InsightView` expects the same configuration type as the matching React component.

## Example

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

<div style={{ height: 400, width: 600 }}>
    <InsightView
        insight="<visualization-id>"
        config={{
            colors: ["rgb(195, 49, 73)", "rgb(168, 194, 86)"],
            legend: {
                enabled: true,
                position: "bottom"
            }
        }}
    />
</div>
```

## Props

{{% props %}}

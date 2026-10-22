---
legacy_path: references/visual_components/geo_area_chart
title: Geo area chart
description: Show geographic data as colored regions on a map with the GeoAreaChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-geo:GeoAreaChart"
source_files:
  - src/next/GeoAreaChart.tsx
props_interfaces:
  - IGeoAreaChartProps
  - IGeoAreaChartBaseProps
  - IGeoSingleLayerWrapperProps
  - IGeoCommonExecutionProps
  - IVisualizationProps
  - IVisualizationCallbacks
related_pages:
  - /docs/visualisations/geo-chart
  - /docs/visualisations/geo-pushpin-chart
  - /docs/visualisations/charts-and-plots
type: docs
weight: 14
section: Visualisations
aliases:
  - "../references/visual_components/geo_area_chart/"
---

A **geo area chart** visualizes data by geographic regions (countries, states, ...) on a map. Each region takes its color from a measure value or an attribute value, so you can compare regions, for example, revenue by country.

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `area` | Yes | One attribute | Draws one region per value. Use an attribute with a geo area label in the logical data model (LDM). Values that don't match a region aren't drawn. |
| `color` | No | One measure | Colors the regions by value, from a light shade for the lowest value to the full color for the highest. |
| `segmentBy` | No | One attribute | Colors the regions by attribute value, one color per value, and adds a category legend. When set, it decides the colors instead of `color`. |
| `filters` | No | Filters | Limits the data the chart shows. |

## Sorting

`GeoAreaChart` applies no default sorting. Pass `sortBy` to sort the data of the area layer. The category legend lists the `segmentBy` values in alphabetical order, whatever `sortBy` you pass.

## Configuration

Pass these options in the `config` prop (`IGeoAreaChartConfig`). See [Configuration](../geo-chart/#configuration) on the Geo chart page for details.

| Option | What it changes |
| --- | --- |
| `colorPalette`, `colorMapping` | Colors of the regions. A `color` measure uses shades of the first palette color, or of the color that `colorMapping` sets for the `area` attribute. `segmentBy` values take one palette color each. |
| `legend` | `enabled` (default `true`) shows or hides the legend. `position` (default `"auto"`) places it in a corner: `"top-left"`, `"top-right"`, `"bottom-left"`, or `"bottom-right"`. |
| `areas` | `fillOpacity` (default `0.7`), `borderColor` (default `"#FFFFFF"`), and `borderWidth` (default `1`) of the regions. |
| `viewport` | `area` sets the initial view: `"auto"` fits the data, which is also what happens when you set no view; `"world"` or a continent such as `"continent_eu"` shows that region. `frozen: true` locks map interaction. `navigation.pan` and `navigation.zoom` (both default `true`) turn panning and zooming on or off. |
| `bounds`, `center`, `zoom` | A custom initial view. `bounds` takes priority over `center` and `zoom`. They apply only when `viewport.area` is `"custom"` or not set; any other `viewport.area`, including `"auto"`, overrides all three. |
| `maxZoomLevel` | Maximum zoom level (default `8`). `null` removes the limit. |
| `mapStyle` | A MapLibre style URL or inline style specification, used instead of the base map from the backend. |
| `cooperativeGestures` | With `true` (default), zooming with the mouse wheel needs Ctrl or ⌘, and moving the map on a touch screen needs two fingers. |
| `separators` | Thousands and decimal separators in the tooltip values. |
| `limit` | Maximum number of data points. See [Limits](#limits). |

## Limits

- A geo area chart renders up to 50,000 data points, or the number you set in `limit`. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.
- The chart draws each region once. When a region has more than one `segmentBy` value, it takes the color of the first one in the data.

## Notes

- `GeoAreaChart` is a convenience wrapper over `GeoChart` for the single-area-layer scenario.
- Geo charts are MapLibre-based and **do not require a Mapbox access token**. If you are upgrading an older app, see [Geo pushpin chart](../geo-pushpin-chart/#map-rendering) for details about legacy Mapbox compatibility (`LegacyGeoPushpinChart`, deprecated `mapboxToken`).
- Geo charts start a MapLibre web worker. You don't need to configure your bundler; for Content Security Policy requirements and self-hosting the worker, see [Map worker, bundlers, and CSP](../geo-chart/#map-worker-bundlers-and-csp).

## Structure

```tsx
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import { GeoAreaChart } from "@gooddata/sdk-ui-geo";

<GeoAreaChart
    area={<attribute>}
    color={<measure>}
    segmentBy={<attribute>}
    config={<geo-area-config>}
    filters={<filters>}
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import { GeoAreaChart } from "@gooddata/sdk-ui-geo";
import * as Md from "./catalog.js";

<div style={{ height: 600, width: 900 }}>
    <GeoAreaChart area={Md.Country.Name} color={Md.Revenue.Sum} />
</div>;
```

## Props

{{% props %}}

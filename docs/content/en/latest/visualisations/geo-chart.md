---
legacy_path: references/visual_components/geo_chart
title: Geo chart
description: Display geographic data on an interactive map with the GeoChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-geo:GeoChart"
  - "@gooddata/sdk-ui-geo:IGeoChartProps"
  - "@gooddata/sdk-ui-geo:IGeoChartConfig"
  - "@gooddata/sdk-ui-geo:IGeoLayer"
  - "@gooddata/sdk-ui-geo:IGeoLayerConfig"
  - "@gooddata/sdk-ui-geo:IGeoChartViewport"
  - "@gooddata/sdk-ui-geo:IGeoChartLegendConfig"
  - "@gooddata/sdk-ui-geo:GeoLegendPosition"
  - "@gooddata/sdk-ui-geo:IGeoChartPointsConfig"
  - "@gooddata/sdk-ui-geo:IGeoAreasConfig"
source_files:
  - src/next/GeoChart.tsx
  - src/next/types/props/geoChart/public.ts
  - src/next/types/config/unified.ts
  - src/next/types/layers/index.ts
props_interfaces:
  - IGeoChartProps
  - IGeoCommonExecutionProps
  - IVisualizationProps
  - IVisualizationCallbacks
related_pages:
  - /docs/visualisations/geo-area-chart
  - /docs/visualisations/geo-pushpin-chart
  - /docs/visualisations/charts-and-plots
type: docs
weight: 15
section: Visualisations
aliases:
  - "../references/visual_components/geo_chart/"
---

A **geo chart** visualizes data on a map using one or more layers (pushpin layers for point data and area layers for region data).

## Configuration

`config: IGeoChartConfig` is shared by every layer. The sections below group
its fields by what they control.

### Viewport and navigation

`center`/`zoom` set the initial view (the map auto-fits to the data when
omitted). `bounds` takes priority over `center`/`zoom` and adapts to the
container's dimensions. `viewport.area` picks a preset: `"auto"` (default,
fits all data), `"world"`, or a `continent_*` value (`af`, `as`, `au`,
`eu`, `na`, `sa`). Any explicitly set `viewport.area` other than `"custom"`, including
`"auto"`, wins over `bounds` and `center`/`zoom`. Set it to `"custom"` (or
omit it) when you want those to apply.

```tsx
const config = {
    viewport: {
        area: "continent_eu",
        frozen: false,
        navigation: { pan: true, zoom: false },
    },
};
```

`viewport.frozen` (default `false`) locks all map interaction. For
finer-grained control, `viewport.navigation.pan`/`.zoom` (both default
`true`) lock panning and zooming independently.

### Legend

- `legend.enabled` (default `true`) shows or hides the legend.
- `legend.position` (default `"auto"`) places it at `"top-left"`,
  `"top-right"`, `"bottom-left"`, `"bottom-right"`, or lets `"auto"` pick
  based on available space.
- `legend.responsive` (default `false`) accepts `true` for a responsive
  layout, or `"autoPositionWithPopup"` to collapse the legend into a popup in
  small containers.

{{% alert color="warning" %}}
Geo charts use this corner-based `GeoLegendPosition`, not the four-side
`LegendPosition` documented on [Chart configuration](../chart-config/) for other
visualization types. The legacy edge values `"top"`, `"right"`, `"bottom"`,
and `"left"` are still accepted for backward compatibility, but are silently
normalized to a corner (`"top"`/`"right"` → `"top-right"`, `"bottom"` →
`"bottom-right"`, `"left"` → `"top-left"`) — passing one does not error, it
just may not land where you expect.
{{% /alert %}}

### Clustering and marker appearance

```tsx
const config = {
    points: {
        groupNearbyPoints: true,
        minSize: "0.5x",
        maxSize: "1.5x",
    },
};
```

- `points.minSize`/`points.maxSize` (both default `"normal"`) scale pushpin
  markers when a `size` measure is present: `"0.5x"`, `"0.75x"`, `"normal"`,
  `"1.25x"`, `"1.5x"`, or `"default"`.
- `points.groupNearbyPoints` (default `true`) clusters nearby pushpins.
  Clustering is applied only when the layer has no `size`, `color`, or
  `segmentBy`.
- `points.shapeType` (default `"circle"`) also accepts `"iconByValue"`
  (requires the layer's `geoIcon` attribute — see [Per-layer
  overrides](#per-layer-overrides)) or `"oneIcon"` (requires `points.icon`,
  a sprite-sheet icon name). Icon shapes do **not** fall back to circle
  markers when their required icon source is missing — the marker may
  not render.

### Area styling

| Field | Type | Default | Description |
|---|---|---|---|
| `areas.fillOpacity` | `number` | `0.7` | Opacity of filled regions (0–1). |
| `areas.borderColor` | `string` | `"#FFFFFF"` | Color of region borders. |
| `areas.borderWidth` | `number` | `1` | Width of region borders, in pixels. |

### Colors

`colors`, `colorPalette`, and `colorMapping` work the same way as on other
visualizations — see [Chart configuration](../chart-config/#configure-colors) for
the shared mechanism. On a geo chart, `colorMapping` can also be overridden
per layer; see [Per-layer overrides](#per-layer-overrides).

### Map style

`mapStyle` sets a MapLibre style URL or inline style specification for the
whole map.

```tsx
const config = { mapStyle: "https://example.com/my-style.json" };
```

### Other config fields

| Field | Type | Description |
|---|---|---|
| `isExportMode` | `boolean` | Disables gestures and preserves the drawing buffer for export. |
| `limit` | `number` | Maximum number of rendered data points. |
| `selectedSegmentItems` | `string[]` | Segment values to keep visible under legend-driven filtering. |
| `maxZoomLevel` | `number \| null` | Maximum zoom level. `undefined` keeps the default; `null` removes the cap. |
| `separators` | `ISeparators` | Custom thousand/decimal separators for formatted numbers. |
| `showLabels` | `boolean` | Shows data labels on the map, where the layer supports them. |
| `cooperativeGestures` | `boolean` | Requires Ctrl/Cmd + scroll to zoom — useful inside a scrolling page. |
| `enableExecutionCancelling` | `boolean` | Cancels a running execution when props change before it resolves. |
| `respectLegendPosition` | `boolean` | Keeps the requested legend position even when responsive heuristics disagree. |

## Per-layer overrides

Each entry in `layers` also accepts its own overrides on top of the shared
`config`:

```tsx
const layers = [
    createPushpinLayer(
        {
            latitude: Md.City.Latitude,
            longitude: Md.City.Longitude,
            color: Md.Population.Sum,
            tooltipText: Md.City.Name,
            config: {
                colorMapping: [
                    {
                        predicate: (header) => header.attributeHeaderItem?.name === "Downtown",
                        color: { type: "guid", value: "02" },
                    },
                ],
            },
        },
        "cities",
    ),
    createAreaLayer(
        {
            area: Md.Country.Name,
            color: Md.Revenue.Sum,
            tooltipText: Md.Country.IsoCode,
        },
        "countries",
    ),
];
```

- `id` is required and must be unique per layer. `createPushpinLayer`/
  `createAreaLayer` default it to a fixed per-type id (as in the second
  argument above), so give an explicit id when a chart has two layers of the
  same type.
- `name` is an optional display name; it falls back to `id` when omitted.
- `config: IGeoLayerConfig` (`colorPalette`, `colorMapping`) overrides the
  chart-level `config` for that layer only. Each field is resolved
  separately: a field set on the layer replaces the chart-level value, and
  a field left unset falls back to the chart-level value (or the default
  palette).
- `filters` on a layer run **before** the top-level `GeoChart.filters`. When
  both set a value for the same "last wins" filter type — for example a date
  filter on the same date dataset, or a measure value filter on the same
  measure — the top-level filter wins. Other filter types accumulate per the
  SDK's normal filter-merge rules.
- `sortBy` sorts that layer's data, which can affect tooltip order and
  rendering priority.
- `tooltipText` sets the attribute shown in that layer's tooltips. It only
  applies to the layer it's set on.
- Pushpin layers only: `measures` adds extra measures to the tooltip without
  affecting size or color, and `geoIcon` supplies the icon attribute
  required when `config.points.shapeType` is `"iconByValue"`.

## Map worker, bundlers, and CSP

Geo charts render with [MapLibre GL JS](https://maplibre.org/), which parses map data in a web worker. The
`@gooddata/sdk-ui-geo` package ships that worker, so you don't need to configure your bundler:

- If your bundler turns the package's `new URL("...", import.meta.url)` reference into an emitted asset (webpack,
  Vite, Rspack), the chart starts the worker from that same-origin file.
- Otherwise (Angular CLI with either builder, esbuild, Rollup without plugins, Vite library mode), the chart starts
  the worker from an inline Blob built from the worker code, which it loads on demand together with MapLibre.

If your page sets a Content Security Policy, allow both forms: `worker-src 'self' blob:`.

If your policy can't allow `blob:` workers, host `node_modules/@gooddata/sdk-ui-geo/worker/maplibre-gl-worker.js`
from your application and pass its URL to the `setWorkerUrl` function of `maplibre-gl` before the first geo chart
renders. The SDK keeps a worker URL that is already set. Your application must resolve the same copy of
`maplibre-gl` as the SDK, so declare it as a dependency with the version the SDK pins.

## Notes

- Use `GeoPushpinChart` and `GeoAreaChart` if you only need a single layer — see [Geo pushpin chart](../geo-pushpin-chart/) and [Geo area chart](../geo-area-chart/).
- Geo charts are MapLibre-based and **do not require a Mapbox access token**. If you are upgrading an older app, see [Geo pushpin chart](../geo-pushpin-chart/#map-rendering) for details about legacy Mapbox compatibility (`LegacyGeoPushpinChart`, deprecated `mapboxToken`).

## Structure

```tsx
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import { GeoChart, createAreaLayer, createPushpinLayer } from "@gooddata/sdk-ui-geo";

<GeoChart
    layers={[
        createPushpinLayer({
            latitude: <attribute>,
            longitude: <attribute>,
            size: <measure>,
            color: <measure>,
            segmentBy: <attribute>,
        }),
        createAreaLayer({
            area: <attribute>,
            color: <measure>,
            segmentBy: <attribute>,
        }),
    ]}
    config={<geo-chart-config>}
    filters={<filters>}
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import { GeoChart, createAreaLayer, createPushpinLayer } from "@gooddata/sdk-ui-geo";
import * as Md from "./catalog.js";

const layers = [
    createPushpinLayer({
        latitude: Md.City.Latitude,
        longitude: Md.City.Longitude,
        size: Md.Population.Sum,
    }),
    createAreaLayer({
        area: Md.Country.Name,
        color: Md.Revenue.Sum,
    }),
];

const config = {
    viewport: { area: "world" },
    legend: { enabled: true, position: "bottom-right" },
    points: { minSize: "0.75x", maxSize: "1.5x" },
    areas: { fillOpacity: 0.6 },
};

<div style={{ height: 600, width: 900 }}>
    <GeoChart layers={layers} config={config} />
</div>;
```

## Props

{{% props %}}

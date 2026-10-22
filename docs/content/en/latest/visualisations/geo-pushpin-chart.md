---
legacy_path: references/visual_components/geo_pushpin_chart
title: Geo pushpin chart
description: Plot data points on a map with pushpin markers using the GeoPushpinChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-geo:GeoPushpinChart"
  - "@gooddata/sdk-ui-geo:IGeoPushpinChartProps"
source_files:
  - src/next/GeoPushpinChart.tsx
  - src/next/types/props/pushpinChart/public.ts
props_interfaces:
  - IGeoPushpinChartProps
related_pages:
  - /docs/visualisations/geo-chart
  - /docs/visualisations/geo-area-chart
  - /docs/visualisations/charts-and-plots
type: docs
weight: 16
section: Visualisations
aliases:
  - "../references/visual_components/geo_pushpin_chart/"
---

A **geo pushpin chart** plots data points on a map as pushpins placed at the latitude and longitude of each location.

{{< figure src="/gd-ui/geo_pushpin_chart.png" alt="Geo pushpin chart of the United States with circles sized by a measure and colored by store type" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `latitude` | Yes | One attribute | Sets the latitude of each pin. |
| `longitude` | Yes | One attribute | Sets the longitude of each pin. |
| `size` | No | One measure or attribute | Sets the size of the pins. |
| `color` | No | One measure or attribute | Sets the color of the pins. |
| `segmentBy` | No | One attribute | Categorizes the pins, one color per value. |
| `filters` | No | Filters | Limits the data the chart shows. |

{{% alert color="info" title="Note" %}}
The obsolete single-attribute `location` prop (values in `"lat;lng"` format) is not supported on GoodData Cloud. Passing it makes `GeoPushpinChart` throw an `UnexpectedSdkError`. Use separate `latitude` and `longitude` attributes.
{{% /alert %}}

## Sorting

Pass `sortBy` to sort the data of the pushpin layer. The order can affect the tooltip order and which pins render on top.

## Configuration

Pass these options in the `config` prop (`IGeoPushpinChartConfig`). It accepts the same fields as the `GeoChart` config, without `areas` and with `tooltipText`. See [Configuration](../geo-chart/#configuration) on the Geo chart page for viewport presets, clustering, and map style options, and [Chart configuration](../chart-config/) for colors, separators, and the legend.

| Option | What it changes |
| --- | --- |
| `points` | `minSize` and `maxSize` scale the pins when `size` is set. `groupNearbyPoints` (default `true`) clusters nearby pins when `size`, `color`, and `segmentBy` are not set. |
| `viewport` | `area` sets the initial view: `"auto"` fits the data; `"world"` or a continent such as `"continent_eu"` shows that region. |
| `tooltipText` | An attribute whose values label the pins in tooltips instead of the latitude and longitude. |
| `colors`, `colorPalette`, `colorMapping` | Colors of the pins. |
| `legend` | `enabled` shows or hides the legend. `position` places it in a corner: `"top-left"`, `"top-right"`, `"bottom-left"`, or `"bottom-right"`. |
| `separators` | Thousands and decimal separators in the tooltip values. |
| `mapboxToken` | Deprecated and ignored by the MapLibre-based chart. Kept only for backward-compatible typing. |

```ts
import type { IGeoPushpinChartConfig } from "@gooddata/sdk-ui-geo";
import * as Md from "./catalog.js";

const config: IGeoPushpinChartConfig = {
    points: {
        minSize: "0.5x", // "0.5x" | "0.75x" | "normal" | "1.25x" | "1.5x"
        maxSize: "1.5x", // "0.5x" | "0.75x" | "normal" | "1.25x" | "1.5x"
        groupNearbyPoints: true, // clustering applies only when size, color, and segmentBy are not set
    },
    viewport: {
        // "auto" | "custom" | "world" | "continent_af" | "continent_as" | "continent_au"
        // | "continent_eu" | "continent_na" | "continent_sa"
        area: "world",
    },
    tooltipText: Md.StateName,
    colors: ["rgb(195, 49, 73)", "rgb(168, 194, 86)"],
    colorMapping: [
        {
            predicate: (headerItem) => headerItem.attributeHeaderItem?.name === "adult",
            color: { type: "guid", value: "02" },
        },
    ],
    legend: {
        enabled: true,
        position: "top-right", // "top" is a deprecated legacy value, normalized to "top-right"
    },
    separators: {
        thousand: ",",
        decimal: ".",
    },
};
```

### Map rendering

`GeoPushpinChart` is MapLibre-based and doesn't need a Mapbox access token. Geo charts start a MapLibre web worker. You don't need to configure your bundler; for Content Security Policy requirements and self-hosting the worker, see [Map worker, bundlers, and CSP](../geo-chart/#map-worker-bundlers-and-csp).

{{% alert color="warning" title="For users upgrading older apps (legacy Mapbox)" %}}
- The legacy Mapbox-based implementation is still available as `LegacyGeoPushpinChart`. `MapboxTokenProvider` is relevant only for it.
- The `mapboxToken` config option is deprecated and ignored by the MapLibre-based `GeoPushpinChart`.
- `InsightView` renders a saved pushpin visualization with the legacy implementation when the workspace setting `enableNewGeoPushpin` is `false`. That chart needs a Mapbox token. On GoodData Cloud and GoodData.CN, the setting is `true` by default.
{{% /alert %}}

## Limits

- A geo pushpin chart renders up to 50,000 data points, or the number you set in `config.limit`. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.

## Structure

```tsx
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import { GeoPushpinChart } from "@gooddata/sdk-ui-geo";

<GeoPushpinChart
    latitude={<attribute>} // latitude and longitude must be two separate attributes
    longitude={<attribute>}
    size={<measure>}
    color={<measure>}
    segmentBy={<attribute>}
    config={<geo-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import { GeoPushpinChart } from "@gooddata/sdk-ui-geo";
import * as Md from "./catalog.js";

const config = {
    tooltipText: Md.City.Name,
};

<div style={{ height: 600, width: 900 }}>
    <GeoPushpinChart
        latitude={Md.City.Latitude}
        longitude={Md.City.Longitude}
        size={Md.Population.Sum}
        color={Md.Density.Sum}
        segmentBy={Md.StateName}
        config={config}
    />
</div>;
```

## Props

{{% props %}}

---
title: Geo Chart
sidebar_label: Geo Chart
copyright: (C) 2026 GoodData Corporation
id: geo_chart_component
---

A **geo chart** visualizes data on a map using one or more layers (pushpin layers for point data and area layers for region data).

## Structure

```jsx
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

```jsx
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import { GeoChart, createAreaLayer, createPushpinLayer } from "@gooddata/sdk-ui-geo";
import * as Md from "./md/full";

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

<div style={{ height: 600, width: 900 }}>
    <GeoChart layers={layers} />
</div>;
```

## Notes

- Use `GeoPushpinChart` and `GeoAreaChart` if you only need a single layer.
- Geo charts are MapLibre-based and **do not require a Mapbox access token**. If you are upgrading an older app, see [Geo Pushpin Chart](./geo_pushpin_chart.md) for details about legacy Mapbox compatibility (`LegacyGeoPushpinChart`, deprecated `mapboxToken`).
- For full API documentation, see the [TypeScript definitions](../../API_references.md).

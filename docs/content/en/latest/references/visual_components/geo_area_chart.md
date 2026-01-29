---
title: Geo Area Chart
sidebar_label: Geo Area Chart
copyright: (C) 2026 GoodData Corporation
id: geo_area_chart_component
---

A **geo area chart** visualizes data by geographic regions (countries, states, ...) on a map.

## Structure

```jsx
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

```jsx
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import { GeoAreaChart } from "@gooddata/sdk-ui-geo";
import * as Md from "./md/full";

<div style={{ height: 600, width: 900 }}>
    <GeoAreaChart area={Md.Country.Name} color={Md.Revenue.Sum} />
</div>;
```

## Notes

- `GeoAreaChart` is a convenience wrapper over `GeoChart` for the single-area-layer scenario.
- Geo charts are MapLibre-based and **do not require a Mapbox access token**. If you are upgrading an older app, see [Geo Pushpin Chart](./geo_pushpin_chart.md) for details about legacy Mapbox compatibility (`LegacyGeoPushpinChart`, deprecated `mapboxToken`).
- For full API documentation, see the [TypeScript definitions](../../API_references.md).

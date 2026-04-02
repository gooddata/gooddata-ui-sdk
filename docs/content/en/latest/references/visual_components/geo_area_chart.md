---
title: Geo Area Chart
sidebar_label: Geo Area Chart
copyright: (C) 2026 GoodData Corporation
id: geo_area_chart_component
---

A **geo area chart** visualizes data by geographic regions (countries, states, provinces, etc.) as filled polygons on a map (choropleth map). It is a convenience wrapper over [Geo Chart](./geo_chart/) for the single-area-layer scenario.

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

const config = {
    viewport: {
        area: "continent_eu",
    },
    areas: {
        fillOpacity: 0.6,
        borderColor: "#333333",
        borderWidth: 2,
    },
    legend: {
        position: "bottom-right",
    },
};

<div style={{ height: 600, width: 900 }}>
    <GeoAreaChart area={Md.Country.Name} color={Md.Revenue.Sum} segmentBy={Md.Region} config={config} />
</div>;
```

## Properties

| Name                     | Required? | Type                           | Description                                                                        |
| :----------------------- | :-------- | :----------------------------- | :--------------------------------------------------------------------------------- |
| area                     | true      | AttributeOrPlaceholder         | Attribute or placeholder whose values represent geographic regions                 |
| color                    | false     | AttributeMeasureOrPlaceholder  | Measure or attribute used for color encoding                                       |
| segmentBy                | false     | AttributeOrPlaceholder         | Optional segment attribute that categorizes the regions                            |
| filters                  | false     | NullableFiltersOrPlaceholders  | Global filters applied to the primary layer and any `additionalLayers`             |
| sortBy                   | false     | SortsOrPlaceholders            | Sorting applied to the primary area layer                                          |
| config                   | false     | IGeoAreaChartConfig            | Area wrapper configuration                                                         |
| additionalLayers         | false     | IGeoLayer[]                    | Extra layers rendered after the primary area layer (for example a pushpin overlay) |
| backend                  | false     | IAnalyticalBackend             | Backend used for data execution                                                    |
| workspace                | false     | string                         | Workspace identifier                                                               |
| locale                   | false     | string                         | Locale used for UI localization. Defaults to `en-US`                               |
| drillableItems           | false     | ExplicitDrill[]                | Drill configuration for regions and attribute values                               |
| ErrorComponent           | false     | ComponentType<IErrorProps>     | Component rendered when the visualization is in an error state                     |
| LoadingComponent         | false     | ComponentType<ILoadingProps>   | Component rendered while the visualization is loading                              |
| onError                  | false     | OnError                        | Callback fired when loading or rendering fails                                     |
| onExportReady            | false     | OnExportReady                  | Callback fired when export functions become available                              |
| onLoadingChanged         | false     | OnLoadingChanged               | Callback fired when the loading state changes                                      |
| onDrill                  | false     | OnFiredDrillEvent              | Callback fired when drilling is triggered                                          |
| onCenterPositionChanged  | false     | CenterPositionChangedCallback  | Callback fired when the map center changes                                         |
| onZoomChanged            | false     | ZoomChangedCallback            | Callback fired when the map zoom level changes                                     |
| onBoundsChanged          | false     | BoundsChangedCallback          | Callback fired when the visible map bounds change                                  |
| onViewportInteractionEnd | false     | ViewportInteractionEndCallback | Callback fired when a user-triggered viewport interaction finishes                 |

## Geo Config

| Name                | Required? | Type                         | Description                                                                       |
| :------------------ | :-------- | :--------------------------- | :-------------------------------------------------------------------------------- |
| center              | false     | IGeoLngLat                   | Initial map center. Defaults to auto-centering based on data                      |
| zoom                | false     | number                       | Initial zoom level in the `0-22` range. Defaults to auto-fit                      |
| bounds              | false     | IGeoLngLatBounds             | Bounding box for a custom viewport. Takes priority over `center` and `zoom`       |
| isExportMode        | false     | boolean                      | Export mode that disables gestures and preserves the drawing buffer               |
| legend              | false     | IGeoChartLegendConfig        | Legend configuration                                                              |
| limit               | false     | number                       | Maximum number of rendered data points                                            |
| mapStyle            | false     | string \| StyleSpecification | Custom MapLibre style URL or inline style specification                           |
| basemap             | false     | GeoBasemap                   | Alpha. Basemap style identifier such as `"standard-light"` or `"satellite"`       |
| maxZoomLevel        | false     | number &#124; null           | Maximum zoom level. `undefined` keeps the default, `null` removes the limit       |
| separators          | false     | ISeparators                  | Custom number separators used for formatting                                      |
| viewport            | false     | IGeoChartViewport            | Viewport preset or advanced navigation configuration                              |
| areas               | false     | IGeoAreasConfig              | Configuration for area styling (opacity, borders)                                 |
| colors              | false     | string[]                     | Simple color palette expressed as CSS color strings                               |
| colorPalette        | false     | IColorPalette                | Structured color palette compatible with color mapping GUIDs                      |
| colorMapping        | false     | IColorMapping[]              | Explicit color mapping overrides                                                  |
| showLabels          | false     | boolean                      | Displays data labels on the map when supported                                    |
| cooperativeGestures | false     | boolean                      | When `true`, requires Ctrl/Cmd + scroll to zoom (useful inside scroll containers) |

For additional examples of colors, separators, or legend behavior, see [Chart Config](../chart_config/).

### Areas Config

| Name        | Required? | Type   | Description                                    |
| :---------- | :-------- | :----- | :--------------------------------------------- |
| fillOpacity | false     | number | Opacity of filled areas (0–1). Default: `0.7`. |
| borderColor | false     | string | Color of area borders. Default: `"#FFFFFF"`.   |
| borderWidth | false     | number | Width of area borders in pixels. Default: `1`. |

### Viewport Config

| Name       | Required? | Type                        | Description                                                                                                                                                                                                            |
| :--------- | :-------- | :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| area       | false     | IGeoChartViewportArea       | Viewport preset: `"auto"` (default) &#124; `"custom"` &#124; `"world"` &#124; `"continent_af"` &#124; `"continent_as"` &#124; `"continent_au"` &#124; `"continent_eu"` &#124; `"continent_na"` &#124; `"continent_sa"` |
| frozen     | false     | boolean                     | Locks user interaction (pan and zoom) when `true`. Defaults to `false`.                                                                                                                                                |
| navigation | false     | IGeoChartViewportNavigation | Fine-grained control: `{ pan?: boolean, zoom?: boolean }`. Defaults to both `true`.                                                                                                                                    |

### Legend Config

| Name       | Required? | Type                                         | Description                                                                                                                                                               |
| :--------- | :-------- | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| enabled    | false     | boolean                                      | Enables legend rendering. Defaults to `true`.                                                                                                                             |
| position   | false     | GeoLegendPosition \| LegacyGeoLegendPosition | `"auto"` (default), `"top-left"`, `"top-right"`, `"bottom-left"`, or `"bottom-right"`. Legacy edge values are deprecated.                                                 |
| responsive | false     | boolean &#124; `"autoPositionWithPopup"`     | `true` enables responsive legend layout. Legacy `"autoPositionWithPopup"` preserves older automatic legend placement behavior in smaller containers. Defaults to `false`. |

## Notes

- `GeoAreaChart` is a convenience wrapper over [GeoChart](./geo_chart/) for the single-area-layer scenario.
- Use the `additionalLayers` prop to overlay pushpin layers on top of the area layer.
- For full API documentation, see the [TypeScript definitions](../../API_references.md).

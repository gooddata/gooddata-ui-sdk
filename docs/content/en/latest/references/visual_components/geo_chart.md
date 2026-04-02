---
title: Geo Chart
sidebar_label: Geo Chart
copyright: (C) 2026 GoodData Corporation
id: geo_chart_component
---

A **geo chart** visualizes data on a map using one or more layers. You can compose pushpin layers (point data) and area layers (region data) into a single visualization.

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
    createAreaLayer({
        area: Md.Country.Name,
        color: Md.Revenue.Sum,
    }),
    createPushpinLayer({
        latitude: Md.City.Latitude,
        longitude: Md.City.Longitude,
        size: Md.Population.Sum,
        tooltipText: Md.City.Name,
    }),
];

const config = {
    viewport: {
        area: "continent_eu",
    },
    points: {
        groupNearbyPoints: true,
    },
    areas: {
        fillOpacity: 0.5,
    },
    cooperativeGestures: true,
};

<div style={{ height: 600, width: 900 }}>
    <GeoChart layers={layers} config={config} onBoundsChanged={(bounds) => console.log("Bounds:", bounds)} />
</div>;
```

## Properties

| Name                     | Required? | Type                           | Description                                                                                                                |
| :----------------------- | :-------- | :----------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| layers                   | true      | IGeoLayer[]                    | Array of layer definitions rendered in order. The first layer is the primary layer and drives legend and drilling behavior |
| type                     | false     | GeoLayerType                   | Visualization type reported through pushData callbacks. Defaults to the primary layer type                                 |
| config                   | false     | IGeoChartConfig                | Unified geo chart configuration                                                                                            |
| filters                  | false     | NullableFiltersOrPlaceholders  | Global filters applied to every layer execution                                                                            |
| backend                  | false     | IAnalyticalBackend             | Backend used for data execution                                                                                            |
| workspace                | false     | string                         | Workspace identifier                                                                                                       |
| locale                   | false     | string                         | Locale used for UI localization. Defaults to `en-US`                                                                       |
| drillableItems           | false     | ExplicitDrill[]                | Drill configuration for points and attribute values                                                                        |
| ErrorComponent           | false     | ComponentType<IErrorProps>     | Component rendered when the visualization is in an error state                                                             |
| LoadingComponent         | false     | ComponentType<ILoadingProps>   | Component rendered while the visualization is loading                                                                      |
| onError                  | false     | OnError                        | Callback fired when loading or rendering fails                                                                             |
| onExportReady            | false     | OnExportReady                  | Callback fired when export functions become available                                                                      |
| onLoadingChanged         | false     | OnLoadingChanged               | Callback fired when the loading state changes                                                                              |
| onDrill                  | false     | OnFiredDrillEvent              | Callback fired when drilling is triggered                                                                                  |
| onCenterPositionChanged  | false     | CenterPositionChangedCallback  | Callback fired when the map center changes                                                                                 |
| onZoomChanged            | false     | ZoomChangedCallback            | Callback fired when the map zoom level changes                                                                             |
| onBoundsChanged          | false     | BoundsChangedCallback          | Callback fired when the visible map bounds change                                                                          |
| onViewportInteractionEnd | false     | ViewportInteractionEndCallback | Callback fired when a user-triggered viewport interaction finishes                                                         |

## Layers

Layers are typically created using `createPushpinLayer(layer, id?)` and `createAreaLayer(layer, id?)`. Each layer runs its own independent data execution. The optional second argument lets you set a custom layer `id`. If you do not use the factory helpers, each layer object must include a unique `id` and a `type`.

### Common layer properties

These properties are shared by both pushpin and area layer definitions:

| Name        | Required? | Type                | Description                                                                                       |
| :---------- | :-------- | :------------------ | :------------------------------------------------------------------------------------------------ |
| name        | false     | string              | Human-readable layer name                                                                         |
| color       | false     | IAttributeOrMeasure | Measure-based gradient or attribute-based categorical color encoding                              |
| segmentBy   | false     | IAttribute          | Attribute for categorical grouping with distinct colors                                           |
| config      | false     | IGeoLayerConfig     | Per-layer color configuration: `{ colorPalette?: IColorPalette, colorMapping?: IColorMapping[] }` |
| filters     | false     | INullableFilter[]   | Filters specific to this layer's data execution                                                   |
| sortBy      | false     | ISortItem[]         | Sorting for this layer's data execution                                                           |
| tooltipText | false     | IAttribute          | Attribute whose values are shown in tooltips                                                      |

### Pushpin Layer

Created with `createPushpinLayer()`. Renders point data as markers on the map.

| Name      | Required? | Type                  | Description                                                                                             |
| :-------- | :-------- | :-------------------- | :------------------------------------------------------------------------------------------------------ |
| latitude  | true      | IAttribute            | Attribute containing latitude values (decimal degrees, `-90` to `90`)                                   |
| longitude | true      | IAttribute            | Attribute containing longitude values (decimal degrees, `-180` to `180`)                                |
| size      | false     | IAttributeOrMeasure   | Measure or attribute used for marker size scaling                                                       |
| measures  | false     | IAttributeOrMeasure[] | Additional measures shown in tooltips only                                                              |
| geoIcon   | false     | IAttribute            | Attribute whose display form type is `GDC.geo.icon`. Used with `config.points.shapeType: "iconByValue"` |

### Area Layer

Created with `createAreaLayer()`. Renders geographic regions as filled polygons (choropleth map).

| Name | Required? | Type       | Description                                                                                             |
| :--- | :-------- | :--------- | :------------------------------------------------------------------------------------------------------ |
| area | true      | IAttribute | Attribute whose values represent geographic regions (countries, states, provinces, and similar regions) |

### Layer filter semantics

Layer-specific filters are applied **before** global component-level filters. When both are provided, the global filters take precedence for filter types with "last wins" merge rules (e.g. date filters for the same dataset).

## Geo Config

The `config` prop accepts an `IGeoChartConfig` object.

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
| points              | false     | IGeoChartPointsConfig        | Configuration for pushpin markers (clustering, sizing, shape type)                |
| areas               | false     | IGeoAreasConfig              | Configuration for area layer styling (opacity, borders)                           |
| colors              | false     | string[]                     | Simple color palette expressed as CSS color strings                               |
| colorPalette        | false     | IColorPalette                | Structured color palette compatible with color mapping GUIDs                      |
| colorMapping        | false     | IColorMapping[]              | Explicit color mapping overrides                                                  |
| showLabels          | false     | boolean                      | Displays data labels on the map when supported                                    |
| cooperativeGestures | false     | boolean                      | When `true`, requires Ctrl/Cmd + scroll to zoom (useful inside scroll containers) |

For additional examples of colors, separators, or legend behavior, see [Chart Config](../chart_config/).

### Points Config

| Name              | Required? | Type                      | Description                                                                                                                             |
| :---------------- | :-------- | :------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------- |
| minSize           | false     | GeoChartPushpinSizeOption | Minimum marker size option: `"0.5x"` &#124; `"0.75x"` &#124; `"normal"` &#124; `"1.25x"` &#124; `"1.5x"` &#124; `"default"`             |
| maxSize           | false     | GeoChartPushpinSizeOption | Maximum marker size option: `"0.5x"` &#124; `"0.75x"` &#124; `"normal"` &#124; `"1.25x"` &#124; `"1.5x"` &#124; `"default"`             |
| groupNearbyPoints | false     | boolean                   | Groups nearby points into clusters. Defaults to `false`.                                                                                |
| shapeType         | false     | GeoChartShapeType         | Marker shape: `"circle"` (default), `"iconByValue"` (icon from a `geoIcon` attribute), or `"oneIcon"` (static icon from a sprite sheet) |
| icon              | false     | string                    | Sprite sheet icon name. Required when `shapeType` is `"oneIcon"`.                                                                       |

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

- Use [GeoPushpinChart](./geo_pushpin_chart/) or [GeoAreaChart](./geo_area_chart/) if you only need a single layer.
- The first layer in the `layers` array is the primary layer — it drives the legend and drilling behavior.
- Each layer executes independently and can have its own filters, sorting, and color configuration.
- For full API documentation, see the [TypeScript definitions](../../API_references.md).

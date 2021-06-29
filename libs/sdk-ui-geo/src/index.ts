// (C) 2019-2021 GoodData Corporation

/**
 * This package provides the components that you can use to visualize location-based data.
 *
 * @remarks
 * Currently, only the GeoPushpinChart component is available. Use this component to visualize data bound
 * to a single location (not an area).
 *
 * @packageDocumentation
 */

export {
    IGeoConfig,
    IGeoLngLat,
    IGeoPushpinChartProps,
    IGeoConfigViewport,
    IGeoPointsConfig,
    IGeoConfigViewportArea,
    PushpinSizeOption,
    IGeoLegendConfig,
    CenterPositionChangedCallback,
    ZoomChangedCallback,
    IGeoData,
    IGeoAttributeItem,
    IGeoLocationItem,
    IGeoSegmentItem,
    IGeoMeasureItem,
    IGeoDataItem,
} from "./GeoChart";
export { GeoPushpinChart, getGeoChartDimensions } from "./GeoPushpinChart";

export { CoreGeoChart } from "./core/CoreGeoChart";
export {
    IGeoChartInnerProps,
    ICoreGeoChartProps,
    IGeoChartInnerOptions,
    IGeoChartLegendRendererProps,
    IGeoChartRendererProps,
} from "./core/geoChart/GeoChartInner";

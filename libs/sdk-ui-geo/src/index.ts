// (C) 2019-2023 GoodData Corporation

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
    IGeoPushpinChartBaseProps,
    IGeoPushpinChartProps,
    IGeoPushpinChartLatitudeLongitudeProps,
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
} from "./GeoChart.js";
export { GeoPushpinChart, getGeoChartDimensions } from "./GeoPushpinChart.js";

export {
    MapboxTokenProvider,
    useMapboxToken,
    useMapboxTokenStrict,
    withMapboxToken,
    enrichMapboxToken,
} from "./core/MapboxTokenProvider.js";
export { CoreGeoChart } from "./core/CoreGeoChart.js";
export {
    IGeoChartInnerProps,
    ICoreGeoChartProps,
    IGeoChartInnerOptions,
    IGeoChartLegendRendererProps,
    IGeoChartRendererProps,
} from "./core/geoChart/GeoChartInner.js";

// export the getColorMappingPredicate so that users can import it directly without having to explicitly install vis-commons
export { getColorMappingPredicate } from "@gooddata/sdk-ui-vis-commons";

// (C) 2019-2022 GoodData Corporation

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
    ILocationGeoPushpinChartProps,
    ILongitudeLatitudeGeoPushpinChartProps,
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
    isLocationGeoPushpinChartProps,
    isLatitudeLongitudeGeoPushpinChartProps,
} from "./GeoChart";
export { GeoPushpinChart, getGeoChartDimensions } from "./GeoPushpinChart";

export {
    MapboxTokenProvider,
    useMapboxToken,
    useMapboxTokenStrict,
    withMapboxToken,
    enrichMapboxToken,
} from "./core/MapboxTokenProvider";
export { CoreGeoChart } from "./core/CoreGeoChart";
export {
    IGeoChartInnerProps,
    ICoreGeoChartProps,
    IGeoChartInnerOptions,
    IGeoChartLegendRendererProps,
    IGeoChartRendererProps,
} from "./core/geoChart/GeoChartInner";

// export the getColorMappingPredicate so that users can import it directly without having to explicitly install vis-commons
export { getColorMappingPredicate } from "@gooddata/sdk-ui-vis-commons";

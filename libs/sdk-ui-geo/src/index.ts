// (C) 2019-2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

/**
 * This package provides the components that you can use to visualize location-based data.
 *
 * @remarks
 * This package provides:
 * - GeoPushpinChart (single-layer pushpin chart)
 * - GeoAreaChart (single-layer area chart)
 * - GeoChart (multi-layer geo visualization)
 *
 * @packageDocumentation
 */

export type {
    IGeoConfig,
    IGeoConfigViewport,
    IGeoPointsConfig,
    IGeoConfigViewportArea,
    PushpinSizeOption,
    IGeoLegendConfig,
    IGeoData,
    IGeoAttributeItem,
    IGeoLocationItem,
    IGeoSegmentItem,
    IGeoMeasureItem,
    IGeoDataItem,
    ILegacyGeoPushpinChartBaseProps,
    ILegacyGeoPushpinChartLatitudeLongitudeProps,
    ILegacyGeoPushpinChartProps,
} from "./GeoChart.js";
export type {
    IGeoPushpinChartBaseProps,
    IGeoPushpinChartLatitudeLongitudeProps,
    IGeoPushpinChartLocationProps,
    IGeoPushpinChartProps,
} from "./next/types/props/pushpinChart/public.js";
export type {
    CenterPositionChangedCallback,
    IGeoLngLat,
    IGeoLngLatBounds,
    ZoomChangedCallback,
} from "./publicTypes/geoCommon.js";
export { GeoPushpinChart } from "./next/GeoPushpinChart.js";
export { LegacyGeoPushpinChart, getGeoChartDimensions } from "./GeoPushpinChart.js";

export type { IGeoPushpinChartConfig } from "./next/types/config/pushpinChart.js";

export { GeoChart } from "./next/GeoChart.js";
export type { IGeoChartProps } from "./next/types/props/geoChart/public.js";
export type { IGeoChartConfig } from "./next/types/config/unified.js";

export { GeoAreaChart } from "./next/GeoAreaChart.js";
export type { IGeoAreaChartBaseProps, IGeoAreaChartProps } from "./next/types/props/areaChart/public.js";
export type { IGeoAreaChartConfig } from "./next/types/config/areaChart.js";
export type { IGeoAreasConfig } from "./next/types/config/areas.js";

export type { GeoTileset } from "./next/types/map/tileset.js";
export {
    isGeoLayerArea,
    isGeoLayerPushpin,
    type GeoLayerType,
    type IGeoLayerBase,
    type IGeoLayer,
    type IGeoLayerConfig,
    type IGeoLayerArea,
    type IGeoLayerPushpin,
} from "./next/types/layers/index.js";

export { createAreaLayer } from "./next/layers/area/layerFactory.js";
export { createPushpinLayer } from "./next/layers/pushpin/layerFactory.js";
export type { IGeoCommonExecutionProps, IGeoSingleLayerWrapperProps } from "./next/types/props/shared.js";

export type { IGeoChartLegendConfig } from "./next/types/config/legend.js";
export {
    isValidViewportArea,
    type IGeoChartViewport,
    type IGeoChartViewportArea,
} from "./next/types/config/viewport.js";
export {
    isValidPushpinSizeOption,
    type GeoChartPushpinSizeOption,
    type IGeoChartPointsConfig,
} from "./next/types/config/points.js";

export type { StyleSpecification } from "./next/layers/common/mapFacade.js";

export {
    MapboxTokenProvider,
    useMapboxToken,
    useMapboxTokenStrict,
    withMapboxToken,
    enrichMapboxToken,
} from "./core/MapboxTokenProvider.js";
export { CoreGeoChart } from "./core/CoreGeoChart.js";
export type {
    IGeoChartInnerProps,
    ICoreGeoChartProps,
    IGeoChartInnerOptions,
} from "./core/geoChart/GeoChartInner.js";
export type { IGeoChartRendererProps } from "./core/geoChart/GeoChartRenderer.js";
export type { IGeoChartLegendRendererProps } from "./core/geoChart/GeoChartLegendRenderer.js";

// export the getColorMappingPredicate so that users can import it directly without having to explicitly install vis-commons
export { getColorMappingPredicate } from "@gooddata/sdk-ui-vis-commons";

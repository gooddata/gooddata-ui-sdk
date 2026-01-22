// (C) 2025-2026 GoodData Corporation

export { GeoPushpinChartNext, PUSHPIN_LAYER_ID } from "./GeoPushpinChartNext.js";
export type {
    IGeoPushpinChartNextBaseProps,
    IGeoPushpinChartNextProps,
} from "./types/props/pushpinChart/public.js";
export type { ICoreGeoPushpinChartNextProps } from "./types/props/pushpinChart/internal.js";
export type { IGeoPushpinChartNextConfig } from "./types/config/pushpinChart.js";
export {
    isValidViewportArea,
    VALID_VIEWPORT_AREAS,
    type IGeoConfigViewportNext,
    type IGeoConfigViewportAreaNext,
} from "./types/config/viewport.js";
export {
    isValidPushpinSizeOption,
    VALID_PUSHPIN_SIZE_OPTIONS,
    type IGeoPointsConfigNext,
    type PushpinSizeOptionNext,
} from "./types/config/points.js";
export type { IGeoLegendConfigNext } from "./types/config/legend.js";

export { GeoAreaChart, AREA_LAYER_ID } from "./GeoAreaChart.js";
export type { IGeoAreaChartBaseProps, IGeoAreaChartProps } from "./types/props/areaChart/public.js";
export type { ICoreGeoAreaChartProps } from "./types/props/areaChart/internal.js";
export type { IGeoAreaChartConfig } from "./types/config/areaChart.js";
export type { IGeoAreasConfig } from "./types/config/areas.js";

export { GeoChartNext, GeoChartNextInternal } from "./GeoChartNext.js";
export type { IGeoChartNextProps } from "./types/props/geoChartNext/public.js";
export type { IGeoChartNextConfig } from "./types/config/unified.js";
export {
    isGeoLayerPushpin,
    isGeoLayerArea,
    type IGeoLayer,
    type IGeoLayerPushpin,
    type IGeoLayerArea,
    type GeoLayerType,
} from "./types/layers/index.js";

export {
    insightLayerToGeoLayer,
    insightLayersToGeoLayers,
    GEO_LAYER_TYPES,
} from "./utils/layerConversion.js";
export { buildLayerExecution } from "./layers/execution/buildLayerExecution.js";

export { createPushpinLayer } from "./layers/pushpin/layerFactory.js";
export { createAreaLayer } from "./layers/area/layerFactory.js";

export { GEO_CHART_DEFAULTS, type IGeoChartDefaults } from "./constants/defaults.js";

// Constants
export { TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID } from "./layers/common/constants.js";

export type { CenterPositionChangedCallback, ZoomChangedCallback } from "./types/common/callbacks.js";

// (C) 2025-2026 GoodData Corporation

/* eslint-disable no-barrel-files/no-barrel-files */

export type { IGeoPushpinChartBaseProps, IGeoPushpinChartProps } from "./types/props/pushpinChart/public.js";
export type { ICoreGeoPushpinChartProps } from "./types/props/pushpinChart/internal.js";
export type { IGeoPushpinChartConfig } from "./types/config/pushpinChart.js";
export {
    isValidViewportArea,
    VALID_VIEWPORT_AREAS,
    type IGeoChartViewport,
    type IGeoChartViewportArea,
} from "./types/config/viewport.js";
export {
    isValidPushpinSizeOption,
    VALID_PUSHPIN_SIZE_OPTIONS,
    type IGeoChartPointsConfig,
    type GeoChartPushpinSizeOption,
} from "./types/config/points.js";
export type { IGeoChartLegendConfig } from "./types/config/legend.js";

export { GeoAreaChart } from "./GeoAreaChart.js";
export type { IGeoAreaChartBaseProps, IGeoAreaChartProps } from "./types/props/areaChart/public.js";
export type { ICoreGeoAreaChartProps } from "./types/props/areaChart/internal.js";
export type { IGeoAreaChartConfig } from "./types/config/areaChart.js";
export type { IGeoAreasConfig } from "./types/config/areas.js";
export type { GeoTileset } from "./types/map/tileset.js";

export { GeoChart, GeoChartInternal } from "./GeoChart.js";
export type { IGeoChartProps } from "./types/props/geoChart/public.js";
export type { IGeoChartConfig } from "./types/config/unified.js";
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

export { createPushpinLayer, PUSHPIN_LAYER_ID } from "./layers/pushpin/layerFactory.js";
export { createAreaLayer, AREA_LAYER_ID } from "./layers/area/layerFactory.js";

export { GEO_CHART_DEFAULTS, type IGeoChartDefaults } from "./constants/defaults.js";

// Constants
export { TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID } from "./layers/common/constants.js";

export type { CenterPositionChangedCallback, ZoomChangedCallback } from "./types/common/callbacks.js";

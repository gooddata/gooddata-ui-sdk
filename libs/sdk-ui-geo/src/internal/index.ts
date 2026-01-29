// (C) 2026 GoodData Corporation

/* eslint-disable no-barrel-files/no-barrel-files */

/**
 * Internal entrypoint for `@gooddata/sdk-ui-geo`.
 *
 * @remarks
 * Not part of the supported public API. May change without notice.
 *
 * @internal
 */

export { GeoChartInternal } from "../next/GeoChart.js";
export { buildLayerExecution } from "../next/layers/execution/buildLayerExecution.js";
export type { IGeoAdapterContext } from "../next/layers/registry/adapterTypes.js";
export type { ICoreGeoChartProps } from "../next/types/props/geoChart/internal.js";
export { AREA_LAYER_ID } from "../next/layers/area/layerFactory.js";
export { PUSHPIN_LAYER_ID } from "../next/layers/pushpin/layerFactory.js";
export {
    GEO_LAYER_TYPES,
    insightLayerToGeoLayer,
    insightLayersToGeoLayers,
} from "../next/utils/layerConversion.js";

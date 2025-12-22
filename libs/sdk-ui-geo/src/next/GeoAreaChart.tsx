// (C) 2025 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { GeoChartNext } from "./GeoChartNext.js";
import { AREA_LAYER_ID, createAreaLayer } from "./layers/area/layerFactory.js";
import { type IGeoLayer } from "./types/layers/index.js";
import { type IGeoAreaChartProps } from "./types/props/areaChart/public.js";

export { AREA_LAYER_ID };

/**
 * GeoAreaChart wraps {@link GeoChartNext} for the single area-layer scenario.
 *
 * @alpha
 */
export function GeoAreaChart(props: IGeoAreaChartProps): ReactElement {
    const { area, color, segmentBy, filters, sortBy, config, additionalLayers, ...restProps } = props;

    const primaryLayer = useMemo(
        () =>
            createAreaLayer({
                area,
                color,
                segmentBy,
                sortBy,
            }),
        [area, color, segmentBy, sortBy],
    );

    const allLayers = useMemo<IGeoLayer[]>(
        () => [primaryLayer, ...(additionalLayers ?? [])],
        [primaryLayer, additionalLayers],
    );

    return <GeoChartNext {...restProps} layers={allLayers} config={config} filters={filters} />;
}

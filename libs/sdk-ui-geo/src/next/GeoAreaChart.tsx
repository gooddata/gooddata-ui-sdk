// (C) 2025-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { useResolveValuesWithPlaceholders } from "@gooddata/sdk-ui";

import { GeoChart } from "./GeoChart.js";
import { createAreaLayer } from "./layers/area/layerFactory.js";
import { type IGeoLayer } from "./types/layers/index.js";
import { type IGeoAreaChartProps } from "./types/props/areaChart/public.js";

/**
 * GeoAreaChart wraps {@link GeoChart} for the single area-layer scenario.
 *
 * @public
 */
export function GeoAreaChart(props: IGeoAreaChartProps): ReactElement {
    const {
        area: areaInput,
        color: colorInput,
        segmentBy: segmentByInput,
        sortBy: sortByInput,
        filters,
        config,
        additionalLayers,
        placeholdersResolutionContext,
        ...restProps
    } = props;

    const [area, color, segmentBy, sortBy] = useResolveValuesWithPlaceholders(
        [areaInput, colorInput, segmentByInput, sortByInput],
        placeholdersResolutionContext,
    );

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

    return <GeoChart {...restProps} layers={allLayers} config={config} filters={filters} />;
}

// (C) 2025 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { GeoChartNext } from "./GeoChartNext.js";
import { PUSHPIN_LAYER_ID, createPushpinLayer } from "./layers/pushpin/layerFactory.js";
import { type IGeoLayer } from "./types/layers/index.js";
import { type IGeoPushpinChartNextProps } from "./types/props/pushpinChart/public.js";

export { PUSHPIN_LAYER_ID };

/**
 * GeoPushpinChartNext wraps {@link GeoChartNext} for the single pushpin-layer scenario.
 *
 * @alpha
 */
export function GeoPushpinChartNext(props: IGeoPushpinChartNextProps): ReactElement {
    const {
        latitude,
        longitude,
        segmentBy,
        size,
        color,
        filters,
        sortBy,
        config,
        additionalLayers,
        ...restProps
    } = props;

    const primaryLayer = useMemo(
        () =>
            createPushpinLayer({
                latitude,
                longitude,
                size,
                color,
                segmentBy,
                filters,
                sortBy,
            }),
        [latitude, longitude, size, color, segmentBy, filters, sortBy],
    );

    const allLayers = useMemo<IGeoLayer[]>(
        () => [primaryLayer, ...(additionalLayers ?? [])],
        [primaryLayer, additionalLayers],
    );

    return <GeoChartNext {...restProps} layers={allLayers} config={config} />;
}

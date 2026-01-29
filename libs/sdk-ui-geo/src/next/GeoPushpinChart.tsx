// (C) 2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { UnexpectedSdkError, useResolveValuesWithPlaceholders } from "@gooddata/sdk-ui";

import { GeoChart } from "./GeoChart.js";
import { createPushpinLayer } from "./layers/pushpin/layerFactory.js";
import type { IGeoPushpinChartConfig } from "./types/config/pushpinChart.js";
import type { IGeoChartConfig } from "./types/config/unified.js";
import type {
    IGeoPushpinChartLatitudeLongitudeProps,
    IGeoPushpinChartProps,
} from "./types/props/pushpinChart/public.js";

function mapPushpinConfigToGeoChartConfig(
    config: IGeoPushpinChartConfig | undefined,
): IGeoChartConfig | undefined {
    if (!config) {
        return undefined;
    }

    // `tooltipText` is handled via the pushpin layer; `mapboxToken` is legacy-only.
    const { tooltipText: _tooltipText, mapboxToken: _mapboxToken, ...geoChartConfig } = config;
    return geoChartConfig;
}

function GeoPushpinChartLatitudeLongitude(props: IGeoPushpinChartLatitudeLongitudeProps): ReactElement {
    const [longitude, latitude, size, color, segmentBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [
            props.longitude,
            props.latitude,
            props.size,
            props.color,
            props.segmentBy,
            props.filters,
            props.sortBy,
        ],
        props.placeholdersResolutionContext,
    );

    const { config: pushpinConfig, ...restProps } = props;
    const config = mapPushpinConfigToGeoChartConfig(pushpinConfig);

    const layer = useMemo(
        () =>
            createPushpinLayer({
                latitude,
                longitude,
                ...(size ? { size } : {}),
                ...(color ? { color } : {}),
                ...(segmentBy ? { segmentBy } : {}),
                ...(sortBy ? { sortBy } : {}),
                ...(pushpinConfig?.tooltipText ? { tooltipText: pushpinConfig.tooltipText } : {}),
            }),
        [latitude, longitude, size, color, segmentBy, sortBy, pushpinConfig?.tooltipText],
    );

    return <GeoChart {...restProps} layers={[layer]} config={config} filters={filters} type="pushpin" />;
}

/**
 * MapLibre-based GeoPushpinChart implementation.
 *
 * @remarks
 * The `location` prop (single attribute encoding `lat;long`) is not supported on Tiger.
 *
 * @public
 */
export function GeoPushpinChart(props: IGeoPushpinChartProps): ReactElement {
    if ("location" in props) {
        throw new UnexpectedSdkError(
            'GeoPushpinChart no longer supports the "location" prop. ' +
                'On Tiger, use separate "latitude" and "longitude" attributes.',
        );
    }

    return <GeoPushpinChartLatitudeLongitude {...props} />;
}

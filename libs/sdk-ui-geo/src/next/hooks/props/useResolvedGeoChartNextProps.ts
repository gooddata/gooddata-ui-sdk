// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { useResolveValueWithPlaceholders } from "@gooddata/sdk-ui";

import { EMPTY_DRILLS, EMPTY_FILTERS, EMPTY_OBJECT } from "../../constants/emptyDefaults.js";
import { applyAreaConfigDefaults } from "../../layers/area/config/defaults.js";
import { applyPushpinConfigDefaults } from "../../layers/pushpin/config/defaults.js";
import { applySharedGeoConfigDefaults } from "../../map/style/sharedDefaults.js";
import { type IGeoChartNextConfig } from "../../types/config/unified.js";
import { type IGeoChartNextResolvedProps } from "../../types/props/geoChartNext/internal.js";
import { type IGeoChartNextProps } from "../../types/props/geoChartNext/public.js";

/**
 * Resolves placeholders, applies defaults, and derives chart type for GeoChartNext.
 *
 * Pipeline: public props → placeholder resolution → defaults → resolved type → executions upstream.
 *
 * @param props - GeoChartNext props potentially containing placeholders
 * @returns Resolved props with placeholders replaced, defaults applied, and chart type derived
 *
 * @internal
 */
export function useResolvedGeoChartNextProps(props: IGeoChartNextProps): IGeoChartNextResolvedProps {
    const resolvedLayers = useResolveValueWithPlaceholders(props.layers);
    const resolvedFilters = useResolveValueWithPlaceholders(props.filters ?? EMPTY_FILTERS);
    const resolvedType = props.type ?? resolvedLayers[0]?.type ?? props.layers[0]?.type ?? "pushpin";

    const config = useMemo(() => applyGeoChartNextConfigDefaults(props.config), [props.config]);

    return useMemo(
        () => ({
            ...props,
            layers: resolvedLayers,
            type: resolvedType,
            drillableItems: props.drillableItems ?? EMPTY_DRILLS,
            filters: resolvedFilters,
            execConfig: props.execConfig ?? EMPTY_OBJECT,
            config,
        }),
        [props, resolvedLayers, resolvedFilters, resolvedType, config],
    );
}

/**
 * Applies shared + layer-specific config defaults.
 *
 * @internal
 */
export function applyGeoChartNextConfigDefaults(
    config: IGeoChartNextConfig | undefined,
): IGeoChartNextConfig {
    return applyAreaConfigDefaults(applyPushpinConfigDefaults(applySharedGeoConfigDefaults(config)));
}

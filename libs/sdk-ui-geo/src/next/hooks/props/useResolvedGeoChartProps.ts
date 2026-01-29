// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { type INullableFilter } from "@gooddata/sdk-model";
import { useResolveValueWithPlaceholders } from "@gooddata/sdk-ui";

import { EMPTY_DRILLS, EMPTY_FILTERS, EMPTY_OBJECT } from "../../constants/emptyDefaults.js";
import { applyAreaConfigDefaults } from "../../layers/area/config/defaults.js";
import { applyPushpinConfigDefaults } from "../../layers/pushpin/config/defaults.js";
import { applySharedGeoConfigDefaults } from "../../map/style/sharedDefaults.js";
import { type IGeoChartConfig } from "../../types/config/unified.js";
import { type IGeoChartResolvedProps } from "../../types/props/geoChart/internal.js";
import { type IGeoChartProps } from "../../types/props/geoChart/public.js";

/**
 * Resolves placeholders, applies defaults, and derives chart type for GeoChart.
 *
 * Pipeline: public props → placeholder resolution → defaults → resolved type → executions upstream.
 *
 * @internal
 */
export function useResolvedGeoChartProps(props: IGeoChartProps): IGeoChartResolvedProps {
    const resolvedLayers = useResolveValueWithPlaceholders(props.layers, props.placeholdersResolutionContext);
    const resolvedFiltersValue = useResolveValueWithPlaceholders(
        props.filters ?? EMPTY_FILTERS,
        props.placeholdersResolutionContext,
    );
    const resolvedFilters = useMemo<INullableFilter[]>(
        () =>
            Array.isArray(resolvedFiltersValue)
                ? resolvedFiltersValue
                : resolvedFiltersValue
                  ? [resolvedFiltersValue]
                  : EMPTY_FILTERS,
        [resolvedFiltersValue],
    );
    const resolvedType = props.type ?? resolvedLayers[0]?.type ?? props.layers[0]?.type ?? "pushpin";

    const config = useMemo(() => applyGeoChartConfigDefaults(props.config), [props.config]);

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
export function applyGeoChartConfigDefaults(config: IGeoChartConfig | undefined): IGeoChartConfig {
    return applyAreaConfigDefaults(applyPushpinConfigDefaults(applySharedGeoConfigDefaults(config)));
}

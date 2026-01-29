// (C) 2025-2026 GoodData Corporation

import { DefaultColorPalette } from "@gooddata/sdk-ui";

import { type IGeoChartConfig } from "../../types/config/unified.js";

type ConfigWithDefaults = IGeoChartConfig & {
    legend: NonNullable<IGeoChartConfig["legend"]>;
};

/**
 * Applies shared (layer-agnostic) defaults for GeoChart config.
 *
 * @internal
 */
export function applySharedGeoConfigDefaults(config: IGeoChartConfig | undefined): ConfigWithDefaults {
    const resolvedConfig = config ?? {};
    const legend = resolvedConfig.legend ?? {};

    return {
        ...resolvedConfig,
        center: resolvedConfig.center,
        zoom: resolvedConfig.zoom,
        legend: {
            ...legend,
            enabled: legend.enabled ?? true,
            position: legend.position ?? "top",
        },
        colorPalette: resolvedConfig.colorPalette ?? DefaultColorPalette,
        colorMapping: resolvedConfig.colorMapping ?? [],
        cooperativeGestures: resolvedConfig.cooperativeGestures ?? true,
    };
}

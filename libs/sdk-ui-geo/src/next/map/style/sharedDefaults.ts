// (C) 2025 GoodData Corporation

import { DefaultColorPalette } from "@gooddata/sdk-ui";

import { IGeoChartNextConfig } from "../../types/config/unified.js";

type ConfigWithDefaults = IGeoChartNextConfig & {
    legend: NonNullable<IGeoChartNextConfig["legend"]>;
};

/**
 * Applies shared (layer-agnostic) defaults for GeoChartNext config.
 *
 * @internal
 */
export function applySharedGeoConfigDefaults(config: IGeoChartNextConfig | undefined): ConfigWithDefaults {
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

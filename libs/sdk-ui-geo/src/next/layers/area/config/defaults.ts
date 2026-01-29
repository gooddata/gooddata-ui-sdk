// (C) 2025-2026 GoodData Corporation

import { type IGeoChartConfig } from "../../../types/config/unified.js";

/**
 * Applies area-specific defaults (fill/outline styling).
 *
 * @internal
 */
export function applyAreaConfigDefaults(config: IGeoChartConfig): IGeoChartConfig {
    const areas = config.areas ?? {};

    return {
        ...config,
        areas: {
            ...areas,
            fillOpacity: areas.fillOpacity ?? 0.7,
            borderColor: areas.borderColor ?? "#FFFFFF",
            borderWidth: areas.borderWidth ?? 1,
        },
    };
}

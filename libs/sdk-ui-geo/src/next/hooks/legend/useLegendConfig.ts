// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { type PositionType } from "@gooddata/sdk-ui-vis-commons";

import { type IGeoChartConfig } from "../../types/config/unified.js";

/**
 * Legend configuration computed from geo config.
 *
 * @internal
 */
export interface ILegendConfig {
    /**
     * Whether legend should be rendered
     */
    enabled: boolean;

    /**
     * Legend position relative to the chart
     */
    position: PositionType;

    /**
     * Responsive behavior setting
     */
    responsive: boolean | "autoPositionWithPopup";
}

/**
 * Hook to compute legend configuration from geo config.
 *
 * @remarks
 * This hook extracts and normalizes legend configuration from the geo config,
 * providing sensible defaults for enabled, position, and responsive settings.
 *
 * @param config - Geo chart configuration
 * @returns Normalized legend configuration
 *
 * @internal
 */
export function useLegendConfig(config?: IGeoChartConfig): ILegendConfig {
    return useMemo(() => {
        const legendConfig = config?.legend;

        return {
            enabled: legendConfig?.enabled ?? true,
            position: legendConfig?.position ?? "top",
            responsive: legendConfig?.responsive ?? false,
        };
    }, [config?.legend]);
}

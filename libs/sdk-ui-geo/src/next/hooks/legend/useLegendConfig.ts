// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { PositionType } from "@gooddata/sdk-ui-vis-commons";

import { IGeoPushpinChartNextConfig } from "../../types/config.js";

/**
 * Legend configuration computed from geo config.
 *
 * @alpha
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
 * @alpha
 */
export function useLegendConfig(config?: IGeoPushpinChartNextConfig): ILegendConfig {
    return useMemo(() => {
        const legendConfig = config?.legend;

        return {
            enabled: legendConfig?.enabled ?? true,
            position: legendConfig?.position ?? "top",
            responsive: legendConfig?.responsive ?? false,
        };
    }, [config?.legend]);
}

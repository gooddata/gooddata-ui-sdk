// (C) 2026 GoodData Corporation

import { type ICustomTooltipConfig } from "@gooddata/sdk-ui-vis-commons";

import { type IGeoChartConfig } from "../../types/config/unified.js";
import { type IGeoLayer } from "../../types/layers/index.js";

/**
 * Resolves the effective custom tooltip for a layer: the layer's own config takes
 * precedence, falling back to the chart-level config.
 *
 * @remarks
 * The pluggable visualizations store the tooltip per layer, so the chart-level
 * fallback only applies when GeoChart is used directly. This precedence is the
 * feature's central invariant — kept here so every call site stays in lockstep.
 *
 * @internal
 */
export function resolveLayerCustomTooltip(
    layer: IGeoLayer,
    chartConfig: IGeoChartConfig | undefined,
): ICustomTooltipConfig | undefined {
    // Feature-flag gate (defaults on): when explicitly disabled, ignore any persisted custom
    // tooltip (layer or chart-level).
    if (chartConfig?.enableCustomTooltip === false) {
        return undefined;
    }
    return layer.config?.customTooltip ?? chartConfig?.customTooltip;
}

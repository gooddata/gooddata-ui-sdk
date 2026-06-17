// (C) 2026 GoodData Corporation

/**
 * Assembles the custom-tooltip section / separator HTML for a hovered Highcharts
 * point: external values from the secondary-execution lookup, the chart's own
 * per-point metric values, and the hovered point's drill intersection. A
 * reference absent from all three renders as unretrievable. Lives in the
 * customTooltip module rather than the general chart-config file.
 */

import { type ITooltipLocalizedStrings, composeCustomTooltipSectionHtml } from "@gooddata/sdk-ui-vis-commons";

import { type IChartConfig } from "../../../../interfaces/chartConfig.js";
import { type ICustomTooltipRuntime, type IUnsafeHighchartsTooltipPoint } from "../../../typings/unsafe.js";

import { resolveReferencesFromPoint } from "./referenceResolver.js";
import { buildPointKey } from "./tooltipLookup.js";

/**
 * @internal
 */
export function getCustomTooltipSection(
    point: IUnsafeHighchartsTooltipPoint,
    localizedStrings: ITooltipLocalizedStrings,
    chartConfig?: IChartConfig,
    customTooltipRuntime?: ICustomTooltipRuntime,
): string {
    const customTooltip = chartConfig?.customTooltip;
    if (!customTooltip?.enabled || !customTooltip.content) {
        return "";
    }

    const intersection = point.drillIntersection ?? [];
    const pointKey = buildPointKey(intersection);

    const externalValues = customTooltipRuntime?.tooltipLookup?.get(pointKey) ?? {};
    const chartValues = customTooltipRuntime?.chartLookup?.get(pointKey) ?? {};
    const pointLocal = resolveReferencesFromPoint(
        point,
        chartConfig?.separators,
        customTooltipRuntime?.identifierMapping,
    );

    // Precedence: hovered point > chart-wide lookup > external. The chart-wide
    // lookup fills refs the hovered point lacks — siblings and null cells (F1-2510).
    return composeCustomTooltipSectionHtml(
        customTooltip.content,
        { ...chartValues, ...pointLocal },
        externalValues,
        localizedStrings,
    );
}

/**
 * @internal
 */
export function getCustomTooltipSeparator(chartConfig?: IChartConfig): string {
    const customTooltip = chartConfig?.customTooltip;
    if (!customTooltip?.enabled || !customTooltip.content) {
        return "";
    }

    if (customTooltip.placement === "replace") {
        return "";
    }

    return `<div class="gd-viz-tooltip-custom-separator"></div>`;
}

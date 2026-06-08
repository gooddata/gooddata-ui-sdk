// (C) 2026 GoodData Corporation

/**
 * Assembles the custom-tooltip section / separator HTML for a hovered Highcharts
 * point: external values from the precomputed lookup, merged with in-chart values
 * from the point's drill intersection. A reference absent from the lookup renders
 * as unretrievable. Lives in the customTooltip module rather than the general
 * chart-config file.
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

    // External values from the precomputed lookup (refs not in the chart).
    const intersection = point.drillIntersection ?? [];
    const pointKey = buildPointKey(intersection);
    const externalValues = customTooltipRuntime?.tooltipLookup?.get(pointKey) ?? {};

    // In-chart values from the hovered point's drill intersection.
    const pointLocal = resolveReferencesFromPoint(
        point,
        chartConfig?.separators,
        customTooltipRuntime?.identifierMapping,
    );

    return composeCustomTooltipSectionHtml(
        customTooltip.content,
        pointLocal,
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

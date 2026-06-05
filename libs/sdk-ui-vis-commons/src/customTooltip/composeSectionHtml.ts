// (C) 2026 GoodData Corporation

import { markdownToHtml } from "./markdownToHtml.js";
import { resolveReferences } from "./referenceResolver.js";
import { type IResolvedReferenceValues, type ITooltipLocalizedStrings } from "./types.js";

/**
 * Merge order matters: in-chart values override external ones, because the
 * in-chart value is what the user already sees on the rendered point/feature.
 * If a tooltip references the same id from both, showing the external (fetched)
 * value would let it drift from what the chart pixel displays.
 *
 * @internal
 */
export function composeCustomTooltipSectionHtml(
    content: string,
    inChartValues: IResolvedReferenceValues,
    externalValues: IResolvedReferenceValues,
    localizedStrings: ITooltipLocalizedStrings,
): string {
    const merged = { ...externalValues, ...inChartValues };
    const resolved = resolveReferences(content, merged, localizedStrings);
    return `<div class="gd-viz-tooltip-custom-section">${markdownToHtml(resolved)}</div>`;
}

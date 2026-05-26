// (C) 2026 GoodData Corporation

import { type ISeparators } from "@gooddata/sdk-model";
import { type ICustomTooltipConfig, composeCustomTooltipSectionHtml } from "@gooddata/sdk-ui-vis-commons";

import { type ITooltipReferenceMaps } from "../registry/adapterTypes.js";

import { type IGeoLayerTooltipLookup } from "./customTooltipExecution.js";
import { resolveReferencesFromGeoFeature } from "./resolveReferencesFromGeoFeature.js";

interface ICustomTooltipPieces {
    /** Wrapped `<div class="gd-viz-tooltip-custom-section">…</div>` or "" if disabled/empty. */
    sectionHtml: string;
    /** Wrapped `<div class="gd-viz-tooltip-custom-separator"></div>` or "" if no separator should render. */
    separatorHtml: string;
}

/**
 * Build the custom-tooltip section + separator HTML pieces for a hovered feature.
 *
 * The caller decides how to splice the pieces into the surrounding tooltip body
 * based on `customConfig.placement` (above / below / replace).
 *
 * @internal
 */
export function buildCustomTooltipPieces(
    properties: GeoJSON.GeoJsonProperties,
    customConfig: ICustomTooltipConfig | undefined,
    referenceMaps: ITooltipReferenceMaps | undefined,
    separators: ISeparators | undefined,
    fallbackText: string,
    noDataLabel: string,
    tooltipLookup?: IGeoLayerTooltipLookup,
): ICustomTooltipPieces {
    if (!customConfig?.enabled || !customConfig.content) {
        return { sectionHtml: "", separatorHtml: "" };
    }

    // In-chart values from the rendered feature's properties.
    const pointLocal = resolveReferencesFromGeoFeature(properties, referenceMaps, separators, noDataLabel);

    // External values from the precomputed lookup (refs not on the feature).
    let externalValues: Record<string, string | undefined> = {};
    if (tooltipLookup) {
        const featureKey = tooltipLookup.buildFeatureKey(properties);
        if (featureKey != null) {
            externalValues = tooltipLookup.lookup.get(featureKey) ?? {};
        }
    }

    const sectionHtml = composeCustomTooltipSectionHtml(
        customConfig.content,
        pointLocal,
        externalValues,
        fallbackText,
    );

    // Replace mode shows only the custom section, so no separator is needed.
    const separatorHtml =
        customConfig.placement === "replace" ? "" : `<div class="gd-viz-tooltip-custom-separator"></div>`;

    return { sectionHtml, separatorHtml };
}

/**
 * Splice custom-tooltip pieces into the default tooltip body.
 *
 * - `above` (default): custom section above the default items.
 * - `below`: custom section below the default items.
 * - `replace`: custom section replaces the default items entirely (interaction
 *   message stays since it's a behavioral hint, not data content).
 *
 * `defaultItemsHtml` is the rendered default items (locationName / size /
 * color / segment / measures) — not the interaction message. The caller
 * appends `interactionHtml` after this function returns.
 *
 * @internal
 */
export function composeTooltipBody(
    defaultItemsHtml: string,
    pieces: ICustomTooltipPieces,
    placement: ICustomTooltipConfig["placement"] | undefined,
): string {
    if (!pieces.sectionHtml) {
        return defaultItemsHtml;
    }

    if (placement === "replace") {
        return pieces.sectionHtml;
    }

    // Suppress the separator when there's no default body to separate from —
    // otherwise the user sees an orphan rule line above/below the custom section.
    const separatorHtml = defaultItemsHtml ? pieces.separatorHtml : "";

    if (placement === "below") {
        return `${defaultItemsHtml}${separatorHtml}${pieces.sectionHtml}`;
    }

    // "above" — also the default when placement is undefined.
    return `${pieces.sectionHtml}${separatorHtml}${defaultItemsHtml}`;
}

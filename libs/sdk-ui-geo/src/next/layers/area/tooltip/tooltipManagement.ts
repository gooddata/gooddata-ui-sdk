// (C) 2025-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-model";
import { type IHeaderPredicate } from "@gooddata/sdk-ui";
import { type ICustomTooltipConfig, buildTooltipLocalizedStrings } from "@gooddata/sdk-ui-vis-commons";

import { type IGeoAreaChartConfig } from "../../../types/config/areaChart.js";
import { type IGeoLayerTooltipLookup } from "../../common/customTooltipExecution.js";
import { buildCustomTooltipPieces, composeTooltipBody } from "../../common/customTooltipSection.js";
import type { IPopupFacade } from "../../common/mapFacade.js";
import {
    type TooltipFormatConfig,
    type TooltipPayload,
    dedupeAttributePayloadsByAttrId,
    formatAttributeHtml,
    formatMeasureHtml,
    getTooltipProperties,
    parseTooltipPayload,
} from "../../common/tooltipUtils.js";
import type { IGeoTooltipConfig, ITooltipReferenceMaps } from "../../registry/adapterTypes.js";

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const tooltipFormatConfig: TooltipFormatConfig = {
    emptyValue: "-",
    escape: escapeHtml,
};

function buildAreaTooltipHtml(
    rawProperties: GeoJSON.GeoJsonProperties,
    locationName: TooltipPayload | undefined,
    color: TooltipPayload | undefined,
    segment: TooltipPayload | undefined,
    strokeColor: string,
    separators: ISeparators | undefined,
    customConfig: ICustomTooltipConfig | undefined,
    referenceMaps: ITooltipReferenceMaps | undefined,
    intl: IntlShape,
    tooltipLookup: IGeoLayerTooltipLookup | undefined,
): string | null {
    const attributeItems = dedupeAttributePayloadsByAttrId([locationName, segment])
        .map((payload) => formatAttributeHtml(payload, tooltipFormatConfig))
        .filter((item): item is string => item !== null);
    const measureItem = formatMeasureHtml(color, separators, tooltipFormatConfig);
    const items = [...attributeItems, ...(measureItem ? [measureItem] : [])];
    const defaultItemsHtml = items.join("");

    const customPieces = buildCustomTooltipPieces(
        rawProperties,
        customConfig,
        referenceMaps,
        separators,
        buildTooltipLocalizedStrings(intl),
        tooltipLookup,
    );

    // Suppress the tooltip entirely only when there's nothing to show in
    // either the default or the custom section.
    if (items.length === 0 && !customPieces.sectionHtml) {
        return null;
    }

    const body = composeTooltipBody(defaultItemsHtml, customPieces, customConfig?.placement);

    return `
        <div class="gd-viz-tooltip" style="max-width:320px">
            <span class="gd-viz-tooltip-stroke" style="border-top-color: ${strokeColor}"></span>
            <div class="gd-viz-tooltip-content">${body}</div>
        </div>
    `;
}

/**
 * Creates tooltip configuration for the unified tooltip handler.
 *
 * @param tooltip - Popup facade for displaying tooltips
 * @param config - Chart configuration
 * @param _drillableItems - Drillable items predicates (unused for area)
 * @param intl - Internationalization instance (used for the custom-tooltip
 *   `(No data)` fallback string)
 * @param layerIds - MapLibre layer IDs to monitor
 * @param referenceMaps - Per-layer maps used by the custom-tooltip resolver
 * @returns Tooltip configuration for unified handling
 *
 * @internal
 */
export function createAreaTooltipConfig(
    tooltip: IPopupFacade,
    config: IGeoAreaChartConfig,
    _drillableItems: IHeaderPredicate[] | undefined,
    intl: IntlShape,
    layerIds: string[],
    referenceMaps?: ITooltipReferenceMaps,
    tooltipLookup?: IGeoLayerTooltipLookup,
): IGeoTooltipConfig {
    const { separators } = config;

    return {
        layerIds,

        showTooltip(map, feature, lngLat) {
            const properties = getTooltipProperties(feature.properties);

            // Parse properties (MapLibre may have stringified nested objects)
            const locationName = parseTooltipPayload(properties["locationName"]);
            const segment = parseTooltipPayload(properties["segment"]);
            const color = parseTooltipPayload(properties["color"]);

            // Build tooltip HTML
            const fallbackStroke = properties["color_fill"];
            const tooltipStroke =
                color?.fill ?? (typeof fallbackStroke === "string" ? fallbackStroke : "#20B2E2");
            const tooltipHtml = buildAreaTooltipHtml(
                feature.properties,
                locationName,
                color,
                segment,
                tooltipStroke,
                separators,
                config.customTooltip,
                referenceMaps,
                intl,
                tooltipLookup,
            );

            if (tooltipHtml) {
                tooltip
                    .setLngLat([lngLat.lng, lngLat.lat])
                    .setHTML(tooltipHtml)
                    .setMaxWidth("320px")
                    .addTo(map);
                map.getCanvas().style.cursor = "pointer";
            }
        },

        hideTooltip(map) {
            tooltip.remove();
            map.getCanvas().style.cursor = "";
        },
    };
}

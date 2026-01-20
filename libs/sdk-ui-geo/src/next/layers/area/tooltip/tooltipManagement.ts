// (C) 2025-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-model";
import { type IHeaderPredicate } from "@gooddata/sdk-ui";

import { type IGeoAreaChartConfig } from "../../../types/config/areaChart.js";
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
import type { IGeoTooltipConfig } from "../../registry/adapterTypes.js";

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
    locationName: TooltipPayload | undefined,
    color: TooltipPayload | undefined,
    segment: TooltipPayload | undefined,
    strokeColor: string,
    separators?: ISeparators,
): string | null {
    const attributeItems = dedupeAttributePayloadsByAttrId([locationName, segment])
        .map((payload) => formatAttributeHtml(payload, tooltipFormatConfig))
        .filter((item): item is string => item !== null);
    const measureItem = formatMeasureHtml(color, separators, tooltipFormatConfig);
    const items = [...attributeItems, ...(measureItem ? [measureItem] : [])];

    if (items.length === 0) {
        return null;
    }

    return `
        <div class="gd-viz-tooltip" style="max-width:320px">
            <span class="gd-viz-tooltip-stroke" style="border-top-color: ${strokeColor}"></span>
            <div class="gd-viz-tooltip-content">${items.join("")}</div>
        </div>
    `;
}

/**
 * Creates tooltip configuration for the unified tooltip handler.
 *
 * @param tooltip - Popup facade for displaying tooltips
 * @param config - Chart configuration
 * @param _drillableItems - Drillable items predicates (unused for area)
 * @param _intl - Internationalization instance (unused for area)
 * @param layerIds - MapLibre layer IDs to monitor
 * @returns Tooltip configuration for unified handling
 *
 * @internal
 */
export function createAreaTooltipConfig(
    tooltip: IPopupFacade,
    config: IGeoAreaChartConfig,
    _drillableItems: IHeaderPredicate[] | undefined,
    _intl: IntlShape,
    layerIds: string[],
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
            const tooltipHtml = buildAreaTooltipHtml(locationName, color, segment, tooltipStroke, separators);

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

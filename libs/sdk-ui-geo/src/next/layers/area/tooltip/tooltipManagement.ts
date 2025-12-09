// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";

import { ISeparators } from "@gooddata/sdk-model";
import { IHeaderPredicate } from "@gooddata/sdk-ui";

import { formatValueForTooltip } from "../../../map/style/tooltipFormatting.js";
import { IGeoAreaChartConfig } from "../../../types/config/areaChart.js";
import { JsonValue, isRecord } from "../../../utils/guards.js";
import type { IPopupFacade } from "../../common/mapFacade.js";
import type { IGeoTooltipConfig } from "../../registry/adapterTypes.js";

type TooltipProperty = {
    title?: string;
    value?: string | number;
    fill?: string;
    format?: string;
};

function parseProperty(prop: JsonValue): TooltipProperty | undefined {
    if (!prop) {
        return undefined;
    }

    let value = prop;
    if (typeof prop === "string") {
        try {
            value = JSON.parse(prop);
        } catch {
            return undefined;
        }
    }

    if (!isRecord(value)) {
        return undefined;
    }

    const title = typeof value["title"] === "string" ? value["title"] : undefined;
    const rawValue = value["value"];
    const normalizedValue =
        typeof rawValue === "number" || typeof rawValue === "string" ? rawValue : undefined;
    const fill = typeof value["fill"] === "string" ? value["fill"] : undefined;
    const format = typeof value["format"] === "string" ? value["format"] : undefined;

    return {
        title,
        value: normalizedValue,
        fill,
        format,
    };
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function buildTooltipItemHtml(title: string, value: string): string {
    return `
            <div class="gd-viz-tooltip-item">
                <span class="gd-viz-tooltip-title">${escapeHtml(title)}</span>
                <div class="gd-viz-tooltip-value-wraper">
                    <span class="gd-viz-tooltip-value">${value}</span>
                </div>
            </div>
        `;
}

function addAttributeItem(items: string[], prop?: TooltipProperty): void {
    if (!prop?.title) {
        return;
    }

    const value = prop.value ?? "-";
    items.push(buildTooltipItemHtml(prop.title, escapeHtml(String(value))));
}

function addMeasureItem(items: string[], prop: TooltipProperty | undefined, separators?: ISeparators): void {
    if (!prop?.title) {
        return;
    }

    const hasValue = prop.value !== undefined && prop.value !== null;
    const rawValue = hasValue ? prop.value : "-";
    const normalizedRawValue = typeof rawValue === "number" || typeof rawValue === "string" ? rawValue : "-";
    const formattedValue =
        hasValue && prop.format
            ? formatValueForTooltip(normalizedRawValue, prop.format, separators)
            : escapeHtml(String(normalizedRawValue));

    items.push(buildTooltipItemHtml(prop.title, formattedValue));
}

function buildAreaTooltipHtml(
    locationName: TooltipProperty | undefined,
    color: TooltipProperty | undefined,
    segment: TooltipProperty | undefined,
    tooltipText: TooltipProperty | undefined,
    strokeColor: string,
    separators?: ISeparators,
): string | null {
    const items: string[] = [];

    addAttributeItem(items, locationName);
    addMeasureItem(items, color, separators);
    addAttributeItem(items, segment);
    addAttributeItem(items, tooltipText);

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
            const properties = feature.properties ?? {};

            // Parse properties (MapLibre may have stringified nested objects)
            const locationName = parseProperty(properties["locationName"]);
            const segment = parseProperty(properties["segment"]);
            const color = parseProperty(properties["color"]);
            const tooltipText = parseProperty(properties["tooltipText"]);

            // Build tooltip HTML
            const fallbackStroke = properties["color_fill"];
            const tooltipStroke =
                color?.fill ?? (typeof fallbackStroke === "string" ? fallbackStroke : "#20B2E2");
            const tooltipHtml = buildAreaTooltipHtml(
                locationName,
                color,
                segment,
                tooltipText,
                tooltipStroke,
                separators,
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

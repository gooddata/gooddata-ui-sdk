// (C) 2025 GoodData Corporation

import { escape, isEmpty } from "lodash-es";
import { IntlShape } from "react-intl";

import { ISeparators } from "@gooddata/sdk-model";
import { IHeaderPredicate } from "@gooddata/sdk-ui";

import { formatValueForTooltip, getTooltipContentWidth } from "../../../map/style/tooltipFormatting.js";
import { IGeoTooltipItem } from "../../../types/common/legends.js";
import { IGeoPushpinChartNextConfig } from "../../../types/config/pushpinChart.js";
import { JsonValue, LngLatTuple, isGeoJsonPoint, isLngLatTuple, isRecord } from "../../../utils/guards.js";
import { IPopupFacade } from "../../common/mapFacade.js";
import type { IGeoTooltipConfig } from "../../registry/adapterTypes.js";
import { DEFAULT_PUSHPIN_COLOR_VALUE, NULL_TOOLTIP_VALUE } from "../constants.js";
import { parsePushpinGeoProperties } from "../data/transformation.js";

const TOOLTIP_FULLSCREEN_THRESHOLD = 480;
export const TOOLTIP_MAX_WIDTH = 320;

interface ITooltipPayload {
    title: string;
    value?: string | number;
    format?: string;
}

/**
 * Extended tooltip payload that includes fill color for stroke styling.
 */
interface ITooltipColorPayload extends ITooltipPayload {
    fill?: string;
}

/**
 * Type guard for ITooltipColorPayload.
 */
function isTooltipColorPayload(value: unknown): value is ITooltipColorPayload {
    if (!isRecord(value)) {
        return false;
    }
    const title = value["title"];
    return typeof title === "string" && title.length > 0;
}

function resolveTooltipPayload(item: JsonValue): ITooltipPayload | undefined {
    if (!isRecord(item)) {
        return undefined;
    }

    const title = item["title"];
    if (typeof title !== "string" || title.length === 0) {
        return undefined;
    }

    const rawValue = item["value"];
    const value = typeof rawValue === "string" || typeof rawValue === "number" ? rawValue : undefined;
    const format = typeof item["format"] === "string" ? item["format"] : undefined;

    return {
        title,
        value,
        format,
    };
}

function isTooltipItemValid(item: JsonValue): boolean {
    return Boolean(resolveTooltipPayload(item));
}

function escapeAttributeValue(value: number | string): number | string {
    return Number.isFinite(value) ? value : escape(String(value));
}

function formatMeasure(item: JsonValue, separators?: ISeparators): IGeoTooltipItem | null {
    const payload = resolveTooltipPayload(item);
    if (!payload) {
        return null;
    }

    const { title, value, format } = payload;
    if (typeof value === "number" && Number.isFinite(value)) {
        return {
            title,
            value: formatValueForTooltip(value, format, separators),
        };
    }

    return {
        title,
        value: NULL_TOOLTIP_VALUE,
    };
}

function formatAttribute(item: JsonValue): IGeoTooltipItem | null {
    const payload = resolveTooltipPayload(item);
    if (!payload) {
        return null;
    }

    const { title, value } = payload;
    if (value === undefined) {
        return {
            title,
            value: NULL_TOOLTIP_VALUE,
        };
    }

    return {
        title,
        value: escapeAttributeValue(value),
    };
}

// Tooltips are now switched off in edit/export mode
function isTooltipDisabled({ viewport = {} }: IGeoPushpinChartNextConfig): boolean {
    return Boolean(viewport.frozen);
}

function isTooltipShownInFullScreen() {
    return document.documentElement.clientWidth <= TOOLTIP_FULLSCREEN_THRESHOLD;
}

/**
 * Determine if a tooltip should be shown for the given feature properties
 *
 * @param geoProperties - GeoJSON feature properties
 * @returns True if tooltip should be shown
 *
 * @alpha
 */
export function shouldShowTooltip(geoProperties: GeoJSON.GeoJsonProperties | undefined): boolean {
    if (isEmpty(geoProperties)) {
        return false;
    }

    const { locationName, color, size, segment, tooltipText } = geoProperties ?? {};
    return (
        isTooltipItemValid(locationName) ||
        isTooltipItemValid(size) ||
        isTooltipItemValid(color) ||
        isTooltipItemValid(segment) ||
        isTooltipItemValid(tooltipText)
    );
}

function getInteractionMessage(drillableItems?: IHeaderPredicate[], intl?: IntlShape): string {
    const message = intl ? intl.formatMessage({ id: "visualization.tooltip.interaction" }) : null;

    return drillableItems?.length && intl ? `<div class="gd-viz-tooltip-interaction">${message}</div>` : "";
}

/**
 * Generate HTML content for tooltip
 *
 * @param geoProperties - GeoJSON feature properties
 * @param tooltipStroke - Color for tooltip stroke
 * @param maxWidth - Maximum width of tooltip
 * @param separators - Number format separators
 * @param drillableItems - Drillable items configuration
 * @param intl - Internationalization shape
 * @returns HTML string for tooltip
 *
 * @alpha
 */
export function getTooltipHtml(
    geoProperties: GeoJSON.GeoJsonProperties,
    tooltipStroke: string,
    maxWidth: number,
    separators?: ISeparators,
    drillableItems?: IHeaderPredicate[],
    intl?: IntlShape,
): string {
    const interactionMessage = getInteractionMessage(drillableItems, intl);

    const tooltipItems: string = [
        formatAttribute(geoProperties?.["locationName"]),
        formatMeasure(geoProperties?.["size"], separators),
        formatMeasure(geoProperties?.["color"], separators),
        formatAttribute(geoProperties?.["segment"]),
        formatAttribute(geoProperties?.["tooltipText"]),
    ]
        .filter((item): item is IGeoTooltipItem => item !== null)
        .map(getTooltipItemHtml)
        .join("");

    return `<div class="gd-viz-tooltip" style="max-width:${maxWidth}px">
                <span class="gd-viz-tooltip-stroke" style="border-top-color: ${tooltipStroke}"></span>
                <div class="gd-viz-tooltip-content">${tooltipItems}${interactionMessage}</div>
            </div>`;
}

function getTooltipItemHtml(item: IGeoTooltipItem): string {
    // value is escaped in formatAttribute or formatMeasure function
    const { title, value } = item;

    return `<div class="gd-viz-tooltip-item">
                <span class="gd-viz-tooltip-title">${escape(title)}</span>
                <div class="gd-viz-tooltip-value-wraper">
                    <span class="gd-viz-tooltip-value">${value}</span>
                </div>
            </div>`;
}

function resolveTooltipCoordinatesFromGeometry(
    geometry: GeoJSON.Geometry | null | undefined,
): LngLatTuple | undefined {
    if (geometry && isGeoJsonPoint(geometry)) {
        const coords = geometry.coordinates.slice(0, 2);
        if (isLngLatTuple(coords)) {
            return [coords[0], coords[1]] as [number, number];
        }
    }
    return undefined;
}

/**
 * Creates tooltip configuration for the unified tooltip handler.
 *
 * @param tooltip - Popup facade for displaying tooltips
 * @param config - Chart configuration
 * @param drillableItems - Drillable items predicates
 * @param intl - Internationalization instance
 * @param layerIds - MapLibre layer IDs to monitor
 * @returns Tooltip configuration for unified handling
 *
 * @internal
 */
export function createPushpinTooltipConfig(
    tooltip: IPopupFacade,
    config: IGeoPushpinChartNextConfig,
    drillableItems: IHeaderPredicate[] | undefined,
    intl: IntlShape,
    layerIds: string[],
): IGeoTooltipConfig {
    const { separators } = config;

    return {
        layerIds,

        showTooltip(map, feature, lngLat) {
            if (isTooltipDisabled(config)) {
                return;
            }

            const { properties, geometry } = feature;
            const parsedProps = parsePushpinGeoProperties(properties);

            if (!shouldShowTooltip(parsedProps)) {
                return;
            }

            const canvas = map.getCanvas();
            canvas.style.cursor = "pointer";

            // Use geometry coordinates for points, fallback to event lngLat
            const coordinates =
                resolveTooltipCoordinatesFromGeometry(geometry) ?? ([lngLat.lng, lngLat.lat] as LngLatTuple);

            const colorProps = parsedProps?.["color"];
            const tooltipStroke =
                isTooltipColorPayload(colorProps) && colorProps.fill
                    ? colorProps.fill
                    : DEFAULT_PUSHPIN_COLOR_VALUE;
            const isFullScreenTooltip = isTooltipShownInFullScreen();
            const chartWidth: number = canvas.clientWidth;
            const maxTooltipContentWidth: number = getTooltipContentWidth(
                isFullScreenTooltip,
                chartWidth,
                TOOLTIP_MAX_WIDTH,
            );
            const tooltipHtml = getTooltipHtml(
                parsedProps,
                tooltipStroke,
                maxTooltipContentWidth,
                separators,
                drillableItems,
                intl,
            );

            tooltip
                .setLngLat(coordinates)
                .setHTML(tooltipHtml)
                .setMaxWidth(`${maxTooltipContentWidth}px`)
                .addTo(map);
        },

        hideTooltip(map) {
            if (isTooltipDisabled(config)) {
                return;
            }
            const canvas = map.getCanvas();
            canvas.style.cursor = "";
            tooltip.remove();
        },
    };
}

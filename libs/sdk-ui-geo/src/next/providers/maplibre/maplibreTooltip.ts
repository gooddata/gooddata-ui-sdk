// (C) 2025 GoodData Corporation

import { escape, isEmpty } from "lodash-es";
import type { Map as MapLibreMap, MapMouseEvent, Popup } from "maplibre-gl";
import { IntlShape } from "react-intl";

import { ISeparators } from "@gooddata/sdk-model";
import { IHeaderPredicate } from "@gooddata/sdk-ui";

import { DEFAULT_PUSHPIN_COLOR_VALUE, NULL_TOOLTIP_VALUE } from "../../constants/geoChart.js";
import { parseGeoProperties } from "../../features/data/transformation.js";
import { formatValueForTooltip, getTooltipContentWidth } from "../../features/tooltip/formatting.js";
import { IGeoPushpinChartNextConfig } from "../../types/config.js";
import { IGeoTooltipItem } from "../../types/shared.js";

const TOOLTIP_FULLSCREEN_THRESHOLD = 480;
export const TOOLTIP_MAX_WIDTH = 320;

function isTooltipItemValid(item: IGeoTooltipItem): boolean {
    if (!item) {
        return false;
    }
    const { title } = item;
    return Boolean(title);
}

function escapeAttributeValue(value: number | string): number | string {
    return Number.isFinite(value) ? value : escape(String(value));
}

function formatMeasure(item: IGeoTooltipItem, separators?: ISeparators): IGeoTooltipItem {
    const { title, value, format } = item;
    return {
        title,
        value: Number.isFinite(value) ? formatValueForTooltip(value, format, separators) : NULL_TOOLTIP_VALUE,
    };
}

function formatAttribute(item: IGeoTooltipItem): IGeoTooltipItem {
    const { value } = item;
    return {
        ...item,
        value: value ? escapeAttributeValue(value) : NULL_TOOLTIP_VALUE,
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

    const { locationName, color, size, segment } = geoProperties!;
    return (
        isTooltipItemValid(locationName) ||
        isTooltipItemValid(size) ||
        isTooltipItemValid(color) ||
        isTooltipItemValid(segment)
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
    const { locationName = {}, size = {}, color = {}, segment = {} } = geoProperties || {};
    const interactionMessage = getInteractionMessage(drillableItems, intl);

    const tooltipItems: string = [
        formatAttribute(locationName),
        formatMeasure(size, separators),
        formatMeasure(color, separators),
        formatAttribute(segment),
    ]
        .map(getTooltipItemHtml)
        .join("");

    return `<div class="gd-viz-tooltip" style="max-width:${maxWidth}px">
                <span class="gd-viz-tooltip-stroke" style="border-top-color: ${tooltipStroke}"></span>
                <div class="gd-viz-tooltip-content">${tooltipItems}${interactionMessage}</div>
            </div>`;
}

function getTooltipItemHtml(item: IGeoTooltipItem): string {
    if (!isTooltipItemValid(item)) {
        return "";
    }

    // value is escaped in formatAttribute or formatMeasure function
    const { title, value } = item;

    return `<div class="gd-viz-tooltip-item">
                <span class="gd-viz-tooltip-title">${escape(title)}</span>
                <div class="gd-viz-tooltip-value-wraper">
                    <span class="gd-viz-tooltip-value">${value}</span>
                </div>
            </div>`;
}

/**
 * Handle pushpin mouse enter event to show tooltip
 *
 * @param e - MapLibre mouse event
 * @param map - MapLibre Map instance
 * @param tooltip - MapLibre Popup instance
 * @param config - Geo chart configuration
 * @param drillableItems - Drillable items configuration
 * @param intl - Internationalization shape
 *
 * @alpha
 */
export const handlePushpinMouseEnter = (
    e: MapMouseEvent,
    map: MapLibreMap,
    tooltip: Popup,
    config: IGeoPushpinChartNextConfig,
    drillableItems?: IHeaderPredicate[],
    intl?: IntlShape,
): void => {
    if (isTooltipDisabled(config)) {
        return;
    }

    const { separators } = config;
    const features = map.queryRenderedFeatures(e.point);

    if (!features || features.length === 0) {
        return;
    }

    const [feature] = features;
    const { properties } = feature;
    const parsedProps = parseGeoProperties(properties);

    if (!shouldShowTooltip(parsedProps)) {
        return;
    }

    const canvas = map.getCanvas();
    canvas.style.cursor = "pointer";

    const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
    const tooltipStroke = parsedProps?.["color"]?.background ?? DEFAULT_PUSHPIN_COLOR_VALUE;
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

    tooltip.setLngLat(coordinates).setHTML(tooltipHtml).setMaxWidth(`${maxTooltipContentWidth}px`).addTo(map);
};

/**
 * Handle pushpin mouse leave event to hide tooltip
 *
 * @param _e - MapLibre mouse event (unused)
 * @param map - MapLibre Map instance
 * @param tooltip - MapLibre Popup instance
 * @param config - Geo chart configuration
 *
 * @alpha
 */
export const handlePushpinMouseLeave = (
    _e: MapMouseEvent,
    map: MapLibreMap,
    tooltip: Popup,
    config: IGeoPushpinChartNextConfig,
): void => {
    if (isTooltipDisabled(config)) {
        return;
    }
    const canvas = map.getCanvas();
    canvas.style.cursor = "";
    tooltip.remove();
};

// (C) 2025-2026 GoodData Corporation

import { escape, isEmpty } from "lodash-es";
import { type IntlShape } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-model";
import { type IHeaderPredicate } from "@gooddata/sdk-ui";

import { getTooltipContentWidth } from "../../../map/style/tooltipFormatting.js";
import { type IGeoPushpinChartConfig } from "../../../types/config/pushpinChart.js";
import { type JsonValue, type LngLatTuple, isGeoJsonPoint, isLngLatTuple } from "../../../utils/guards.js";
import { type IPopupFacade } from "../../common/mapFacade.js";
import {
    type TooltipFormatConfig,
    type TooltipPayload,
    dedupeAttributePayloadsByAttrId,
    formatAttributeHtml,
    formatMeasureHtml,
    getTooltipProperties,
    isTooltipPayloadValid,
    parseTooltipPayload,
} from "../../common/tooltipUtils.js";
import type { IGeoTooltipConfig } from "../../registry/adapterTypes.js";
import { DEFAULT_PUSHPIN_COLOR_VALUE, NULL_TOOLTIP_VALUE } from "../constants.js";
import { parsePushpinGeoProperties } from "../data/transformation.js";

const TOOLTIP_FULLSCREEN_THRESHOLD = 480;
export const TOOLTIP_MAX_WIDTH = 320;

/**
 * Extended tooltip payload that includes fill color for stroke styling.
 */
interface ITooltipColorPayload extends TooltipPayload {
    fill?: string;
}

/**
 * Type guard for ITooltipColorPayload.
 */
function isTooltipColorPayload(value: unknown): value is ITooltipColorPayload {
    if (value === null || typeof value !== "object") {
        return false;
    }
    const title = (value as Record<string, unknown>)["title"];
    return typeof title === "string" && title.length > 0;
}

function isTooltipItemValid(item: JsonValue): boolean {
    return isTooltipPayloadValid(item);
}

const tooltipFormatConfig: TooltipFormatConfig = {
    emptyValue: NULL_TOOLTIP_VALUE,
    escape,
};

// Tooltips are now switched off in edit/export mode
function isTooltipDisabled({ viewport = {} }: IGeoPushpinChartConfig): boolean {
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
 * @internal
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
 * @internal
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
    const properties = getTooltipProperties(geoProperties);
    const locationPayload = parseTooltipPayload(properties["locationName"]);
    const sizePayload = parseTooltipPayload(properties["size"]);
    const colorPayload = parseTooltipPayload(properties["color"]);
    const segmentPayload = parseTooltipPayload(properties["segment"]);
    const tooltipTextPayload = parseTooltipPayload(properties["tooltipText"]);
    const [locationAttribute, segmentAttribute, tooltipTextAttribute] = dedupeAttributePayloadsByAttrId([
        locationPayload,
        segmentPayload,
        tooltipTextPayload,
    ]);

    const tooltipItems: string = [
        formatAttributeHtml(locationAttribute, tooltipFormatConfig),
        formatMeasureHtml(sizePayload, separators, tooltipFormatConfig),
        formatMeasureHtml(colorPayload, separators, tooltipFormatConfig),
        formatAttributeHtml(segmentAttribute, tooltipFormatConfig),
        formatAttributeHtml(tooltipTextAttribute, tooltipFormatConfig),
    ]
        .filter((item): item is string => item !== null)
        .join("");

    return `<div class="gd-viz-tooltip" style="max-width:${maxWidth}px">
                <span class="gd-viz-tooltip-stroke" style="border-top-color: ${tooltipStroke}"></span>
                <div class="gd-viz-tooltip-content">${tooltipItems}${interactionMessage}</div>
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
    config: IGeoPushpinChartConfig,
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

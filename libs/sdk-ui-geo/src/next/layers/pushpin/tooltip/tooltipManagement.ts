// (C) 2025-2026 GoodData Corporation

import { escape, isEmpty } from "lodash-es";
import { type IntlShape } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-model";
import { type IHeaderPredicate } from "@gooddata/sdk-ui";
import { type ICustomTooltipConfig } from "@gooddata/sdk-ui-vis-commons";

import { getTooltipContentWidth } from "../../../map/style/tooltipFormatting.js";
import { type IGeoPushpinChartConfig } from "../../../types/config/pushpinChart.js";
import {
    type JsonValue,
    type LngLatTuple,
    isGeoJsonPoint,
    isLngLatTuple,
    isRecord,
} from "../../../utils/guards.js";
import { type IGeoLayerTooltipLookup } from "../../common/customTooltipExecution.js";
import { buildCustomTooltipPieces, composeTooltipBody } from "../../common/customTooltipSection.js";
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
import type { IGeoTooltipConfig, ITooltipReferenceMaps } from "../../registry/adapterTypes.js";
import {
    DEFAULT_PUSHPIN_COLOR_VALUE,
    NULL_TOOLTIP_VALUE,
    PUSHPIN_STYLE_FEATURE_PROPERTIES,
} from "../constants.js";
import { parsePushpinGeoProperties } from "../data/transformation.js";

const TOOLTIP_FULLSCREEN_THRESHOLD = 480;
export const TOOLTIP_MAX_WIDTH = 320;

/**
 * Extended tooltip payload that includes fill color for stroke styling.
 */
interface ITooltipColorPayload extends TooltipPayload {
    fill?: string;
    background?: string;
    border?: string;
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

function resolveStrokeFromFeatureProperties(
    geoProperties: GeoJSON.GeoJsonProperties | undefined,
): string | undefined {
    if (!isRecord(geoProperties)) {
        return undefined;
    }

    const background = geoProperties[PUSHPIN_STYLE_FEATURE_PROPERTIES.colorBackground];
    if (typeof background === "string") {
        return background;
    }

    const border = geoProperties[PUSHPIN_STYLE_FEATURE_PROPERTIES.colorBorder];
    return typeof border === "string" ? border : undefined;
}

function resolveTooltipStroke(
    colorPayload: ITooltipColorPayload | undefined,
    geoProperties: GeoJSON.GeoJsonProperties | undefined,
): string {
    const nestedStroke = colorPayload?.fill ?? colorPayload?.background ?? colorPayload?.border;
    if (nestedStroke) {
        return nestedStroke;
    }

    // Keep compatibility with flattened source properties used by pushpin styling.
    const flatStroke = resolveStrokeFromFeatureProperties(geoProperties);

    return flatStroke ?? DEFAULT_PUSHPIN_COLOR_VALUE;
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

    const { locationName, color, size, segment, tooltipText, measures } = geoProperties ?? {};
    const hasMeasures = Array.isArray(measures) && measures.some(isTooltipItemValid);
    return (
        isTooltipItemValid(locationName) ||
        isTooltipItemValid(size) ||
        isTooltipItemValid(color) ||
        isTooltipItemValid(segment) ||
        isTooltipItemValid(tooltipText) ||
        hasMeasures
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
 * @param intl - Internationalization shape (used for the custom-tooltip
 *   `(No data)` fallback string)
 * @param showStroke - Whether to render the stroke band above the body
 *   (defaults to `true`; pass `false` for icon-shape pushpins)
 * @param customConfig - Optional custom-tooltip config (markdown content +
 *   placement). When omitted or disabled, the tooltip renders the default
 *   items only.
 * @param referenceMaps - Optional per-layer maps used by the custom-tooltip
 *   resolver to translate `localIdentifier` / `attrId` into the LDM ids
 *   referenced as `{metric/<id>}` and `{label/<id>}`.
 * @returns HTML string for tooltip
 *
 * @internal
 */
export function getTooltipHtml(
    geoProperties: GeoJSON.GeoJsonProperties,
    tooltipStroke: string,
    maxWidth: number,
    separators: ISeparators | undefined,
    drillableItems: IHeaderPredicate[] | undefined,
    intl: IntlShape,
    showStroke: boolean = true,
    customConfig?: ICustomTooltipConfig,
    referenceMaps?: ITooltipReferenceMaps,
    tooltipLookup?: IGeoLayerTooltipLookup,
): string {
    const interactionMessage = getInteractionMessage(drillableItems, intl);
    const properties = getTooltipProperties(geoProperties);
    const locationPayload = parseTooltipPayload(properties["locationName"]);
    const sizePayload = parseTooltipPayload(properties["size"]);
    const colorPayload = parseTooltipPayload(properties["color"]);
    const rawMeasures = properties["measures"];
    const measuresPayloads = Array.isArray(rawMeasures) ? rawMeasures.map(parseTooltipPayload) : [];
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
        ...measuresPayloads.map((p) => formatMeasureHtml(p, separators, tooltipFormatConfig)),
        formatAttributeHtml(segmentAttribute, tooltipFormatConfig),
        formatAttributeHtml(tooltipTextAttribute, tooltipFormatConfig),
    ]
        .filter((item): item is string => item !== null)
        .join("");

    const fallbackText = `(${intl.formatMessage({ id: "richText.no_fetch" })})`;
    const noDataLabel = `(${intl.formatMessage({ id: "richText.no_data" })})`;
    const customPieces = buildCustomTooltipPieces(
        geoProperties,
        customConfig,
        referenceMaps,
        separators,
        fallbackText,
        noDataLabel,
        tooltipLookup,
    );
    const itemsBody = composeTooltipBody(tooltipItems, customPieces, customConfig?.placement);

    const strokeHtml = showStroke
        ? `<span class="gd-viz-tooltip-stroke" style="border-top-color: ${tooltipStroke}"></span>`
        : "";

    return `<div class="gd-viz-tooltip" style="max-width:${maxWidth}px">
                ${strokeHtml}
                <div class="gd-viz-tooltip-content">${itemsBody}${interactionMessage}</div>
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
    referenceMaps?: ITooltipReferenceMaps,
    tooltipLookup?: IGeoLayerTooltipLookup,
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

            // Render even when no default payload items are valid if the user
            // configured a non-empty custom tooltip — otherwise `replace`-mode
            // and data-sparse scenarios would silently suppress the tooltip
            // (mirrors area's `items.length === 0 && !customPieces.sectionHtml`).
            const hasCustomTooltipContent = Boolean(
                config.customTooltip?.enabled && config.customTooltip?.content,
            );
            if (!shouldShowTooltip(parsedProps) && !hasCustomTooltipContent) {
                return;
            }

            const canvas = map.getCanvas();
            canvas.style.cursor = "pointer";

            // Use geometry coordinates for points, fallback to event lngLat
            const coordinates =
                resolveTooltipCoordinatesFromGeometry(geometry) ?? ([lngLat.lng, lngLat.lat] as LngLatTuple);

            const colorProps = parsedProps?.["color"];
            const tooltipStroke = resolveTooltipStroke(
                isTooltipColorPayload(colorProps) ? colorProps : undefined,
                properties,
            );
            const isFullScreenTooltip = isTooltipShownInFullScreen();
            const chartWidth: number = canvas.clientWidth;
            const maxTooltipContentWidth: number = getTooltipContentWidth(
                isFullScreenTooltip,
                chartWidth,
                TOOLTIP_MAX_WIDTH,
            );
            const shapeType = config.points?.shapeType ?? "circle";
            const isIconShape = shapeType === "iconByValue" || shapeType === "oneIcon";
            const tooltipHtml = getTooltipHtml(
                parsedProps,
                tooltipStroke,
                maxTooltipContentWidth,
                separators,
                drillableItems,
                intl,
                !isIconShape,
                config.customTooltip,
                referenceMaps,
                tooltipLookup,
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

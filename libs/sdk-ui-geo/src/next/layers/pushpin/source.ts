// (C) 2025-2026 GoodData Corporation

import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { type IGeoLngLat } from "../../types/common/coordinates.js";
import { type IGeoChartPointsConfig } from "../../types/config/points.js";
import { type IGeoPushpinChartConfig } from "../../types/config/pushpinChart.js";
import { type IPushpinColor, type IPushpinGeoData } from "../../types/geoData/pushpin.js";
import { SELECTED_FEATURE_PROPERTY } from "../common/constants.js";
import type { GeoJSONSourceSpecification } from "../common/mapFacade.js";
import { getSelectedIntersections, isFeatureSelected } from "../common/selectionUtils.js";

import { getPushpinColors } from "./coloring/palette.js";
import {
    DEFAULT_CLUSTER_MAX_ZOOM,
    DEFAULT_CLUSTER_RADIUS,
    EMPTY_SEGMENT_VALUE,
    PUSHPIN_SIZE_OPTIONS_MAP,
    PUSHPIN_STYLE_FEATURE_PROPERTIES,
} from "./constants.js";
import { getMinMax } from "./size/calculations.js";

/**
 * Properties for creating a pushpin data source
 *
 * @internal
 */
export interface IPushpinDataSourceProps {
    colorStrategy: IColorStrategy;
    config: IGeoPushpinChartConfig;
    geoData: IPushpinGeoData;
    hasClustering: boolean;
    tooltipAttrIds?: {
        locationName?: string;
        segment?: string;
    };
}

type IPushpinDataSourceFeature = GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties>;
export type IPushpinDataSourceFeatures = IPushpinDataSourceFeature[];

/**
 * Context for building pushpin feature properties
 */
interface IPushpinFeatureContext {
    locationNameTitle: string;
    locationNameUris: string[];
    colorTitle: string;
    sizeTitle: string;
    segmentTitle: string;
    sizeFormat: string;
    colorFormat: string;
    sizeLocalId?: string;
    colorLocalId?: string;
    locationNameData: string[];
    segmentData: string[];
    segmentUris: string[];
    sizeData: number[];
    colorData: number[];
    measures: Array<{ title: string; format: string; data: number[]; localId?: string }>;
    geoIconData: string[];
    pushpinColors: IPushpinColor[];
    geoPointsConfig: IGeoChartPointsConfig;
    minSizeFromData: number | undefined;
    maxSizeFromData: number | undefined;
    hasSize: boolean;
    locationNameAttrId?: string;
    segmentAttrId?: string;
}

const DEFAULT_LOCATION_TITLE = "Location";

function formatCoordinate(value: number): string {
    if (!Number.isFinite(value)) {
        return "-";
    }
    return value.toFixed(6);
}

function buildFallbackLocationLabels(locations: IGeoLngLat[]): string[] {
    return locations.map((coords) => {
        if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
            return "-";
        }
        return `${formatCoordinate(coords.lat)}, ${formatCoordinate(coords.lng)}`;
    });
}

/**
 * Builds GeoJSON properties for a single pushpin feature
 */
function buildPushpinFeatureProperties(
    ctx: IPushpinFeatureContext,
    index: number,
): GeoJSON.GeoJsonProperties {
    const {
        locationNameTitle,
        locationNameUris,
        colorTitle,
        sizeTitle,
        segmentTitle,
        sizeFormat,
        colorFormat,
        sizeLocalId,
        colorLocalId,
        locationNameData,
        segmentData,
        segmentUris,
        sizeData,
        colorData,
        geoIconData,
        pushpinColors,
        geoPointsConfig,
        minSizeFromData,
        maxSizeFromData,
        hasSize,
        locationNameAttrId,
        segmentAttrId,
    } = ctx;

    const canCalculateSize = hasSize && minSizeFromData !== undefined && maxSizeFromData !== undefined;
    const pushpinSize = canCalculateSize
        ? calculateSizeInPixel(sizeData[index], minSizeFromData, maxSizeFromData, geoPointsConfig)
        : PUSHPIN_SIZE_OPTIONS_MAP.min.default;

    const pushpinColor = pushpinColors[index] || pushpinColors[0] || {};

    const properties: GeoJSON.GeoJsonProperties = {
        [PUSHPIN_STYLE_FEATURE_PROPERTIES.size]: pushpinSize,
        [PUSHPIN_STYLE_FEATURE_PROPERTIES.colorBackground]: pushpinColor.background,
        [PUSHPIN_STYLE_FEATURE_PROPERTIES.colorBorder]: pushpinColor.border,
        locationName: {
            title: locationNameTitle,
            value: locationNameData[index],
            attrId: locationNameAttrId,
            uri: locationNameUris[index],
        },
        locationIndex: index,
        color: {
            ...pushpinColor,
            title: colorTitle,
            value: colorData[index],
            format: colorFormat,
            localId: colorLocalId,
        },
        size: {
            title: sizeTitle,
            value: sizeData[index],
            format: sizeFormat,
            localId: sizeLocalId,
        },
        segment: {
            title: segmentTitle,
            value: segmentData[index],
            uri: segmentUris[index] ?? EMPTY_SEGMENT_VALUE,
            attrId: segmentAttrId,
        },
    };

    if (ctx.measures.length > 0) {
        const measuresArr = ctx.measures.map((m) => ({
            title: m.title,
            value: m.data[index],
            format: m.format,
            localId: m.localId,
        }));
        // Keep backward-compatible "metric" property for single measure,
        // and always provide "measures" array for multi-measure support.
        properties["metric"] = measuresArr[0];
        properties["measures"] = measuresArr;
    }
    if (geoIconData.length > 0) {
        properties[PUSHPIN_STYLE_FEATURE_PROPERTIES.iconName] = geoIconData[index];
    }

    return properties;
}

function createPushpinFeatures({
    config,
    geoData,
    colorStrategy,
    tooltipAttrIds,
}: IPushpinDataSourceProps): IPushpinDataSourceFeatures {
    const { color, location, segment, size, tooltipText, measures, geoIcon } = geoData;

    if (!location) {
        return [];
    }

    const { points: geoPointsConfig = {} } = config || {};
    const sizeData = size?.data ?? [];
    const colorData = color?.data ?? [];
    const measuresCtx = (measures ?? []).map((m) => ({
        title: m.name,
        format: m.format,
        data: m.data,
        localId: m.localIdentifier,
    }));
    const geoIconData = geoIcon?.data ?? [];
    const { min: minSizeFromData, max: maxSizeFromData } = getMinMax(sizeData);
    const fallbackLocationNameData = buildFallbackLocationLabels(location.data);
    const locationNameData = tooltipText?.data?.length ? tooltipText.data : fallbackLocationNameData;
    const locationNameUris = tooltipText?.uris ?? [];
    const selectedIntersections = getSelectedIntersections(config?.selectedPoints);

    const ctx: IPushpinFeatureContext = {
        locationNameTitle: tooltipText?.name ?? DEFAULT_LOCATION_TITLE,
        locationNameUris,
        colorTitle: color?.name ?? "",
        sizeTitle: size?.name ?? "",
        segmentTitle: segment?.name ?? "",
        sizeFormat: size?.format ?? "",
        colorFormat: color?.format ?? "",
        sizeLocalId: size?.localIdentifier,
        colorLocalId: color?.localIdentifier,
        measures: measuresCtx,
        locationNameData,
        segmentData: segment?.data ?? [],
        segmentUris: (segment?.uris ?? []).map((uri) => uri ?? EMPTY_SEGMENT_VALUE),
        sizeData,
        colorData,
        geoIconData,
        pushpinColors: getPushpinColors(colorData, segment?.data ?? [], colorStrategy),
        geoPointsConfig,
        minSizeFromData,
        maxSizeFromData,
        hasSize: size !== undefined,
        locationNameAttrId: tooltipText?.displayFormId ?? tooltipAttrIds?.locationName,
        segmentAttrId: segment?.displayFormId ?? tooltipAttrIds?.segment,
    };

    return location.data.reduce(
        (result: IPushpinDataSourceFeatures, coordinates: IGeoLngLat, index: number) => {
            if (!coordinates || !Number.isFinite(coordinates.lat) || !Number.isFinite(coordinates.lng)) {
                return result;
            }

            const properties = buildPushpinFeatureProperties(ctx, index)!;
            if (selectedIntersections) {
                properties[SELECTED_FEATURE_PROPERTY] = isFeatureSelected(properties, selectedIntersections);
            }

            result.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [coordinates.lng, coordinates.lat],
                },
                properties,
            });

            return result;
        },
        [],
    );
}

// transform data value to pushpin size in pixel
const calculateSizeInPixel = (
    dataValue: number | undefined,
    minSize: number,
    maxSize: number,
    geoPointsConfig: IGeoChartPointsConfig,
): number => {
    if (minSize === maxSize || dataValue === null || dataValue === undefined || !Number.isFinite(dataValue)) {
        return PUSHPIN_SIZE_OPTIONS_MAP.min.default;
    }
    const { minSize: minSizeFromConfig = "default", maxSize: maxSizeFromConfig = "default" } =
        geoPointsConfig || {};
    const minSizeInPixel = PUSHPIN_SIZE_OPTIONS_MAP.min[minSizeFromConfig];
    const maxSizeInPixel = PUSHPIN_SIZE_OPTIONS_MAP.max[maxSizeFromConfig];

    return ((dataValue - minSize) * (maxSizeInPixel - minSizeInPixel)) / (maxSize - minSize) + minSizeInPixel;
};

/**
 * Creates a GeoJSON data source for MapLibre from geo data.
 *
 * @remarks
 * Transforms analytical geo data into a complete GeoJSON source specification
 * with all features and styling properties (colors, sizes, etc.) baked in.
 *
 * @param dataSourceProps - Properties containing geo data, config, and styling
 * @returns GeoJSON source specification for MapLibre
 *
 * @internal
 */
export function createPushpinDataSource(
    dataSourceProps: IPushpinDataSourceProps,
): GeoJSONSourceSpecification {
    const { hasClustering } = dataSourceProps;
    const features = createPushpinFeatures(dataSourceProps);

    const source: GeoJSONSourceSpecification = {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features,
        },
    };
    if (hasClustering) {
        return {
            ...source,
            cluster: true,
            clusterMaxZoom: DEFAULT_CLUSTER_MAX_ZOOM,
            clusterRadius: DEFAULT_CLUSTER_RADIUS,
        };
    }
    return source;
}

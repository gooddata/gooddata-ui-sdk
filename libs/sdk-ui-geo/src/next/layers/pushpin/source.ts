// (C) 2025-2026 GoodData Corporation

import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import type { GeoJSONSourceSpecification } from "../common/mapFacade.js";
import { getPushpinColors } from "./coloring/palette.js";
import { DEFAULT_CLUSTER_MAX_ZOOM, DEFAULT_CLUSTER_RADIUS, PUSHPIN_SIZE_OPTIONS_MAP } from "./constants.js";
import { getMinMax } from "./size/calculations.js";
import { type IGeoLngLat } from "../../types/common/coordinates.js";
import { type IGeoPointsConfigNext } from "../../types/config/points.js";
import { type IGeoPushpinChartNextConfig } from "../../types/config/pushpinChart.js";
import { type IPushpinColor, type IPushpinGeoData } from "../../types/geoData/pushpin.js";

/**
 * Properties for creating a pushpin data source
 *
 * @alpha
 */
export interface IPushpinDataSourceProps {
    colorStrategy: IColorStrategy;
    config: IGeoPushpinChartNextConfig;
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
    colorTitle: string;
    sizeTitle: string;
    segmentTitle: string;
    sizeFormat: string;
    colorFormat: string;
    locationNameData: string[];
    segmentData: string[];
    segmentUris: string[];
    sizeData: number[];
    colorData: number[];
    pushpinColors: IPushpinColor[];
    geoPointsConfig: IGeoPointsConfigNext;
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
        colorTitle,
        sizeTitle,
        segmentTitle,
        sizeFormat,
        colorFormat,
        locationNameData,
        segmentData,
        segmentUris,
        sizeData,
        colorData,
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

    return {
        pushpinSize,
        color_background: pushpinColor.background,
        color_border: pushpinColor.border,
        locationName: {
            title: locationNameTitle,
            value: locationNameData[index],
            attrId: locationNameAttrId,
        },
        locationIndex: index,
        color: {
            ...pushpinColor,
            title: colorTitle,
            value: colorData[index],
            format: colorFormat,
        },
        size: {
            title: sizeTitle,
            value: sizeData[index],
            format: sizeFormat,
        },
        segment: {
            title: segmentTitle,
            value: segmentData[index],
            uri: segmentUris[index],
            attrId: segmentAttrId,
        },
    };
}

function createPushpinFeatures({
    config,
    geoData,
    colorStrategy,
    tooltipAttrIds,
}: IPushpinDataSourceProps): IPushpinDataSourceFeatures {
    const { color, location, segment, size, tooltipText } = geoData;

    if (!location) {
        return [];
    }

    const { points: geoPointsConfig = {} } = config || {};
    const sizeData = size?.data ?? [];
    const colorData = color?.data ?? [];
    const { min: minSizeFromData, max: maxSizeFromData } = getMinMax(sizeData);
    const fallbackLocationNameData = buildFallbackLocationLabels(location.data);
    const locationNameData = tooltipText?.data?.length ? tooltipText.data : fallbackLocationNameData;

    const ctx: IPushpinFeatureContext = {
        locationNameTitle: tooltipText?.name ?? DEFAULT_LOCATION_TITLE,
        colorTitle: color?.name ?? "",
        sizeTitle: size?.name ?? "",
        segmentTitle: segment?.name ?? "",
        sizeFormat: size?.format ?? "",
        colorFormat: color?.format ?? "",
        locationNameData,
        segmentData: segment?.data ?? [],
        segmentUris: segment?.uris ?? [],
        sizeData,
        colorData,
        pushpinColors: getPushpinColors(colorData, segment?.data ?? [], colorStrategy),
        geoPointsConfig,
        minSizeFromData,
        maxSizeFromData,
        hasSize: size !== undefined,
        locationNameAttrId: tooltipAttrIds?.locationName,
        segmentAttrId: tooltipAttrIds?.segment,
    };

    return location.data.reduce(
        (result: IPushpinDataSourceFeatures, coordinates: IGeoLngLat, index: number) => {
            if (!coordinates || !Number.isFinite(coordinates.lat) || !Number.isFinite(coordinates.lng)) {
                return result;
            }

            result.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [coordinates.lng, coordinates.lat],
                },
                properties: buildPushpinFeatureProperties(ctx, index),
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
    geoPointsConfig: IGeoPointsConfigNext,
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
 * @alpha
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

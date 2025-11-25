// (C) 2025 GoodData Corporation

import type { GeoJSONSourceSpecification } from "maplibre-gl";

import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import {
    DEFAULT_CLUSTER_MAX_ZOOM,
    DEFAULT_CLUSTER_RADIUS,
    PUSHPIN_SIZE_OPTIONS_MAP,
} from "../../constants/geoChart.js";
import { getPushpinColors } from "../../features/coloring/palette.js";
import { getMinMax } from "../../features/size/calculations.js";
import { IGeoPointsConfigNext, IGeoPushpinChartNextConfig } from "../../types/config.js";
import { IGeoLngLat, IPushpinColor, IPushpinGeoData } from "../../types/shared.js";

/**
 * Properties for creating a geo data source
 *
 * @alpha
 */
export interface IGeoDataSourceProps {
    colorStrategy: IColorStrategy;
    config: IGeoPushpinChartNextConfig;
    geoData: IPushpinGeoData;
    hasClustering: boolean;
}

type IGeoDataSourceFeature = GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties>;
export type IGeoDataSourceFeatures = IGeoDataSourceFeature[];

function transformPushpinDataSource({
    config,
    geoData,
    colorStrategy,
}: IGeoDataSourceProps): IGeoDataSourceFeatures {
    const { color, location, segment, size, tooltipText } = geoData;

    if (!location) {
        /*
         * short-circuit the processing at this point. if there is no location data then the features will
         * be empty
         */
        return [];
    }

    const { points: geoPointsConfig = {} } = config || {};

    const locationNameTitle = tooltipText ? tooltipText.name : "";
    const colorTitle = color ? color.name : "";
    const sizeTitle = size ? size.name : "";
    const segmentTitle = segment ? segment.name : "";

    const hasSize = size !== undefined;

    const locationData = location.data;
    const locationNameData = tooltipText?.data ?? [];
    const segmentData = segment?.data ?? [];
    const segmentUris = segment?.uris ?? [];
    const sizeData = size?.data ?? [];
    const { min: minSizeFromData, max: maxSizeFromData } = getMinMax(sizeData);
    const colorData = color?.data ?? [];

    const sizeFormat = size?.format ?? "";
    const colorFormat = color?.format ?? "";

    const pushpinColors: IPushpinColor[] = getPushpinColors(colorData, segmentData, colorStrategy);

    return locationData.reduce(
        (result: IGeoDataSourceFeatures, coordinates: IGeoLngLat, index: number): IGeoDataSourceFeatures => {
            if (!coordinates || !Number.isFinite(coordinates.lat) || !Number.isFinite(coordinates.lng)) {
                return result;
            }

            const { lat, lng } = coordinates;

            const pushpinSize = hasSize
                ? calculateSizeInPixel(sizeData[index], minSizeFromData!, maxSizeFromData!, geoPointsConfig)
                : PUSHPIN_SIZE_OPTIONS_MAP.min.default;
            const colorValue = colorData[index];

            const segmentValue = segmentData[index];
            const segmentUri = segmentUris[index];

            const pushpinColor = pushpinColors[index] || pushpinColors[0] || {};

            result.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [lng, lat], // MapLibre requires [lng, lat] format
                },
                properties: {
                    pushpinSize,
                    // Flatten color properties for MapLibre expressions
                    color_background: pushpinColor.background,
                    color_border: pushpinColor.border,
                    locationName: {
                        title: locationNameTitle,
                        value: locationNameData[index],
                    },
                    locationIndex: index,
                    color: {
                        ...pushpinColor,
                        title: colorTitle,
                        value: colorValue,
                        format: colorFormat,
                    },
                    size: {
                        title: sizeTitle,
                        value: sizeData[index],
                        format: sizeFormat,
                    },
                    segment: {
                        title: segmentTitle,
                        value: segmentValue,
                        uri: segmentUri,
                    },
                },
            });

            return result;
        },
        [],
    );
}

// transform data value to pushpin size in pixel
const calculateSizeInPixel = (
    dataValue: number,
    minSize: number,
    maxSize: number,
    geoPointsConfig: IGeoPointsConfigNext,
): number => {
    if (minSize === maxSize || dataValue === null) {
        return PUSHPIN_SIZE_OPTIONS_MAP.min.default;
    }
    const { minSize: minSizeFromConfig = "default", maxSize: maxSizeFromConfig = "default" } =
        geoPointsConfig || {};
    const minSizeInPixel = PUSHPIN_SIZE_OPTIONS_MAP.min[minSizeFromConfig];
    const maxSizeInPixel = PUSHPIN_SIZE_OPTIONS_MAP.max[maxSizeFromConfig];

    return ((dataValue - minSize) * (maxSizeInPixel - minSizeInPixel)) / (maxSize - minSize) + minSizeInPixel;
};

/**
 * Creates a GeoJSON data source for MapLibre from geo data
 *
 * @param dataSourceProps - Properties containing geo data, config, and styling
 * @returns GeoJSON source specification for MapLibre
 *
 * @alpha
 */
export const createPushpinDataSource = (dataSourceProps: IGeoDataSourceProps): GeoJSONSourceSpecification => {
    const { hasClustering } = dataSourceProps;
    const features = transformPushpinDataSource(dataSourceProps);

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
};

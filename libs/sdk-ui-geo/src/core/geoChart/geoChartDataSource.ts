// (C) 2019-2022 GoodData Corporation
import { getPushpinColors } from "./geoChartColor.js";
import {
    DEFAULT_CLUSTER_RADIUS,
    DEFAULT_CLUSTER_MAX_ZOOM,
    PUSHPIN_SIZE_OPTIONS_MAP,
} from "./constants/geoChart.js";
import { IGeoConfig, IGeoData, IGeoLngLat, IPushpinColor, IGeoPointsConfig } from "../../GeoChart.js";
import { getMinMax } from "./helpers/geoChart/common.js";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

export interface IGeoDataSourceProps {
    colorStrategy: IColorStrategy;
    config: IGeoConfig;
    geoData: IGeoData;
    hasClustering: boolean;
}

type IGeoDataSourceFeature = GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties>;
export type IGeoDataSourceFeatures = IGeoDataSourceFeature[];

function transformPushpinDataSource(dataSourceProps: IGeoDataSourceProps): IGeoDataSourceFeatures {
    const { config, geoData, colorStrategy } = dataSourceProps;
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
            if (!coordinates) {
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
                    coordinates: [lng, lat], // Mapbox requires number[]
                },
                properties: {
                    pushpinSize,
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
    geoPointsConfig: IGeoPointsConfig,
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

export const createPushpinDataSource = (dataSourceProps: IGeoDataSourceProps): mapboxgl.GeoJSONSourceRaw => {
    const { hasClustering } = dataSourceProps;
    const source: mapboxgl.GeoJSONSourceRaw = {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: transformPushpinDataSource(dataSourceProps),
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

// (C) 2025 GoodData Corporation

import type { GeoJSONSourceSpecification } from "maplibre-gl";

import { IGeoJsonFeature } from "@gooddata/sdk-model";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { getAreaAreaColors } from "../../features/coloring/areaPalette.js";
import { IGeoAreaChartConfig } from "../../types/areaConfig.js";
import { IAreaGeoData } from "../../types/shared.js";

/**
 * Properties for creating a area data source
 *
 * @alpha
 */
export interface IAreaDataSourceProps {
    colorStrategy: IColorStrategy;
    config: IGeoAreaChartConfig;
    geoData: IAreaGeoData;
    features?: IGeoJsonFeature[];
}

type IAreaDataSourceFeature = GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>;
export type IAreaDataSourceFeatures = IAreaDataSourceFeature[];

function toMaplibreProperties(
    base: GeoJSON.GeoJsonProperties | undefined,
    updates: GeoJSON.GeoJsonProperties,
): GeoJSON.GeoJsonProperties {
    return {
        ...(base ?? {}),
        ...updates,
    };
}

function extractString(value: unknown): string | undefined {
    if (typeof value === "string" && value.length > 0) {
        return value;
    }

    if (typeof value === "number") {
        return String(value);
    }

    if (value && typeof value === "object" && "value" in (value as Record<string, unknown>)) {
        const nested = (value as { value?: unknown }).value;
        return extractString(nested);
    }

    return undefined;
}

function collectFeatureKeys(feature: IGeoJsonFeature): string[] {
    const props = (feature.properties ?? {}) as Record<string, unknown>;
    const unique = new Set<string>();

    const addCandidate = (candidate?: string) => {
        if (candidate) {
            unique.add(candidate);
        }
    };

    const prioritizedKeys = [
        "matchingValue",
        "matchingValues",
        "id",
        "areaId",
        "areaCode",
        "areaUri",
        "region",
        "code",
    ];

    for (const key of prioritizedKeys) {
        addCandidate(extractString(props[key]));
    }

    addCandidate(extractString(feature.id));

    for (const value of Object.values(props)) {
        addCandidate(extractString(value));
    }

    return Array.from(unique);
}

function buildFeatureIndex(features: IGeoJsonFeature[] | undefined): Map<string, IGeoJsonFeature> {
    const map = new Map<string, IGeoJsonFeature>();

    if (!features) {
        return map;
    }

    for (const feature of features) {
        for (const key of collectFeatureKeys(feature)) {
            if (!map.has(key)) {
                map.set(key, feature);
            }
        }
    }

    return map;
}

function toMaplibreFeature(feature: IGeoJsonFeature | undefined): IAreaDataSourceFeature | undefined {
    if (!feature) {
        return undefined;
    }

    const geometry = feature.geometry as GeoJSON.Geometry | undefined;
    const properties = feature.properties as GeoJSON.GeoJsonProperties | undefined;

    return {
        type: "Feature",
        geometry: geometry ?? {
            type: "Polygon",
            coordinates: [[]],
        },
        properties: properties ?? {},
    };
}

function createPlaceholderGeometry(): GeoJSON.Geometry {
    return {
        type: "Polygon",
        coordinates: [[]],
    };
}

function buildAreaProperties(args: {
    index: number;
    areaIdentifier: string;
    areaUri: string;
    areaNameTitle: string;
    tooltipValue?: string;
    colorTitle?: string;
    colorValue?: number;
    colorFormat?: string;
    areaColorFill: string;
    segmentTitle?: string;
    segmentValue?: string;
    segmentUri?: string;
}): GeoJSON.GeoJsonProperties {
    const {
        index,
        areaIdentifier,
        areaUri,
        areaNameTitle,
        tooltipValue,
        colorTitle,
        colorValue,
        colorFormat,
        areaColorFill,
        segmentTitle,
        segmentValue,
        segmentUri,
    } = args;
    const properties: GeoJSON.GeoJsonProperties = {
        areaId: areaIdentifier,
        areaUri,
        color_fill: areaColorFill,
        locationName: {
            title: areaNameTitle,
            value: areaIdentifier,
        },
        locationIndex: index,
        color: {
            fill: areaColorFill,
            title: colorTitle ?? "",
            value: colorValue,
            format: colorFormat ?? "",
        },
    };

    if (tooltipValue !== undefined) {
        properties["tooltipText"] = {
            value: tooltipValue,
        };
    }

    if (segmentTitle !== undefined || segmentValue !== undefined || segmentUri !== undefined) {
        properties["segment"] = {
            title: segmentTitle ?? "",
            value: segmentValue,
            uri: segmentUri,
        };
    }

    return properties;
}

/**
 * Transforms area data to GeoJSON features
 *
 * @remarks
 * This function creates GeoJSON features with polygon geometries for area visualization.
 * In a production implementation, this would load actual boundary geometries (from GeoJSON files
 * or a boundaries service) and match them with data values.
 *
 * For this initial implementation, we create placeholder geometries that will be replaced
 * with actual boundary data from a GeoJSON boundaries provider.
 *
 * @param config - Area configuration
 * @param geoData - Area geographic data
 * @param colorStrategy - Color strategy for area styling
 * @returns Array of GeoJSON features
 *
 * @internal
 */
function transformAreaDataSource({
    geoData,
    colorStrategy,
    features,
}: IAreaDataSourceProps): IAreaDataSourceFeatures {
    const { color, area, segment, tooltipText } = geoData;

    if (!area) {
        return [];
    }

    const areaNameTitle = area.name || "";
    const colorTitle = color ? color.name : "";
    const segmentTitle = segment ? segment.name : undefined;

    const areaIdentifiers = area.data;
    const areaUris = area.uris;
    const tooltipTextData = tooltipText?.data ?? [];
    const segmentData = segment?.data ?? [];
    const segmentUris = segment?.uris ?? [];
    const colorData = color?.data ?? [];
    const colorFormat = color?.format ?? "";

    const areaColors = getAreaAreaColors(colorData, segmentData, colorStrategy);
    const featureIndex = buildFeatureIndex(features);

    return areaIdentifiers.reduce(
        (result: IAreaDataSourceFeatures, areaIdentifier: string, index: number): IAreaDataSourceFeatures => {
            if (!areaIdentifier) {
                return result;
            }

            const colorValue = colorData[index];
            const segmentValue = segmentData[index];
            const segmentUri = segmentUris[index];
            const areaColor = areaColors[index] || areaColors[0] || { fill: "#20B2E2" };
            const tooltipValue = tooltipTextData[index];
            const areaUri = areaUris[index];

            const matchingFeature =
                featureIndex.get(areaIdentifier) || (areaUri ? featureIndex.get(areaUri) : undefined);

            const baseFeature = toMaplibreFeature(matchingFeature);
            const geometry = baseFeature?.geometry ?? createPlaceholderGeometry();
            const properties = buildAreaProperties({
                index,
                areaIdentifier,
                areaUri,
                areaNameTitle,
                tooltipValue,
                colorTitle,
                colorValue: typeof colorValue === "number" ? colorValue : undefined,
                colorFormat,
                areaColorFill: areaColor.fill,
                segmentTitle,
                segmentValue,
                segmentUri,
            });

            result.push({
                type: "Feature",
                geometry,
                properties: toMaplibreProperties(baseFeature?.properties, properties),
            });

            return result;
        },
        [],
    );
}

/**
 * Creates a GeoJSON data source for area visualization
 *
 * @remarks
 * Creates a GeoJSON source with polygon features for area-based visualization.
 * In production, this should integrate with a boundaries provider to load
 * actual geographic polygon data.
 *
 * @param dataSourceProps - Properties containing area data, config, and styling
 * @returns GeoJSON source specification for MapLibre
 *
 * @alpha
 */
export const createAreaDataSource = (dataSourceProps: IAreaDataSourceProps): GeoJSONSourceSpecification => {
    const features = transformAreaDataSource(dataSourceProps);

    return {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features,
        },
    };
};

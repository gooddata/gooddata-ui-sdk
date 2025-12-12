// (C) 2025 GoodData Corporation

import { type IGeoJsonFeature, geoFeatureId } from "@gooddata/sdk-model";
import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import type { GeoJSONSourceSpecification } from "../common/mapFacade.js";
import { getAreaAreaColors } from "./coloring/palette.js";
import { type IGeoAreaChartConfig } from "../../types/config/areaChart.js";
import { type IAreaGeoData } from "../../types/geoData/area.js";

/**
 * Properties for creating a area data source
 *
 * @alpha
 */
export interface IAreaDataSourceProps {
    colorStrategy: IColorStrategy;
    config: IGeoAreaChartConfig;
    geoData: IAreaGeoData;
    /**
     * Boundary features to render. These are matched with geoData by area identifier.
     */
    features: IGeoJsonFeature[];
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

function buildFeatureIndex(features: IGeoJsonFeature[] | undefined): Map<string, IGeoJsonFeature> {
    const map = new Map<string, IGeoJsonFeature>();

    if (!features) {
        return map;
    }

    for (const feature of features) {
        const id = geoFeatureId(feature);
        if (id && !map.has(id)) {
            map.set(id, feature);
        }
    }

    return map;
}

function toMaplibreFeature(feature: IGeoJsonFeature | undefined): IAreaDataSourceFeature | undefined {
    if (!feature) {
        return undefined;
    }

    const geometry = feature.geometry ?? createPlaceholderGeometry();
    const properties = feature.properties ?? {};

    return {
        type: "Feature",
        geometry,
        properties,
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
    tooltipTitle?: string;
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
        tooltipTitle,
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
            title: tooltipTitle ?? "",
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

function createAreaFeatures({
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
    const tooltipTextTitle = tooltipText?.name ?? (tooltipTextData.length ? "Tooltip" : undefined);
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
                tooltipTitle: tooltipTextTitle,
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
 * Creates a GeoJSON data source for area visualization.
 *
 * @remarks
 * Transforms area geo data into a complete GeoJSON source specification
 * with polygon features for MapLibre rendering.
 *
 * @param dataSourceProps - Properties containing area data, config, and styling
 * @returns GeoJSON source specification for MapLibre
 *
 * @alpha
 */
export function createAreaDataSource(dataSourceProps: IAreaDataSourceProps): GeoJSONSourceSpecification {
    const features = createAreaFeatures(dataSourceProps);

    return {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features,
        },
    };
}

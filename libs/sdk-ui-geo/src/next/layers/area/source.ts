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

/**
 * Data aggregated for a unique area (deduplicated from data rows).
 */
interface IAggregatedAreaData {
    areaIdentifier: string;
    areaUri: string;
    /** First occurrence index for stable ordering */
    firstIndex: number;
    /** Tooltip value from first row */
    tooltipValue?: string;
    /** Color value from first row (for measure-based coloring) */
    colorValue?: number;
    /** Fill color from first row */
    areaColorFill: string;
    /** All segment URIs associated with this area (for filtering) */
    segmentUris: string[];
    /** Segment value from first row (for display) */
    segmentValue?: string;
    /** Segment title from first row */
    segmentTitle?: string;
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
    /** All segment URIs for this area - used for MapLibre filtering with "in" expression */
    segmentUris?: string[];
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
        segmentUris,
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

    // Store segment info for display (first segment value)
    if (segmentTitle !== undefined || segmentValue !== undefined) {
        properties["segment"] = {
            title: segmentTitle ?? "",
            value: segmentValue,
            // For filtering: store all segment URIs this area belongs to
            // This enables MapLibre "in" expression filtering
            uri: segmentUris?.[0],
            uris: segmentUris,
        };
    }

    return properties;
}

/**
 * Aggregates data rows by unique area URI to prevent geometry duplication.
 *
 * @remarks
 * When segment-by is used, the execution returns area × segment rows.
 * Instead of creating one feature per row (duplicating geometries),
 * we aggregate to one entry per unique area, collecting all segment URIs.
 */
function aggregateByUniqueArea(
    areaIdentifiers: string[],
    areaUris: string[],
    segmentData: string[],
    segmentUris: string[],
    colorData: (number | null)[],
    tooltipTextData: string[],
    areaColors: { fill: string }[],
    segmentTitle: string | undefined,
): Map<string, IAggregatedAreaData> {
    const aggregated = new Map<string, IAggregatedAreaData>();

    for (let i = 0; i < areaIdentifiers.length; i++) {
        const areaIdentifier = areaIdentifiers[i];
        if (!areaIdentifier) {
            continue;
        }

        const areaUri = areaUris[i];
        // Use areaUri as the key for deduplication (unique area identifier)
        const key = areaUri || areaIdentifier;

        const existing = aggregated.get(key);
        if (existing) {
            // Area already seen - add this segment URI to its collection
            const segmentUri = segmentUris[i];
            if (segmentUri && !existing.segmentUris.includes(segmentUri)) {
                existing.segmentUris.push(segmentUri);
            }
        } else {
            // First occurrence of this area - store full data
            const colorValue = colorData[i];
            const segmentUri = segmentUris[i];
            aggregated.set(key, {
                areaIdentifier,
                areaUri,
                firstIndex: i,
                tooltipValue: tooltipTextData[i],
                colorValue: typeof colorValue === "number" ? colorValue : undefined,
                areaColorFill: areaColors[i]?.fill || areaColors[0]?.fill || "#20B2E2",
                segmentUris: segmentUri ? [segmentUri] : [],
                segmentValue: segmentData[i],
                segmentTitle,
            });
        }
    }

    return aggregated;
}

/**
 * Creates GeoJSON features for area visualization.
 *
 * @remarks
 * When segment-by is used, the execution returns area × segment rows (cross-product).
 * To prevent geometry duplication (which causes memory/GPU exhaustion on large datasets),
 * we aggregate rows by unique area and create one feature per unique area.
 * Each feature stores all segment URIs it belongs to, enabling MapLibre filtering.
 */
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

    // Aggregate by unique area to prevent geometry duplication
    const aggregatedAreas = aggregateByUniqueArea(
        areaIdentifiers,
        areaUris,
        segmentData,
        segmentUris,
        colorData,
        tooltipTextData,
        areaColors,
        segmentTitle,
    );

    // Convert aggregated data to GeoJSON features (one per unique area)
    const result: IAreaDataSourceFeatures = [];

    for (const areaData of aggregatedAreas.values()) {
        const { areaIdentifier, areaUri } = areaData;

        const matchingFeature =
            featureIndex.get(areaIdentifier) || (areaUri ? featureIndex.get(areaUri) : undefined);

        const baseFeature = toMaplibreFeature(matchingFeature);
        const geometry = baseFeature?.geometry ?? createPlaceholderGeometry();
        const properties = buildAreaProperties({
            index: areaData.firstIndex,
            areaIdentifier,
            areaUri,
            areaNameTitle,
            tooltipValue: areaData.tooltipValue,
            tooltipTitle: tooltipTextTitle,
            colorTitle,
            colorValue: areaData.colorValue,
            colorFormat,
            areaColorFill: areaData.areaColorFill,
            segmentTitle: areaData.segmentTitle,
            segmentValue: areaData.segmentValue,
            segmentUris: areaData.segmentUris,
        });

        result.push({
            type: "Feature",
            geometry,
            properties: toMaplibreProperties(baseFeature?.properties, properties),
        });
    }

    return result;
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

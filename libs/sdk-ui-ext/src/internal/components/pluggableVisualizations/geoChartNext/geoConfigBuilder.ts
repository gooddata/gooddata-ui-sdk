// (C) 2025-2026 GoodData Corporation

import {
    type IAttribute,
    type IInsightDefinition,
    bucketAttribute,
    idRef,
    insightBucket,
    insightProperties,
    insightVisualizationUrl,
    newAttribute,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { type IGeoChartConfig } from "@gooddata/sdk-ui-geo";
import { type IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { ANALYTICAL_ENVIRONMENT, DASHBOARDS_ENVIRONMENT } from "../../../constants/properties.js";
import { type IVisProps, type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { type IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";
import { sdkModelPropMetas } from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convenience.js";
import { type IInsightToPropConversion } from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convertor.js";
export interface IBuildGeoConfigParams {
    options: IVisProps;
    supportedControls: IVisualizationProperties;
    colorMapping: IColorMapping[] | undefined;
    environment: string;
}

/**
 * Builds geo visualization configuration for both legacy and next-gen geo pushpin charts.
 *
 * @param params - Configuration parameters
 * @returns Complete geo chart configuration
 * @internal
 */
export function buildGeoVisualizationConfig({
    options,
    supportedControls,
    colorMapping,
    environment,
}: IBuildGeoConfigParams): IGeoChartConfig {
    const { config = {}, customVisualizationConfig = {} } = options;
    const { center, legend, viewport = {} } = supportedControls;
    const { isInEditMode, isExportMode } = config;

    // Build center configuration if provided
    const centerProp = center ? { center } : {};

    // Build legend configuration
    let legendProp = legend ? { legend } : {};
    if (environment === DASHBOARDS_ENVIRONMENT) {
        // In dashboards, use responsive legend with popup
        legendProp = {
            legend: {
                ...legend,
                responsive: "autoPositionWithPopup",
            },
        };
    }

    // Build viewport configuration with frozen state during edit/export
    const viewportProp = {
        viewport: {
            ...viewport,
            frozen: isInEditMode || isExportMode,
        },
    };

    // Determine cooperative gestures behavior
    const isKDInViewMode = environment !== ANALYTICAL_ENVIRONMENT && !isInEditMode;
    const cooperativeGestures =
        customVisualizationConfig?.cooperativeGestures === undefined
            ? isKDInViewMode
            : customVisualizationConfig.cooperativeGestures;

    // Merge all configuration
    const geoConfig: IGeoChartConfig = {
        ...supportedControls,
        ...config,
        ...centerProp,
        ...legendProp,
        ...viewportProp,
        ...customVisualizationConfig,
        separators: config.separators,
        colorPalette: config.colorPalette,
        colorMapping,
        cooperativeGestures,
    };

    return geoConfig;
}

const supportedGeoConfigProperties = new Set<keyof IGeoChartConfig>([
    "center",
    "colorMapping",
    "cooperativeGestures",
    "legend",
    "limit",
    "mapStyle",
    "tileset",
    "selectedSegmentItems",
    "separators",
    "viewport",
    "points",
    "showLabels",
    "showLabels",
]);

export function geoConfigFromInsight(
    insight: IInsightDefinition,
    ctx?: IEmbeddingCodeContext,
): IGeoChartConfig {
    const properties = insightProperties(insight);
    const controls = properties?.["controls"] ?? {};
    const withValuesFromContext = {
        ...controls,
        ...(ctx?.settings?.separators ? { separators: ctx?.settings?.separators } : {}),
    };

    return Object.fromEntries(
        Object.entries(withValuesFromContext).filter(
            ([key, value]) =>
                supportedGeoConfigProperties.has(key as any) && !(value === null || value === undefined),
        ),
    ) as unknown as IGeoChartConfig;
}

export function geoInsightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IInsightToPropConversion<TProps, TPropKey, IAttribute | undefined> {
    return {
        propName,
        propType: sdkModelPropMetas.Attribute.Single,
        itemAccessor(insight, ctx) {
            return getLocationAttributeFromInsight(insight, ctx, bucketName);
        },
    };
}

function getLocationAttributeFromInsight(
    insight: IInsightDefinition,
    ctx: IEmbeddingCodeContext | undefined,
    bucketName: string,
): IAttribute | undefined {
    if (bucketName === BucketNames.AREA) {
        const bucket = insightBucket(insight, bucketName);
        return bucket && bucketAttribute(bucket);
    }

    if (
        bucketName === BucketNames.LOCATION &&
        !ctx?.backend?.capabilities.supportsSeparateLatitudeLongitudeLabels
    ) {
        const bucket = insightBucket(insight, bucketName);
        return bucket ? bucketAttribute(bucket) : undefined;
    } else if (
        // dont rely on Latitude being already in bucket, take both lat and long from properties
        (bucketName === BucketNames.LATITUDE || bucketName === BucketNames.LONGITUDE) &&
        ctx?.backend?.capabilities.supportsSeparateLatitudeLongitudeLabels
    ) {
        const properties = insightProperties(insight);
        const controls = properties?.["controls"] ?? {};
        const identifier = controls[bucketName];
        return newAttribute(idRef(identifier, "displayForm"), (a) => a.localId(`a_${identifier}`));
    }

    return undefined;
}

export function isGeoChart(insightDefinition: IInsightDefinition): boolean {
    const type = insightVisualizationUrl(insightDefinition).split(":")[1];

    return type === "pushpin";
}

// (C) 2022-2025 GoodData Corporation

import { filter, flow, fromPairs } from "lodash-es";

import {
    IAttribute,
    IInsightDefinition,
    bucketAttribute,
    idRef,
    insightBucket,
    insightProperties,
    insightVisualizationUrl,
    newAttribute,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IGeoConfig } from "@gooddata/sdk-ui-geo";

import { IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";
import {
    IInsightToPropConversion,
    PropWithMeta,
    sdkModelPropMetas,
} from "../../../utils/embeddingCodeGenerator/index.js";

const supportedGeoConfigProperties = new Set<keyof IGeoConfig>([
    "center",
    "colorMapping",
    "cooperativeGestures",
    "legend",
    "limit",
    "selectedSegmentItems",
    "separators",
    "viewport",
    "points",
    "showLabels",
    "showLabels",
    "tooltipText",
]);

export function geoConfigFromInsight(insight: IInsightDefinition, ctx?: IEmbeddingCodeContext): IGeoConfig {
    const properties = insightProperties(insight);
    const controls = properties?.["controls"] ?? {};
    const withValuesFromContext = {
        ...controls,
        ...(ctx?.settings?.separators ? { separators: ctx?.settings?.separators } : {}),
    };

    const configFromProperties = flow(
        Object.entries,
        (pairs) =>
            filter(
                pairs,
                ([key, value]) =>
                    supportedGeoConfigProperties.has(key as any) && !(value === null || value === undefined),
            ),
        fromPairs,
    )(withValuesFromContext) as IGeoConfig;

    return {
        ...configFromProperties,
        ...mapBoxTokenPlaceholder(),
    };
}

export function geoInsightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IInsightToPropConversion<TProps, TPropKey, IAttribute> {
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
    ctx: IEmbeddingCodeContext,
    bucketName: string,
): IAttribute {
    if (
        bucketName === BucketNames.LOCATION &&
        !ctx.backend?.capabilities.supportsSeparateLatitudeLongitudeLabels
    ) {
        const bucket = insightBucket(insight, bucketName);
        return bucket && bucketAttribute(bucket);
    } else if (
        // dont rely on Latitude being already in bucket, take both lat and long from properties
        (bucketName === BucketNames.LATITUDE || bucketName === BucketNames.LONGITUDE) &&
        ctx.backend?.capabilities.supportsSeparateLatitudeLongitudeLabels
    ) {
        const properties = insightProperties(insight);
        const controls = properties?.["controls"] ?? {};
        const identifier = controls[bucketName];
        return newAttribute(idRef(identifier, "displayForm"), (a) => a.localId(`a_${identifier}`));
    }

    return undefined;
}

export function mapBoxTokenPlaceholder(): IGeoConfig {
    return {
        mapboxToken: "<fill your Mapbox token here>",
    };
}

export function isGeoChart(insightDefinition: IInsightDefinition): boolean {
    const type = insightVisualizationUrl(insightDefinition).split(":")[1];

    return type === "pushpin";
}

export function geoConfigForInsightViewComponent(): PropWithMeta<IGeoConfig> | undefined {
    return {
        value: mapBoxTokenPlaceholder(),
        meta: {
            cardinality: "scalar",
            typeImport: {
                importType: "named",
                name: "IGeoConfig",
                package: "@gooddata/sdk-ui-geo",
            },
        },
    };
}

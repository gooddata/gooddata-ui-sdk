// (C) 2026 GoodData Corporation

import {
    type IAttribute,
    type IAttributeOrMeasure,
    type IBucket,
    type IInsightDefinition,
    type ObjRef,
    areObjRefsEqual,
    attributeDisplayFormRef,
    attributeLocalId,
    bucketAttribute,
    idRef,
    insightBucket,
    insightProperties,
    insightSetBuckets,
    insightSorts,
    insightVisualizationType,
    isUriRef,
    modifyAttribute,
    newAttribute,
    newAttributeSort,
    uriRef,
} from "@gooddata/sdk-model";

import { VisualizationTypes } from "./visualizationTypes.js";
import { BucketNames } from "../constants/bucketNames.js";

const TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID = "tooltipText_df";

/**
 * @internal
 */
export type GeoDefaultDisplayFormRefResolver = (displayFormRef: ObjRef) => ObjRef | undefined;

/**
 * @internal
 */
export type IGeoInsightExportNormalizationOptions = {
    resolveDefaultDisplayFormRef: GeoDefaultDisplayFormRefResolver;
};

function getBucketAttribute(bucket: IBucket | undefined): IAttribute | undefined {
    return bucket ? bucketAttribute(bucket) : undefined;
}

function createBucket(localIdentifier: string, items: IAttributeOrMeasure[]): IBucket | undefined {
    if (!items.length) {
        return undefined;
    }

    return {
        localIdentifier,
        items,
    };
}

function createAttributeFromIdentifier(sourceAttribute: IAttribute, identifier: string): IAttribute {
    const ref = isUriRef(attributeDisplayFormRef(sourceAttribute))
        ? uriRef(identifier)
        : idRef(identifier, "displayForm");

    return newAttribute(ref, (builder) => builder.localId(TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID));
}

function resolvePrimaryAttribute(
    sourceAttribute: IAttribute | undefined,
    resolveDefaultDisplayFormRef: GeoDefaultDisplayFormRefResolver,
): IAttribute | undefined {
    if (!sourceAttribute) {
        return undefined;
    }

    const defaultDisplayFormRef = resolveDefaultDisplayFormRef(attributeDisplayFormRef(sourceAttribute));
    if (!defaultDisplayFormRef) {
        return undefined;
    }

    return modifyAttribute(sourceAttribute, (builder) => builder.displayForm(defaultDisplayFormRef));
}

function resolveConfiguredTooltipAttribute(
    sourceAttribute: IAttribute | undefined,
    insight: IInsightDefinition,
): IAttribute | undefined {
    if (!sourceAttribute) {
        return undefined;
    }

    const tooltipText = insightProperties(insight)?.["controls"]?.["tooltipText"];
    if (typeof tooltipText !== "string" || tooltipText.length === 0) {
        return undefined;
    }

    return createAttributeFromIdentifier(sourceAttribute, tooltipText);
}

function resolveTooltipAttribute(
    insight: IInsightDefinition,
    primaryAttribute: IAttribute | undefined,
    fallbackAttribute: IAttribute | undefined,
): IAttribute | undefined {
    const tooltipBucketAttribute = getBucketAttribute(insightBucket(insight, BucketNames.TOOLTIP_TEXT));
    const configuredTooltipAttribute = resolveConfiguredTooltipAttribute(fallbackAttribute, insight);
    const tooltipAttribute = tooltipBucketAttribute ?? configuredTooltipAttribute;

    if (!tooltipAttribute || !primaryAttribute) {
        return tooltipAttribute;
    }

    return areObjRefsEqual(
        attributeDisplayFormRef(tooltipAttribute),
        attributeDisplayFormRef(primaryAttribute),
    )
        ? undefined
        : tooltipAttribute;
}

function finalizeInsight(
    insight: IInsightDefinition,
    buckets: Array<IBucket | undefined>,
    primaryAttribute: IAttribute,
): IInsightDefinition {
    const normalizedInsight = insightSetBuckets(
        insight,
        buckets.filter((bucket): bucket is IBucket => bucket !== undefined),
    );
    const sorts = insightSorts(normalizedInsight);

    return {
        insight: {
            ...normalizedInsight.insight,
            sorts: sorts.length > 0 ? sorts : [newAttributeSort(attributeLocalId(primaryAttribute))],
        },
    };
}

function normalizeGeoAreaInsightForRawExport(
    insight: IInsightDefinition,
    resolveDefaultDisplayFormRef: GeoDefaultDisplayFormRefResolver,
): IInsightDefinition {
    const areaAttribute = getBucketAttribute(insightBucket(insight, BucketNames.AREA));
    const primaryAttribute = resolvePrimaryAttribute(areaAttribute, resolveDefaultDisplayFormRef);
    if (!primaryAttribute) {
        return insight;
    }

    const tooltipAttribute = resolveTooltipAttribute(insight, primaryAttribute, areaAttribute);
    const segmentItems = insightBucket(insight, BucketNames.SEGMENT)?.items ?? [];
    const colorItems = insightBucket(insight, BucketNames.COLOR)?.items ?? [];

    return finalizeInsight(
        insight,
        [
            createBucket(BucketNames.AREA, [primaryAttribute]),
            createBucket(BucketNames.SEGMENT, segmentItems),
            createBucket(BucketNames.TOOLTIP_TEXT, tooltipAttribute ? [tooltipAttribute] : []),
            createBucket(BucketNames.COLOR, colorItems),
        ],
        primaryAttribute,
    );
}

function normalizeGeoPushpinInsightForRawExport(
    insight: IInsightDefinition,
    resolveDefaultDisplayFormRef: GeoDefaultDisplayFormRefResolver,
): IInsightDefinition {
    const locationAttribute = getBucketAttribute(insightBucket(insight, BucketNames.LOCATION));
    const latitudeAttribute = getBucketAttribute(insightBucket(insight, BucketNames.LATITUDE));
    const fallbackAttribute = locationAttribute ?? latitudeAttribute;
    const primaryAttribute = resolvePrimaryAttribute(fallbackAttribute, resolveDefaultDisplayFormRef);
    if (!primaryAttribute) {
        return insight;
    }

    const tooltipAttribute = resolveTooltipAttribute(insight, primaryAttribute, fallbackAttribute);
    const sizeItems = insightBucket(insight, BucketNames.SIZE)?.items ?? [];
    const colorItems = insightBucket(insight, BucketNames.COLOR)?.items ?? [];
    const segmentItems = insightBucket(insight, BucketNames.SEGMENT)?.items ?? [];

    return finalizeInsight(
        insight,
        [
            createBucket(BucketNames.LOCATION, [primaryAttribute]),
            createBucket(BucketNames.SEGMENT, segmentItems),
            createBucket(BucketNames.TOOLTIP_TEXT, tooltipAttribute ? [tooltipAttribute] : []),
            createBucket(BucketNames.SIZE, sizeItems),
            createBucket(BucketNames.COLOR, colorItems),
        ],
        primaryAttribute,
    );
}

/**
 * @internal
 */
export function normalizeGeoInsightForRawExport(
    insight: IInsightDefinition,
    options: IGeoInsightExportNormalizationOptions,
): IInsightDefinition {
    const visualizationType = insightVisualizationType(insight);

    if (visualizationType === VisualizationTypes.CHOROPLETH) {
        return normalizeGeoAreaInsightForRawExport(insight, options.resolveDefaultDisplayFormRef);
    }

    if (visualizationType === VisualizationTypes.PUSHPIN) {
        return normalizeGeoPushpinInsightForRawExport(insight, options.resolveDefaultDisplayFormRef);
    }

    return insight;
}

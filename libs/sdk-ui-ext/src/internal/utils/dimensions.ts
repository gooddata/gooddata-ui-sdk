// (C) 2007-2020 GoodData Corporation
import {
    attributeLocalId,
    bucketAttribute,
    bucketAttributes,
    bucketIsEmpty,
    IDimension,
    IInsightDefinition,
    insightAttributes,
    insightBucket,
    insightTotals,
    MeasureGroupIdentifier,
} from "@gooddata/sdk-model";
import { BucketNames, VisType, VisualizationTypes } from "@gooddata/sdk-ui";
import { ViewByAttributesLimit } from "@gooddata/sdk-ui-charts";

export function getPivotTableDimensions(insight: IInsightDefinition): IDimension[] {
    const row = insightBucket(insight, BucketNames.ATTRIBUTE);
    const columns = insightBucket(insight, BucketNames.COLUMNS);
    const measures = insightBucket(insight, BucketNames.MEASURES);

    const rowAttributeIds = row ? bucketAttributes(row).map(attributeLocalId) : [];
    const columnAttributeIds = columns ? bucketAttributes(columns).map(attributeLocalId) : [];

    const measuresItemIdentifiers = measures && !bucketIsEmpty(measures) ? [MeasureGroupIdentifier] : [];

    const totals = insightTotals(insight);
    const totalsProp = totals.length ? { totals } : {};

    return [
        {
            itemIdentifiers: rowAttributeIds,
            ...totalsProp,
        },
        {
            itemIdentifiers: [...columnAttributeIds, ...measuresItemIdentifiers],
        },
    ];
}

function getPieOrDonutDimensions(insight: IInsightDefinition): IDimension[] {
    const viewBy = insightBucket(insight, BucketNames.VIEW);

    if (viewBy && !bucketIsEmpty(viewBy)) {
        return [
            {
                itemIdentifiers: [MeasureGroupIdentifier],
            },
            {
                itemIdentifiers: bucketAttributes(viewBy).map(attributeLocalId),
            },
        ];
    }

    return [
        {
            itemIdentifiers: [],
        },
        {
            itemIdentifiers: [MeasureGroupIdentifier],
        },
    ];
}

function getBarDimensions(insight: IInsightDefinition): IDimension[] {
    const viewBy = insightBucket(insight, BucketNames.VIEW);
    const viewByAttributes = viewBy ? bucketAttributes(viewBy) : [];
    const stack = insightBucket(insight, BucketNames.STACK);

    if (!stack || bucketIsEmpty(stack)) {
        return [
            {
                itemIdentifiers: [MeasureGroupIdentifier],
            },
            {
                itemIdentifiers: viewByAttributes.map(attributeLocalId),
            },
        ];
    }

    return [
        {
            itemIdentifiers: bucketAttributes(stack).map(attributeLocalId),
        },
        {
            itemIdentifiers: [...viewByAttributes.map(attributeLocalId), MeasureGroupIdentifier],
        },
    ];
}

function getAreaDimensions(insight: IInsightDefinition): IDimension[] {
    const viewBucket = insightBucket(insight, BucketNames.VIEW);
    const viewByAttributes = viewBucket ? bucketAttributes(viewBucket) : [];
    const stackBucket = insightBucket(insight, BucketNames.STACK);

    if (viewByAttributes.length > 1) {
        // only take first two view items
        const [viewItemIdentifier, stackItemIdentifier] = viewByAttributes
            .slice(0, ViewByAttributesLimit)
            .map(attributeLocalId);
        return [
            {
                itemIdentifiers: [stackItemIdentifier],
            },
            {
                itemIdentifiers: [viewItemIdentifier, MeasureGroupIdentifier],
            },
        ];
    }

    if (!stackBucket || bucketIsEmpty(stackBucket)) {
        return [
            {
                itemIdentifiers: [MeasureGroupIdentifier],
            },
            {
                itemIdentifiers: viewByAttributes.map(attributeLocalId),
            },
        ];
    }

    return [
        {
            itemIdentifiers: bucketAttributes(stackBucket).map(attributeLocalId),
        },
        {
            itemIdentifiers: [...viewByAttributes.map(attributeLocalId), MeasureGroupIdentifier],
        },
    ];
}

function getLineDimensions(insight: IInsightDefinition): IDimension[] {
    const trend = insightBucket(insight, BucketNames.TREND);
    const trendAttributes = trend ? bucketAttributes(trend) : [];
    const segment = insightBucket(insight, BucketNames.SEGMENT);

    if (!segment || bucketIsEmpty(segment)) {
        return [
            {
                itemIdentifiers: [MeasureGroupIdentifier],
            },
            {
                itemIdentifiers: trendAttributes.map(attributeLocalId),
            },
        ];
    }

    return [
        {
            itemIdentifiers: bucketAttributes(segment).map(attributeLocalId),
        },
        {
            itemIdentifiers: [...trendAttributes.map(attributeLocalId), MeasureGroupIdentifier],
        },
    ];
}

export function getHeadlinesDimensions(): IDimension[] {
    return [{ itemIdentifiers: [MeasureGroupIdentifier] }];
}

function getScatterDimensions(insight: IInsightDefinition): IDimension[] {
    const attribute = insightBucket(insight, BucketNames.ATTRIBUTE);

    if (attribute && !bucketIsEmpty(attribute)) {
        return [
            {
                itemIdentifiers: bucketAttributes(attribute).map(attributeLocalId),
            },
            {
                itemIdentifiers: [MeasureGroupIdentifier],
            },
        ];
    }

    return [
        {
            itemIdentifiers: [],
        },
        {
            itemIdentifiers: [MeasureGroupIdentifier],
        },
    ];
}

// Heatmap
function getHeatmapDimensionsFromMdObj(insight: IInsightDefinition): IDimension[] {
    return getHeatmapDimensionsFromBuckets(insight);
}

function getHeatmapDimensionsFromBuckets(insight: IInsightDefinition): IDimension[] {
    const view = insightBucket(insight, BucketNames.VIEW);
    const viewAttributes = view ? bucketAttributes(view) : [];
    const stack = insightBucket(insight, BucketNames.STACK);

    if (!stack || bucketIsEmpty(stack)) {
        return [
            {
                itemIdentifiers: viewAttributes.map(attributeLocalId),
            },
            {
                itemIdentifiers: [MeasureGroupIdentifier],
            },
        ];
    }

    return [
        {
            itemIdentifiers: viewAttributes.map(attributeLocalId),
        },
        {
            itemIdentifiers: [...bucketAttributes(stack).map(attributeLocalId), MeasureGroupIdentifier],
        },
    ];
}

function getBubbleDimensions(insight: IInsightDefinition): IDimension[] {
    const view = insightBucket(insight, BucketNames.VIEW);
    const viewAttributes = view ? bucketAttributes(view) : [];
    const stack = insightBucket(insight, BucketNames.STACK);

    if (!stack || bucketIsEmpty(stack)) {
        return [
            {
                itemIdentifiers: viewAttributes.map(attributeLocalId),
            },
            {
                itemIdentifiers: [MeasureGroupIdentifier],
            },
        ];
    }

    return [
        {
            itemIdentifiers: [
                ...viewAttributes.map(attributeLocalId),
                ...bucketAttributes(stack).map(attributeLocalId),
            ],
        },
        {
            itemIdentifiers: [MeasureGroupIdentifier],
        },
    ];
}

/**
 * generateDimensions
 * is a function that generates dimensions based on buckets and visualization objects.
 * WARNING: It duplicates logic from pluggable visualizations.
 *          Remove once react components support pluggable visualizations.
 * @param insight - insight being visualized
 * @param type - visualization type string
 * @internal
 */
export function generateDimensions(insight: IInsightDefinition, type: VisType): IDimension[] {
    switch (type) {
        case VisualizationTypes.TABLE: {
            return getPivotTableDimensions(insight);
        }
        case VisualizationTypes.PIE:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.FUNNEL: {
            return getPieOrDonutDimensions(insight);
        }
        case VisualizationTypes.TREEMAP: {
            return getTreemapDimensionsFromMdObj(insight);
        }

        case VisualizationTypes.LINE: {
            return getLineDimensions(insight);
        }

        case VisualizationTypes.AREA: {
            return getAreaDimensions(insight);
        }

        case VisualizationTypes.BAR:
        case VisualizationTypes.BULLET:
        case VisualizationTypes.COMBO:
        case VisualizationTypes.COMBO2:
        case VisualizationTypes.COLUMN: {
            return getBarDimensions(insight);
        }
        case VisualizationTypes.HEADLINE: {
            return getHeadlinesDimensions();
        }
        case VisualizationTypes.SCATTER: {
            return getScatterDimensions(insight);
        }
        case VisualizationTypes.HEATMAP: {
            return getHeatmapDimensionsFromMdObj(insight);
        }
        case VisualizationTypes.BUBBLE: {
            return getBubbleDimensions(insight);
        }
    }
    return [];
}

export function generateStackedDimensions(insight: IInsightDefinition): IDimension[] {
    const viewBucket = insightBucket(insight, BucketNames.ATTRIBUTE);
    const viewAttributes = viewBucket ? bucketAttributes(viewBucket) : [];
    const stackAttribute = bucketAttribute(insightBucket(insight, BucketNames.STACK));

    return [
        {
            itemIdentifiers: stackAttribute ? [attributeLocalId(stackAttribute)] : [],
        },
        {
            itemIdentifiers: [...viewAttributes.map(attributeLocalId), MeasureGroupIdentifier],
        },
    ];
}

// Treemap
function getTreemapDimensionsFromMdObj(insight: IInsightDefinition): IDimension[] {
    return getTreemapDimensionsFromBuckets(insight);
}

function getTreemapDimensionsFromBuckets(insight: IInsightDefinition): IDimension[] {
    return getTreemapDimensionsFromAFM(insight);
}

function getTreemapDimensionsFromAFM(insight: IInsightDefinition): IDimension[] {
    const attributes = insightAttributes(insight);

    if (attributes.length === 1) {
        return [
            {
                itemIdentifiers: [MeasureGroupIdentifier],
            },
            {
                itemIdentifiers: attributes.map(attributeLocalId),
            },
        ];
    }

    return [
        {
            itemIdentifiers: attributes.map(attributeLocalId),
        },
        {
            itemIdentifiers: [MeasureGroupIdentifier],
        },
    ];
}

// (C) 2007-2019 GoodData Corporation
import {
    attributeLocalId,
    bucketAttribute,
    bucketAttributes,
    bucketIsEmpty,
    IDimension,
    IInsight,
    insightAttributes,
    insightBucket,
    insightTotals,
    MeasureGroupIdentifier,
} from "@gooddata/sdk-model";
import { VIEW_BY_ATTRIBUTES_LIMIT } from "../constants/limits";
import { ATTRIBUTE, COLUMNS, MEASURES, SEGMENT, STACK, TREND, VIEW } from "../constants/bucketNames";
import { VisType, VisualizationTypes } from "../constants/visualizationTypes";

export function getPivotTableDimensions(insight: IInsight): IDimension[] {
    const row = insightBucket(insight, ATTRIBUTE);
    const columns = insightBucket(insight, COLUMNS);
    const measures = insightBucket(insight, MEASURES);

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

function getPieOrDonutDimensions(insight: IInsight): IDimension[] {
    const viewBy = insightBucket(insight, VIEW);

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

function getBarDimensions(insight: IInsight): IDimension[] {
    const viewBy = insightBucket(insight, VIEW);
    const viewByAttributes = viewBy ? bucketAttributes(viewBy) : [];
    const stack = insightBucket(insight, STACK);

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

function getAreaDimensions(insight: IInsight): IDimension[] {
    const viewBucket = insightBucket(insight, VIEW);
    const viewByAttributes = viewBucket ? bucketAttributes(viewBucket) : [];
    const stackBucket = insightBucket(insight, STACK);

    if (viewByAttributes.length > 1) {
        // only take first two view items
        const [viewItemIdentifier, stackItemIdentifier] = viewByAttributes
            .slice(0, VIEW_BY_ATTRIBUTES_LIMIT)
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

function getLineDimensions(insight: IInsight): IDimension[] {
    const trend = insightBucket(insight, TREND);
    const trendAttributes = trend ? bucketAttributes(trend) : [];
    const segment = insightBucket(insight, SEGMENT);

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

function getScatterDimensions(insight: IInsight): IDimension[] {
    const attribute = insightBucket(insight, ATTRIBUTE);

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
export function getHeatmapDimensionsFromMdObj(insight: IInsight): IDimension[] {
    return getHeatmapDimensionsFromBuckets(insight);
}

export function getHeatmapDimensionsFromBuckets(insight: IInsight): IDimension[] {
    const view = insightBucket(insight, VIEW);
    const viewAttributes = view ? bucketAttributes(view) : [];
    const stack = insightBucket(insight, STACK);

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

function getBubbleDimensions(insight: IInsight): IDimension[] {
    const view = insightBucket(insight, VIEW);
    const stack = insightBucket(insight, STACK);

    if (!stack || bucketIsEmpty(stack)) {
        return [
            {
                itemIdentifiers: bucketAttributes(view).map(attributeLocalId),
            },
            {
                itemIdentifiers: [MeasureGroupIdentifier],
            },
        ];
    }

    return [
        {
            itemIdentifiers: [
                ...bucketAttributes(view).map(attributeLocalId),
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
 * @param type:VisType - visualization type string
 * @internal
 */
export function generateDimensions(insight: IInsight, type: VisType): IDimension[] {
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

export function generateStackedDimensions(insight: IInsight): IDimension[] {
    const viewBucket = insightBucket(insight, ATTRIBUTE);
    const viewAttributes = viewBucket ? bucketAttributes(viewBucket) : [];
    const stackAttribute = bucketAttribute(insightBucket(insight, STACK));

    return [
        {
            itemIdentifiers: stackAttribute ? [attributeLocalId(stackAttribute)] : [],
        },
        {
            itemIdentifiers: [...viewAttributes.map(attributeLocalId), MeasureGroupIdentifier],
        },
    ];
}

// for LineChart, AreaChart, BarChart, ColumnChart
export function generateDefaultDimensions(insight: IInsight): IDimension[] {
    return [
        {
            itemIdentifiers: [MeasureGroupIdentifier],
        },
        {
            itemIdentifiers: insightAttributes(insight).map(attributeLocalId),
        },
    ];
}

// for ScatterPlot and BubbleChart
export function generateDefaultDimensionsForPointsCharts(insight: IInsight): IDimension[] {
    return [
        {
            itemIdentifiers: insightAttributes(insight).map(attributeLocalId),
        },
        {
            itemIdentifiers: [MeasureGroupIdentifier],
        },
    ];
}

// for PieChart, DonutChart
export const generateDefaultDimensionsForRoundChart = (insight: IInsight): IDimension[] => {
    const attributes = insightAttributes(insight);

    if (attributes.length === 0) {
        return [
            {
                itemIdentifiers: [],
            },
            {
                itemIdentifiers: [MeasureGroupIdentifier],
            },
        ];
    }

    return [
        {
            itemIdentifiers: [MeasureGroupIdentifier],
        },
        {
            itemIdentifiers: attributes.map(attributeLocalId),
        },
    ];
};

// Treemap
export function getTreemapDimensionsFromMdObj(insight: IInsight): IDimension[] {
    return getTreemapDimensionsFromBuckets(insight);
}

export function getTreemapDimensionsFromBuckets(insight: IInsight): IDimension[] {
    return getTreemapDimensionsFromAFM(insight);
}

export function getTreemapDimensionsFromAFM(insight: IInsight): IDimension[] {
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

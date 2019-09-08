// (C) 2007-2019 GoodData Corporation
import get = require("lodash/get");
import { AFM, VisualizationObject } from "@gooddata/typings";
import { VisType, VisualizationTypes } from "../constants/visualizationTypes";
import { MEASUREGROUP } from "../constants/dimensions";
import { ATTRIBUTE, COLUMNS, MEASURES, SEGMENT, STACK, TREND, VIEW } from "../constants/bucketNames";
import { VIEW_BY_ATTRIBUTES_LIMIT } from "../components/visualizations/chart/constants";
import {
    attributeId,
    bucketAttribute,
    bucketAttributes,
    bucketIsEmpty,
    IDimension,
    IInsight,
    insightAttributes,
    insightBucket,
    insightMeasures,
    insightTotals,
    ITotal,
} from "@gooddata/sdk-model";

export function getDimensionTotals(bucket: VisualizationObject.IBucket): ITotal[] {
    const bucketTotals: VisualizationObject.IVisualizationTotal[] = get<
        VisualizationObject.IBucket,
        "totals",
        VisualizationObject.IVisualizationTotal[]
    >(bucket, "totals", []);
    return bucketTotals.map(
        (total: VisualizationObject.IVisualizationTotal): AFM.ITotalItem => {
            return {
                measureIdentifier: total.measureIdentifier,
                type: total.type,
                attributeIdentifier: total.attributeIdentifier,
            };
        },
    );
}

export function getPivotTableDimensions(insight: IInsight): IDimension[] {
    const row = insightBucket(insight, ATTRIBUTE);
    const columns = insightBucket(insight, COLUMNS);
    const measures = insightBucket(insight, MEASURES);

    const rowAttributeIds = bucketAttributes(row).map(attributeId);
    const columnAttributeIds = bucketAttributes(columns).map(attributeId);

    const measuresItemIdentifiers = !bucketIsEmpty(measures) ? [MEASUREGROUP] : [];

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

    if (!bucketIsEmpty(viewBy)) {
        return [
            {
                itemIdentifiers: [MEASUREGROUP],
            },
            {
                itemIdentifiers: bucketAttributes(viewBy).map(attributeId),
            },
        ];
    }

    return [
        {
            itemIdentifiers: [],
        },
        {
            itemIdentifiers: [MEASUREGROUP],
        },
    ];
}

function getBarDimensions(insight: IInsight): IDimension[] {
    const viewBy = insightBucket(insight, VIEW);
    const stack = insightBucket(insight, STACK);

    if (bucketIsEmpty(stack)) {
        return [
            {
                itemIdentifiers: [MEASUREGROUP],
            },
            {
                itemIdentifiers: bucketAttributes(viewBy).map(attributeId),
            },
        ];
    }

    return [
        {
            itemIdentifiers: bucketAttributes(stack).map(attributeId),
        },
        {
            itemIdentifiers: [...bucketAttributes(viewBy).map(attributeId), MEASUREGROUP],
        },
    ];
}

function getAreaDimensions(insight: IInsight): IDimension[] {
    const viewByAttributes = bucketAttributes(insightBucket(insight, VIEW));
    const stack = insightBucket(insight, STACK);

    if (viewByAttributes.length > 1) {
        // only take first two view items
        const [viewItemIdentifier, stackItemIdentifier] = viewByAttributes
            .slice(0, VIEW_BY_ATTRIBUTES_LIMIT)
            .map(attributeId);
        return [
            {
                itemIdentifiers: [stackItemIdentifier],
            },
            {
                itemIdentifiers: [viewItemIdentifier, MEASUREGROUP],
            },
        ];
    }

    if (bucketIsEmpty(stack)) {
        return [
            {
                itemIdentifiers: [MEASUREGROUP],
            },
            {
                itemIdentifiers: viewByAttributes.map(attributeId),
            },
        ];
    }

    return [
        {
            itemIdentifiers: bucketAttributes(stack).map(attributeId),
        },
        {
            itemIdentifiers: [...viewByAttributes.map(attributeId), MEASUREGROUP],
        },
    ];
}

function getLineDimensions(insight: IInsight): IDimension[] {
    const trend = insightBucket(insight, TREND);
    const segment = insightBucket(insight, SEGMENT);

    if (bucketIsEmpty(segment)) {
        return [
            {
                itemIdentifiers: [MEASUREGROUP],
            },
            {
                itemIdentifiers: bucketAttributes(trend).map(attributeId),
            },
        ];
    }

    return [
        {
            itemIdentifiers: bucketAttributes(segment).map(attributeId),
        },
        {
            itemIdentifiers: [...bucketAttributes(trend).map(attributeId), MEASUREGROUP],
        },
    ];
}

export function getHeadlinesDimensions(): IDimension[] {
    return [{ itemIdentifiers: ["measureGroup"] }];
}

function getScatterDimensions(insight: IInsight): IDimension[] {
    const attribute = insightBucket(insight, ATTRIBUTE);

    if (!bucketIsEmpty(attribute)) {
        return [
            {
                itemIdentifiers: bucketAttributes(attribute).map(attributeId),
            },
            {
                itemIdentifiers: [MEASUREGROUP],
            },
        ];
    }

    return [
        {
            itemIdentifiers: [],
        },
        {
            itemIdentifiers: [MEASUREGROUP],
        },
    ];
}

// Heatmap
export function getHeatmapDimensionsFromMdObj(insight: IInsight): IDimension[] {
    return getHeatmapDimensionsFromBuckets(insight);
}

export function getHeatmapDimensionsFromBuckets(insight: IInsight): IDimension[] {
    const view = insightBucket(insight, VIEW);
    const stack = insightBucket(insight, STACK);

    if (bucketIsEmpty(stack)) {
        return [
            {
                itemIdentifiers: bucketAttributes(view).map(attributeId),
            },
            {
                itemIdentifiers: [MEASUREGROUP],
            },
        ];
    }

    return [
        {
            itemIdentifiers: bucketAttributes(view).map(attributeId),
        },
        {
            itemIdentifiers: [...bucketAttributes(stack).map(attributeId), MEASUREGROUP],
        },
    ];
}

function getBubbleDimensions(insight: IInsight): IDimension[] {
    const view = insightBucket(insight, VIEW);
    const stack = insightBucket(insight, STACK);

    if (bucketIsEmpty(stack)) {
        return [
            {
                itemIdentifiers: bucketAttributes(view).map(attributeId),
            },
            {
                itemIdentifiers: [MEASUREGROUP],
            },
        ];
    }

    return [
        {
            itemIdentifiers: [
                ...bucketAttributes(view).map(attributeId),
                ...bucketAttributes(stack).map(attributeId),
            ],
        },
        {
            itemIdentifiers: [MEASUREGROUP],
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
    const viewAttributes = bucketAttributes(insightBucket(insight, ATTRIBUTE));
    const stackAttribute = bucketAttribute(insightBucket(insight, STACK));

    return [
        {
            itemIdentifiers: stackAttribute ? [attributeId(stackAttribute)] : [],
        },
        {
            itemIdentifiers: [...viewAttributes.map(attributeId), MEASUREGROUP],
        },
    ];
}

// for LineChart, AreaChart, BarChart, ColumnChart
export function generateDefaultDimensions(insight: IInsight): IDimension[] {
    return [
        {
            itemIdentifiers: [MEASUREGROUP],
        },
        {
            itemIdentifiers: insightAttributes(insight).map(attributeId),
        },
    ];
}

export function isStackedChart(buckets: VisualizationObject.IBucket[], stackedBuckedName: string = STACK) {
    return buckets.some(bucket => bucket.localIdentifier === stackedBuckedName && bucket.items.length > 0);
}

// for ScatterPlot and BubbleChart
export function generateDefaultDimensionsForPointsCharts(insight: IInsight): IDimension[] {
    return [
        {
            itemIdentifiers: insightAttributes(insight).map(attributeId),
        },
        {
            itemIdentifiers: [MEASUREGROUP],
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
                itemIdentifiers: [MEASUREGROUP],
            },
        ];
    }

    return [
        {
            itemIdentifiers: [MEASUREGROUP],
        },
        {
            itemIdentifiers: attributes.map(attributeId),
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
                itemIdentifiers: [MEASUREGROUP],
            },
            {
                itemIdentifiers: attributes.map(attributeId),
            },
        ];
    }

    return [
        {
            itemIdentifiers: attributes.map(attributeId),
        },
        {
            itemIdentifiers: [MEASUREGROUP],
        },
    ];
}

export function getGeneralDimensionsFromAFM(insight: IInsight): IDimension[] {
    const attributes = insightAttributes(insight);
    const measures = insightMeasures(insight);
    const dimensions = [];

    if (attributes.length > 0) {
        dimensions.push({
            itemIdentifiers: attributes.map(attributeId),
        });
    }
    if (measures.length > 0) {
        dimensions.push({
            itemIdentifiers: [MEASUREGROUP],
        });
    }
    return dimensions;
}

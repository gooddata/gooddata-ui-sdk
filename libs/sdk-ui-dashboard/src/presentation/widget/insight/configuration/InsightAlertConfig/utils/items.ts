// (C) 2022-2024 GoodData Corporation
import {
    bucketAttributes,
    bucketMeasures,
    IAttribute,
    IBucket,
    ICatalogDateDataset,
    IInsight,
    IMeasure,
    insightBucket,
    insightVisualizationType,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    isArithmeticMeasure,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    isSimpleMeasure,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { AlertAttribute, AlertMetric, AlertMetricComparatorType } from "../../../types.js";

import { getCatalogAttribute } from "./getters.js";

type InsightType =
    | "headline"
    | "scatter"
    | "donut"
    | "treemap"
    | "combo2"
    | "heatmap"
    | "bubble"
    | "bullet"
    | "bar"
    | "table"
    | "area"
    | "column"
    | "line"
    | "pushpin"
    | "pie"
    | "sankey"
    | "dependencywheel"
    | "funnel"
    | "pyramid"
    | "waterfall"
    | "repeater";

/**
 * Get supported insight measures by insight
 * @param insight - insight to get supported measures for
 */
export function getSupportedInsightMeasuresByInsight(insight: IInsight | null | undefined): AlertMetric[] {
    const insightType = insight ? (insightVisualizationType(insight) as InsightType) : null;

    const { primaries, others } = collectAllMetric(insight);

    const simpleMetrics = [
        ...(primaries.map<AlertMetric | undefined>(mapMeasure(true)).filter(Boolean) as AlertMetric[]),
        ...(others.map<AlertMetric | undefined>(mapMeasure(false)).filter(Boolean) as AlertMetric[]),
    ];

    //NOTE: For now only headline insight support previous period and same period previous year,
    // if we want to support other insight types, just add the logic here or remove the condition at
    // all to support all insight types
    if (insightType === "headline") {
        mapPreviousPeriodMeasure(primaries, simpleMetrics, true);
        mapPreviousPeriodMeasure(others, simpleMetrics, false);
        mapPoPMeasure(primaries, simpleMetrics, true);
        mapPoPMeasure(others, simpleMetrics, false);
    }

    return simpleMetrics;
}

/**
 * Get supported insight attributes by insight
 * @param insight - insight to get supported attributes for
 * @param dateDatasets - date datasets to filter out date attributes
 */
export function getSupportedInsightAttributesByInsight(
    insight: IInsight | null | undefined,
    dateDatasets: ICatalogDateDataset[] = [],
): AlertAttribute[] {
    const attrs = collectAllAttributes(insight);

    return attrs
        .map<AlertAttribute | undefined>(mapAttribute(dateDatasets))
        .filter(Boolean) as AlertAttribute[];
}

//utils

function mapMeasure(isPrimary: boolean) {
    return (measure: IMeasure) => {
        if (isSimpleMeasure(measure) || isArithmeticMeasure(measure)) {
            return {
                measure,
                isPrimary,
                comparators: [],
            };
        }
        return undefined;
    };
}

function mapAttribute(dateDatasets: ICatalogDateDataset[]) {
    const dateAttributes = dateDatasets.flatMap((dataset) => dataset.dateAttributes);
    return (attribute: IAttribute): AlertAttribute => {
        const foundDate = getCatalogAttribute(dateAttributes, attribute);

        return {
            type: foundDate ? "dateAttribute" : "attribute",
            attribute,
        };
    };
}

function mapPreviousPeriodMeasure(metrics: IMeasure[], simpleMetrics: AlertMetric[], isPrimary: boolean) {
    const previousPeriodMetrics = metrics.filter((measure) =>
        isPreviousPeriodMeasure(measure),
    ) as IMeasure<IPreviousPeriodMeasureDefinition>[];
    previousPeriodMetrics.forEach((measure) => {
        const found = simpleMetrics.find(
            (simpleMetric) =>
                simpleMetric.measure.measure.localIdentifier ===
                measure.measure.definition.previousPeriodMeasure.measureIdentifier,
        );
        if (found) {
            found.comparators.push({
                measure,
                isPrimary,
                comparator: AlertMetricComparatorType.PreviousPeriod,
            });
        }
    });
}

function mapPoPMeasure(metrics: IMeasure[], simpleMetrics: AlertMetric[], isPrimary: boolean) {
    const popMetrics = metrics.filter((measure) =>
        isPoPMeasure(measure),
    ) as IMeasure<IPoPMeasureDefinition>[];
    popMetrics.forEach((measure) => {
        const found = simpleMetrics.find(
            (simpleMetric) =>
                simpleMetric.measure.measure.localIdentifier ===
                measure.measure.definition.popMeasureDefinition.measureIdentifier,
        );
        if (found) {
            found.comparators.push({
                measure,
                isPrimary,
                comparator: AlertMetricComparatorType.SamePeriodPreviousYear,
            });
        }
    });
}

function collectAllMetric(insight: IInsight | null | undefined): {
    primaries: IMeasure[];
    others: IMeasure[];
} {
    const insightType = insight ? (insightVisualizationType(insight) as InsightType) : null;

    if (!insight) {
        return {
            primaries: [],
            others: [],
        };
    }

    switch (insightType) {
        case "headline":
        case "bar":
        case "column":
        case "line":
        case "area":
        case "combo2":
        case "scatter":
        case "bubble":
        case "bullet":
        case "pie":
        case "donut":
        case "treemap":
        case "funnel":
        case "pyramid":
        case "heatmap":
        case "waterfall":
        case "dependencywheel":
        case "sankey":
        case "table": {
            return collectAllMetricsFrom(
                insight,
                [BucketNames.MEASURES],
                [BucketNames.SECONDARY_MEASURES, BucketNames.TERTIARY_MEASURES],
            );
        }
        case "pushpin": {
            return collectAllMetricsFrom(insight, [BucketNames.SIZE, BucketNames.COLOR]);
        }
        case "repeater": {
            return collectAllMetricsFrom(insight, [BucketNames.COLUMNS]);
        }
        default: {
            return {
                primaries: [],
                others: [],
            };
        }
    }
}

function collectAllAttributes(insight: IInsight | null | undefined) {
    const insightType = insight ? (insightVisualizationType(insight) as InsightType) : null;

    if (!insight) {
        return [];
    }

    switch (insightType) {
        case "headline":
        case "bar":
        case "column":
        case "line":
        case "area":
        case "combo2":
        case "scatter":
        case "bubble":
        case "bullet":
        case "pie":
        case "donut":
        case "treemap":
        case "funnel":
        case "pyramid":
        case "heatmap":
        case "waterfall":
        case "dependencywheel":
        case "sankey":
        case "table": {
            return collectAllAttributesFrom(insight, [
                BucketNames.ATTRIBUTE,
                BucketNames.ATTRIBUTES,
                BucketNames.TREND,
                BucketNames.SEGMENT,
                BucketNames.COLUMNS,
                BucketNames.VIEW,
                BucketNames.STACK,
                BucketNames.ATTRIBUTE_FROM,
                BucketNames.ATTRIBUTE_TO,
            ]);
        }
        case "repeater": {
            return collectAllAttributesFrom(insight, [BucketNames.ATTRIBUTE]);
        }
        case "pushpin": {
            return collectAllAttributesFrom(insight, [BucketNames.LOCATION]);
        }
        default: {
            return [];
        }
    }
}

function collectAllAttributesFrom(insight: IInsight, buckets: string[]) {
    return buckets.reduce<IAttribute[]>((acc, bucket) => {
        const items: IBucket | undefined = insight ? insightBucket(insight, bucket) : undefined;

        return [...acc, ...(items ? bucketAttributes(items) : [])];
    }, []);
}

function collectAllMetricsFrom(insight: IInsight, primaryBuckets: string[], secondaryBuckets: string[] = []) {
    const primaries = primaryBuckets.reduce<IMeasure[]>((acc, bucket) => {
        const items: IBucket | undefined = insight ? insightBucket(insight, bucket) : undefined;

        return [...acc, ...(items ? bucketMeasures(items) : [])];
    }, []);
    const others = secondaryBuckets.reduce<IMeasure[]>((acc, bucket) => {
        const items: IBucket | undefined = insight ? insightBucket(insight, bucket) : undefined;

        return [...acc, ...(items ? bucketMeasures(items) : [])];
    }, []);

    return {
        primaries,
        others,
    };
}

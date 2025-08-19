// (C) 2022-2025 GoodData Corporation
import {
    DateAttributeGranularity,
    DateGranularity,
    IAttribute,
    IBucket,
    ICatalogDateAttribute,
    ICatalogDateDataset,
    IFilter,
    IInsight,
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    IRelativeDateFilter,
    ObjRef,
    areObjRefsEqual,
    bucketAttributes,
    bucketMeasures,
    insightBucket,
    insightFilters,
    insightVisualizationType,
    isArithmeticMeasure,
    isPoPMeasure,
    isPoPMeasureDefinition,
    isPreviousPeriodMeasure,
    isPreviousPeriodMeasureDefinition,
    isRelativeDateFilter,
    isSimpleMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { getCatalogAttribute, getFiltersAttribute } from "./getters.js";
import { AlertAttribute, AlertMetric, AlertMetricComparatorType } from "../../types.js";

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

const SortedGranularities: DateAttributeGranularity[] = [
    "GDC.time.year",
    "GDC.time.quarter",
    "GDC.time.quarter_in_year",
    "GDC.time.month",
    "GDC.time.month_in_quarter",
    "GDC.time.month_in_year",
    "GDC.time.week_us",
    "GDC.time.week_in_year",
    "GDC.time.week_in_quarter",
    "GDC.time.week",
    "GDC.time.euweek_in_year",
    "GDC.time.euweek_in_quarter",
    "GDC.time.day_in_year",
    "GDC.time.day_in_quarter",
    "GDC.time.day_in_month",
    "GDC.time.day_in_week",
    "GDC.time.day_in_euweek",
    "GDC.time.date",
    "GDC.time.hour",
    "GDC.time.hour_in_day",
    "GDC.time.minute",
    "GDC.time.minute_in_hour",
];

/**
 * Get supported insight measures by insight
 * @param insight - insight to get supported measures for
 * @param dateDatasets - date datasets to filter out date attributes
 * @param canManageComparison - flag if user can manage comparison
 */
export function getSupportedInsightMeasuresByInsight(
    insight: IInsight | null | undefined,
    dateDatasets: ICatalogDateDataset[] = [],
    canManageComparison: boolean = false,
): AlertMetric[] {
    const insightType = insight ? (insightVisualizationType(insight) as InsightType) : null;

    const { primaries, others } = collectAllMetric(insight);

    const simpleMetrics = [
        ...(primaries.map<AlertMetric | undefined>(mapMeasure(true)).filter(Boolean) as AlertMetric[]),
        ...(others.map<AlertMetric | undefined>(mapMeasure(false)).filter(Boolean) as AlertMetric[]),
    ];

    const validComparisonBuckets = canManageComparison ? getSupportedBucketsForComparison(insightType) : null;

    // If insight is supported for comparison, we need to add comparators
    if (insight && insightType && (insightType === "headline" || validComparisonBuckets)) {
        mapPreviousPeriodMeasure(primaries, simpleMetrics, true);
        mapPreviousPeriodMeasure(others, simpleMetrics, false);
        mapPoPMeasure(primaries, simpleMetrics, true);
        mapPoPMeasure(others, simpleMetrics, false);
    }

    // If insight is supported for comparison, we need to add comparators that
    // are generated from date attributes used in insight buckets
    if (insight && insightType && validComparisonBuckets) {
        transformGranularities(
            insight,
            insightFilters(insight),
            validComparisonBuckets,
            simpleMetrics,
            dateDatasets,
        );
    }

    return simpleMetrics;
}

function getSupportedBucketsForComparison(insightType: InsightType | null) {
    switch (insightType) {
        case "line":
            return [BucketNames.TREND];
        case "column":
        case "bar":
        case "repeater":
        case "combo2":
        case "bullet":
        case "bubble":
        case "pie":
        case "donut":
        case "waterfall":
        case "pyramid":
        case "funnel":
            return [BucketNames.VIEW];
        case "table":
            return [BucketNames.ATTRIBUTE, BucketNames.COLUMNS];
        case "area":
            return [BucketNames.VIEW, BucketNames.STACK];
        default:
            return null;
    }
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
            //NOTE: For now we want to disable attributes for pushpin insight
            // at all because ofg bug https://gooddata.atlassian.net/browse/F1-889
            //return collectAllAttributesFrom(insight, [BucketNames.LOCATION]);
            return [];
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

function transformGranularities(
    insight: IInsight | null | undefined,
    insightFilters: IFilter[] = [],
    buckets: string[],
    simpleMetrics: AlertMetric[],
    datasets: ICatalogDateDataset[],
) {
    const usedDatasets = collectAllDateDatasets(insight, insightFilters, buckets, datasets);

    fillComparators(simpleMetrics, usedDatasets);
    fillGranularity(simpleMetrics, usedDatasets);
    removeInvalidComparators(simpleMetrics, insightFilters);
}

type ICatalogDateDatasetWithAllowedGranularity = ICatalogDateDataset & {
    dateAttributesUsed: ICatalogDateAttribute[];
};

function collectAllDateDatasets(
    insight: IInsight | null | undefined,
    insightFilters: IFilter[],
    buckets: string[],
    datasets: ICatalogDateDataset[],
): ICatalogDateDatasetWithAllowedGranularity[] {
    const attributes = buckets.reduce<IAttribute[]>((acc, bucketId) => {
        const bucket: IBucket | undefined = insight ? insightBucket(insight, bucketId) : undefined;

        return [...acc, ...(bucket ? bucketAttributes(bucket) : [])];
    }, []);

    const datasetsWithGranularity = insightFilters
        .map((filter) => {
            if (isRelativeDateFilter(filter)) {
                return [filter.relativeDateFilter.dataSet, filter.relativeDateFilter.granularity];
            }
            return null;
        })
        .filter(Boolean) as [ObjRef, DateAttributeGranularity][];

    return datasets
        .map((dataset) => {
            const dateAttributesFromBuckets = attributes
                .map((a) => getCatalogAttribute(dataset.dateAttributes, a))
                .filter(Boolean) as ICatalogDateAttribute[];
            const dateAttributesFromFilters = getFiltersAttribute(datasetsWithGranularity, dataset);

            return {
                ...dataset,
                dateAttributesUsed: [...dateAttributesFromBuckets, ...dateAttributesFromFilters].filter(
                    (value, index, self) => self.indexOf(value) === index,
                ),
            };
        })
        .filter((d) => d.dateAttributesUsed.length);
}

function fillComparators(
    simpleMetrics: AlertMetric[],
    datasets: ICatalogDateDatasetWithAllowedGranularity[],
) {
    if (datasets.length === 0) {
        return;
    }

    simpleMetrics.forEach((metric) => {
        const previousPeriod = metric.comparators.find(
            (c) => c.comparator === AlertMetricComparatorType.PreviousPeriod,
        );
        if (!previousPeriod) {
            //PP
            metric.comparators.push({
                measure: newPreviousPeriodMeasure(
                    metric.measure.measure.localIdentifier,
                    [
                        {
                            dataSet: datasets[0].dataSet.ref,
                            periodsAgo: 1,
                        },
                    ],
                    (a) => {
                        a.format(metric.measure.measure.format);
                        a.localId(`${metric.measure.measure.localIdentifier}_previous_period`);
                        return a;
                    },
                ),
                isPrimary: false,
                comparator: AlertMetricComparatorType.PreviousPeriod,
                dataset: undefined,
                granularity: undefined,
            });
        }

        const samePeriodPrevYear = metric.comparators.find(
            (c) => c.comparator === AlertMetricComparatorType.SamePeriodPreviousYear,
        );
        if (!samePeriodPrevYear) {
            const yearAttr = datasets[0].dateAttributes.find((a) => a.granularity === DateGranularity.year);
            if (yearAttr) {
                //PoP
                metric.comparators.push({
                    measure: newPopMeasure(
                        metric.measure.measure.localIdentifier,
                        yearAttr.attribute.ref,
                        (a) => {
                            a.format(metric.measure.measure.format);
                            a.localId(`${metric.measure.measure.localIdentifier}_pop`);
                            return a;
                        },
                    ),
                    isPrimary: false,
                    comparator: AlertMetricComparatorType.SamePeriodPreviousYear,
                    dataset: undefined,
                    granularity: undefined,
                });
            }
        }
    });
}

function fillGranularity(
    simpleMetrics: AlertMetric[],
    datasets: ICatalogDateDatasetWithAllowedGranularity[],
) {
    simpleMetrics.forEach((metric) => {
        metric.comparators.forEach((comparator) => {
            const def = comparator.measure.measure.definition;
            if (isPoPMeasureDefinition(def)) {
                const attr = def.popMeasureDefinition.popAttribute;

                const dataset = datasets.find((d) => {
                    return d.dateAttributes.some((a) => areObjRefsEqual(a.attribute.ref, attr));
                });

                if (dataset) {
                    const lowest = sortDateAttributes(dataset)[0];
                    comparator.dataset = dataset.dataSet;
                    comparator.granularity = lowest?.granularity;
                }
            }
            if (isPreviousPeriodMeasureDefinition(def)) {
                const ds = def.previousPeriodMeasure.dateDataSets[0]?.dataSet;

                const dataset = datasets.find((d) => {
                    return areObjRefsEqual(d.dataSet.ref, ds);
                });

                if (dataset) {
                    const lowest = sortDateAttributes(dataset)[0];
                    comparator.dataset = dataset.dataSet;
                    comparator.granularity = lowest?.granularity;
                }
            }
        });
    });
}

function sortDateAttributes(dataset: ICatalogDateDatasetWithAllowedGranularity) {
    return dataset.dateAttributesUsed.slice().sort((a, b) => {
        return SortedGranularities.indexOf(b.granularity) - SortedGranularities.indexOf(a.granularity);
    });
}

function removeInvalidComparators(simpleMetrics: AlertMetric[], insightFilters: IFilter[]) {
    const dateFilters = insightFilters.filter((filter) =>
        isRelativeDateFilter(filter),
    ) as IRelativeDateFilter[];

    // If there are no insight date filters, it means that all time
    // period filters are valid
    if (dateFilters.length === 0) {
        return;
    }

    const validDatasets = dateFilters
        .map((filter) => {
            // Only filters that contains this nad future dates are relevant
            if (filter.relativeDateFilter.to >= 0) {
                return filter.relativeDateFilter.dataSet;
            }
            return null;
        })
        .filter(Boolean);

    // We need to remove all comparators that are not contains
    // valid datasets.
    simpleMetrics.forEach((metric) => {
        metric.comparators = metric.comparators.filter((comparator) => {
            // If comparator has no dataset, it means that it is valid cause its
            // not related to date
            if (!comparator.dataset) {
                return true;
            }
            // If comparator has dataset, it must be in valid datasets
            return validDatasets.some((valid) => areObjRefsEqual(comparator.dataset?.ref, valid));
        });
    });
}

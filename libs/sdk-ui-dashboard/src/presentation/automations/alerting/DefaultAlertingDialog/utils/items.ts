// (C) 2022-2026 GoodData Corporation

import {
    type DateAttributeGranularity,
    DateGranularity,
    type IAttribute,
    type IAutomationMetadataObject,
    type IBucket,
    type ICatalogAttribute,
    type ICatalogDateAttribute,
    type ICatalogDateDataset,
    type IFilter,
    type IInsight,
    type IMeasure,
    type IRelativeDateFilter,
    type ObjRef,
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
    newAttribute,
    newMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { type AlertAttribute, type AlertMetric, AlertMetricComparatorType } from "../../types.js";

import { getCatalogAttribute, getFiltersAttribute } from "./getters.js";

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
    | "repeater"
    | "radar";

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

const ValidGranularities: DateAttributeGranularity[] = [
    "GDC.time.year",
    "GDC.time.quarter",
    "GDC.time.month",
    "GDC.time.week_us",
    "GDC.time.week",
    "GDC.time.date",
    "GDC.time.hour",
    "GDC.time.minute",
];

/**
 * Get supported insight measures by insight
 * @param insight - insight to get supported measures for
 * @param dateDatasets - date datasets to filter out date attributes
 * @param canManageComparison - flag if user can manage comparison
 * @param alert - alert to get supported measures for
 */
export function getSupportedInsightMeasuresByInsight(
    insight: IInsight | null | undefined,
    dateDatasets: ICatalogDateDataset[] = [],
    canManageComparison: boolean = false,
    alert?: IAutomationMetadataObject,
): AlertMetric[] {
    const insightType = insight ? (insightVisualizationType(insight) as InsightType) : null;

    const { primaries, others } = collectAllMetric(insight, alert);

    const simpleMetrics = [
        ...(primaries.map<AlertMetric | undefined>(mapMeasure(true)).filter(Boolean) as AlertMetric[]),
        ...(others.map<AlertMetric | undefined>(mapMeasure(false)).filter(Boolean) as AlertMetric[]),
    ];

    const validComparisonBuckets = canManageComparison ? getSupportedBucketsForComparison(insightType) : null;
    const validComparisonType = insightType === "headline" || validComparisonBuckets || !insight;

    // If insight is supported for comparison, we need to add comparators
    if (validComparisonType) {
        mapPreviousPeriodMeasure(primaries, simpleMetrics, true);
        mapPreviousPeriodMeasure(others, simpleMetrics, false);
        mapPoPMeasure(primaries, simpleMetrics, true);
        mapPoPMeasure(others, simpleMetrics, false);
    }

    // If insight is supported for comparison, we need to add comparators that
    // are generated from date attributes used in insight buckets
    if (validComparisonType) {
        const filters = insight ? insightFilters(insight) : [];
        transformGranularities(
            insight,
            filters,
            validComparisonBuckets,
            simpleMetrics,
            dateDatasets,
            !insight,
        );
    }

    return simpleMetrics;
}

function getSupportedBucketsForComparison(insightType: InsightType | null) {
    switch (insightType) {
        case "line":
        case "radar":
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
 * @param attributes - attributes to filter out date attributes
 * @param dateDatasets - date datasets to filter out date attributes
 * @param alert - alert metadata object
 */
export function getSupportedInsightAttributesByInsight(
    insight: IInsight | null | undefined,
    attributes: ICatalogAttribute[],
    dateDatasets: ICatalogDateDataset[] = [],
    alert?: IAutomationMetadataObject,
): AlertAttribute[] {
    const attrs = collectAllAttributes(insight, attributes, alert);

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
    const previousPeriodMetrics = metrics.filter((measure) => isPreviousPeriodMeasure(measure));
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
    const popMetrics = metrics.filter((measure) => isPoPMeasure(measure));
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

function collectAllMetric(
    insight: IInsight | null | undefined,
    alert: IAutomationMetadataObject | null | undefined,
): {
    primaries: IMeasure[];
    others: IMeasure[];
} {
    if (insight) {
        const insightType = insightVisualizationType(insight) as InsightType;
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
            case "table":
            case "radar": {
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
    if (alert) {
        if (alert.alert?.condition.type === "relative") {
            const left = alert.alert?.condition.measure.left;
            const right = alert.alert?.condition.measure.right;
            return {
                primaries: [
                    ...(left
                        ? [
                              newMeasure(left.id, (a) =>
                                  a.format(left.format).title(left.title).localId(left.id),
                              ),
                          ]
                        : []),
                    ...(right
                        ? [
                              newMeasure(right.id, (a) =>
                                  a.format(right.format).title(right.title).localId(right.id),
                              ),
                          ]
                        : []),
                ],
                others: [],
            };
        }
        if (alert.alert?.condition.type === "comparison") {
            const left = alert.alert?.condition.left;
            return {
                primaries: [
                    ...(left
                        ? [
                              newMeasure(left.id, (a) =>
                                  a.format(left.format).title(left.title).localId(left.id),
                              ),
                          ]
                        : []),
                ],
                others: [],
            };
        }
        if (alert.alert?.condition.type === "anomalyDetection") {
            const measure = alert.alert?.condition.measure;
            return {
                primaries: [
                    ...(measure
                        ? [
                              newMeasure(measure.id, (a) =>
                                  a.format(measure.format).title(measure.title).localId(measure.id),
                              ),
                          ]
                        : []),
                ],
                others: [],
            };
        }
    }

    return {
        primaries: [],
        others: [],
    };
}

function collectAllAttributes(
    insight: IInsight | null | undefined,
    attributes: ICatalogAttribute[],
    alert: IAutomationMetadataObject | null | undefined,
) {
    if (insight) {
        const insightType = insight ? (insightVisualizationType(insight) as InsightType) : null;
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
            case "table":
            case "radar": {
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
    if (alert?.alert?.execution.attributes) {
        return alert.alert.execution.attributes
            .map((attr) => {
                const found = attributes.find((a) => {
                    return (
                        areObjRefsEqual(attr.attribute.displayForm, a.defaultDisplayForm.ref) ||
                        a.displayForms.some((df) => areObjRefsEqual(attr.attribute.displayForm, df))
                    );
                });

                if (found) {
                    return newAttribute(found.defaultDisplayForm.attribute, (m) => {
                        return m
                            .displayForm(found.defaultDisplayForm.ref)
                            .localId(attr.attribute.localIdentifier)
                            .showAllValues(attr.attribute.showAllValues)
                            .alias(attr.attribute.alias);
                    });
                }
                return null;
            })
            .filter(Boolean) as IAttribute[];
    }
    return [];
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
    buckets: string[] | null | undefined,
    simpleMetrics: AlertMetric[],
    datasets: ICatalogDateDataset[],
    allowAllGranularity: boolean,
) {
    const usedDatasets = collectAllDateDatasets(insight, insightFilters, buckets, datasets);

    fillComparators(simpleMetrics, usedDatasets, allowAllGranularity);
    fillGranularity(simpleMetrics, usedDatasets);
    removeInvalidComparators(simpleMetrics, insightFilters);
}

type ICatalogDateDatasetWithAllowedGranularity = ICatalogDateDataset & {
    dateAttributesUsed: ICatalogDateAttribute[];
};

function collectAllDateDatasets(
    insight: IInsight | null | undefined,
    insightFilters: IFilter[],
    buckets: string[] | null | undefined,
    datasets: ICatalogDateDataset[],
): ICatalogDateDatasetWithAllowedGranularity[] {
    const attributes =
        buckets?.reduce<IAttribute[]>((acc, bucketId) => {
            const bucket: IBucket | undefined = insight ? insightBucket(insight, bucketId) : undefined;

            return [...acc, ...(bucket ? bucketAttributes(bucket) : [])];
        }, []) ?? [];

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
            const dateAttributesFromFilters = insight
                ? getFiltersAttribute(datasetsWithGranularity, dataset)
                : getValidDateAttributes(dataset.dateAttributes);

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
    allowAllGranularity: boolean,
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
            const dataset = datasets[0];
            if (allowAllGranularity) {
                dataset.dateAttributesUsed.forEach((dateAttr) => {
                    metric.comparators.push(
                        createPP(metric, dataset, dateAttr.granularity, dateAttr.granularity),
                    );
                });
            } else {
                metric.comparators.push(createPP(metric, dataset, "pp"));
            }
        }

        const samePeriodPrevYear = metric.comparators.find(
            (c) => c.comparator === AlertMetricComparatorType.SamePeriodPreviousYear,
        );
        if (!samePeriodPrevYear) {
            const yearAttr = datasets[0].dateAttributes.find(
                (a) => a.granularity === DateGranularity["year"],
            );
            if (yearAttr) {
                //PoP
                const dataset = datasets[0];
                if (allowAllGranularity) {
                    dataset.dateAttributesUsed.forEach((dateAttr) => {
                        metric.comparators.push(
                            createSP(metric, yearAttr, dateAttr.granularity, dateAttr.granularity),
                        );
                    });
                } else {
                    metric.comparators.push(createSP(metric, yearAttr, "pop"));
                }
            }
        }
    });
}

function createPP(
    metric: AlertMetric,
    dataset: ICatalogDateDatasetWithAllowedGranularity,
    suffix: string,
    granularity?: DateAttributeGranularity,
) {
    return {
        measure: newPreviousPeriodMeasure(
            metric.measure.measure.localIdentifier,
            [
                {
                    dataSet: dataset.dataSet.ref,
                    periodsAgo: 1,
                },
            ],
            (a) => {
                a.format(metric.measure.measure.format);
                a.localId(`${metric.measure.measure.localIdentifier}_previous_period_${suffix}`);
                return a;
            },
        ),
        isPrimary: false,
        comparator: AlertMetricComparatorType.PreviousPeriod,
        granularity: granularity ?? undefined,
        dataset: undefined,
    };
}

function createSP(
    metric: AlertMetric,
    yearAttr: ICatalogDateAttribute,
    suffix: string,
    granularity?: DateAttributeGranularity,
) {
    return {
        measure: newPopMeasure(metric.measure.measure.localIdentifier, yearAttr.attribute.ref, (a) => {
            a.format(metric.measure.measure.format);
            a.localId(`${metric.measure.measure.localIdentifier}_pop_${suffix}`);
            return a;
        }),
        isPrimary: false,
        comparator: AlertMetricComparatorType.SamePeriodPreviousYear,
        granularity: granularity ?? undefined,
        dataset: undefined,
    };
}

function getValidDateAttributes(attributes: ICatalogDateAttribute[]) {
    return attributes.filter((attr) => ValidGranularities.includes(attr.granularity));
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
                    comparator.granularity = comparator.granularity ?? lowest?.granularity;
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
                    comparator.granularity = comparator.granularity ?? lowest?.granularity;
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

    const validDatasets = dateFilters.map((filter) => filter.relativeDateFilter.dataSet).filter(Boolean);

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

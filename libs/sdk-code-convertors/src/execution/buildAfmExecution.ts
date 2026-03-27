// (C) 2024-2026 GoodData Corporation

import {
    type AFM,
    type AttributeItem,
    type ComparisonMeasureValueFilter,
    type CompoundMeasureValueFilter,
    type Dimension,
    type FilterDefinition,
    type MeasureItem,
    type MeasureValueCondition,
    type RangeMeasureValueFilter,
    type RelativeDateFilterRelativeDateFilterGranularityEnum,
    type SortKey,
} from "@gooddata/api-client-tiger";
import type {
    ComparisonCondition,
    Query,
    QueryFilters,
    RangeCondition,
    Sorts,
} from "@gooddata/sdk-code-schemas/v1";

import { type ExportEntities, type ToExecutionResults } from "../types.js";
import { convertBucketToTitle } from "../utils/convertBucketToTitle.js";
import { mapDateAttribute, mapDateDataset } from "../utils/dateUtils.js";
import { parseDateValues } from "../utils/filterUtils.js";
import { getFullField } from "../utils/sharedUtils.js";
import {
    isAbsoluteDateFilter,
    isArithmeticMetricField,
    isAttributeField,
    isAttributeSort,
    isCalculatedMetricField,
    isInlineMetricField,
    isMetricAllValueFilter,
    isMetricComparisonValueFilter,
    isMetricField,
    isMetricRangeValueFilter,
    isMetricValueFilterWithConditions,
    isNegativeAttributeFilter,
    isPoPMetricField,
    isPositiveAttributeFilter,
    isPreviousPeriodField,
    isRankingFilter,
    isRelativeDateFilter,
    isSimpleMetricSort,
} from "../utils/typeGuards.js";
import { createIdentifier, createLocalIdentifier } from "../utils/yamlUtils.js";

const ATTRIBUTES_DIMENSION = `dim_0`;
const MEASURES_DIMENSION = `dim_1`;

/** @public */
export function buildAfmExecution(entities: ExportEntities, query: Query): ToExecutionResults {
    const execution = buildExecution(entities, query);
    const { items: dimensions, sorting } = buildDimensions(query, execution);
    const fields = buildFields(entities, query);

    return {
        execution: {
            execution,
            resultSpec: {
                dimensions,
                //NOTE: For now we are not supporting totals, because there are no part of the query
                totals: [],
            },
            settings: {},
        },
        fields,
        sorting,
    };
}

function buildFields(entities: ExportEntities, query: Query) {
    return Object.keys(query.fields || {}).reduce(
        (acc, field) => {
            const fieldDef = getFullField(query.fields[field]);
            acc[field] = {
                title: convertBucketToTitle(entities, query, fieldDef) || undefined,
            };
            return acc;
        },
        {} as ToExecutionResults["fields"],
    );
}

function buildExecution(entities: ExportEntities, query: Query): AFM {
    const fields = query.fields || {};

    return {
        attributes: Object.keys(fields)
            .map((field) => {
                const fieldDef = getFullField(fields[field]);
                if (isAttributeField(fieldDef)) {
                    return {
                        localIdentifier: field,
                        label: createIdentifier(fieldDef.using, { forceType: "label" }),
                        showAllValues: fieldDef.show_all_values,
                    };
                }
                return null;
            })
            .filter((a) => a !== null) as AttributeItem[],
        measures: Object.keys(fields)
            .map((field) => {
                const fieldDef = getFullField(fields[field]);
                if (isInlineMetricField(fieldDef)) {
                    return {
                        localIdentifier: field,
                        definition: {
                            inline: {
                                maql: fieldDef.maql,
                            },
                        },
                    };
                }
                if (isCalculatedMetricField(fieldDef)) {
                    const item = createIdentifier(fieldDef.using, { forceMetric: true }) as any;
                    if (item) {
                        return {
                            localIdentifier: field,
                            definition: {
                                measure: {
                                    item,
                                    aggregation: fieldDef.aggregation,
                                    computeRatio: fieldDef.compute_ratio,
                                    filters: buildFilters(entities, fieldDef.filter_by),
                                },
                            },
                        };
                    }
                    return null;
                }
                if (isMetricField(fieldDef)) {
                    const item = createIdentifier(fieldDef.using, { forceMetric: true }) as any;
                    if (item) {
                        return {
                            localIdentifier: field,
                            definition: {
                                measure: {
                                    item,
                                    computeRatio: fieldDef.compute_ratio,
                                    filters: buildFilters(entities, fieldDef.filter_by),
                                },
                            },
                        };
                    }
                    return null;
                }
                if (isArithmeticMetricField(fieldDef)) {
                    const measureIdentifiers = fieldDef.using;
                    if (measureIdentifiers.length >= 2) {
                        return {
                            localIdentifier: field,
                            definition: {
                                arithmeticMeasure: {
                                    measureIdentifiers: measureIdentifiers.map((id) =>
                                        createLocalIdentifier(id),
                                    ),
                                    operator: fieldDef.operator,
                                },
                            },
                        };
                    }
                    return null;
                }
                if (isPoPMetricField(fieldDef)) {
                    const popAttribute = mapDateAttribute(query, fieldDef);
                    if (popAttribute) {
                        return {
                            localIdentifier: field,
                            definition: {
                                overPeriodMeasure: {
                                    measureIdentifier: createLocalIdentifier(fieldDef.using),
                                    dateAttributes: [
                                        {
                                            attribute: popAttribute,
                                            periodsAgo: 1,
                                        },
                                    ],
                                },
                            },
                        };
                    }
                    return null;
                }
                if (isPreviousPeriodField(fieldDef)) {
                    const dataset = mapDateDataset(query, fieldDef);
                    if (dataset) {
                        return {
                            localIdentifier: field,
                            definition: {
                                previousPeriodMeasure: {
                                    measureIdentifier: createLocalIdentifier(fieldDef.using),
                                    dateDatasets: [
                                        {
                                            dataset: dataset,
                                            periodsAgo: fieldDef.period ?? 1,
                                        },
                                    ],
                                },
                            },
                        };
                    }
                    return null;
                }
                return null;
            })
            .filter((a) => a !== null) as MeasureItem[],
        filters: buildFilters(entities, query.filter_by),
        auxMeasures: [],
    };
}

function buildDimensions(
    query: Query,
    execution: AFM,
): {
    items: Dimension[];
    sorting: Record<string, "ASC" | "DESC">;
} {
    const { items, sorting } = buildSorting(query.sort_by);
    return {
        items: [
            {
                localIdentifier: ATTRIBUTES_DIMENSION,
                itemIdentifiers: execution.attributes.map((a) => a.localIdentifier),
                sorting: items,
            },
            {
                localIdentifier: MEASURES_DIMENSION,
                itemIdentifiers: ["measureGroup"],
            },
        ],
        sorting,
    };
}

function buildFilters(entities: ExportEntities, filters_by: QueryFilters | undefined): FilterDefinition[] {
    if (!filters_by) {
        return [];
    }

    // TODO
    const filters: FilterDefinition[] = [];

    Object.keys(filters_by ?? {}).forEach((key) => {
        const filter = filters_by[key];
        if (isAbsoluteDateFilter(filter)) {
            filters.push({
                absoluteDateFilter: {
                    dataset: createIdentifier<any>(filter.using, { forceType: "dataset" }),
                    from: filter.from as string,
                    to: filter.to as string,
                },
            });
        }
        if (isRelativeDateFilter(filter)) {
            filters.push({
                relativeDateFilter: {
                    dataset: createIdentifier<any>(filter.using, { forceType: "dataset" }),
                    granularity: (filter.granularity ??
                        undefined) as RelativeDateFilterRelativeDateFilterGranularityEnum,
                    from: filter.from as number,
                    to: filter.to as number,
                },
            });
        }
        if (isPositiveAttributeFilter(filter)) {
            filters.push({
                positiveAttributeFilter: {
                    label: createIdentifier<any>(filter.using),
                    in: {
                        values: parseDateValues(entities, filter.using, filter.state?.include ?? []),
                    },
                },
            });
        }
        if (isNegativeAttributeFilter(filter)) {
            filters.push({
                negativeAttributeFilter: {
                    label: createIdentifier<any>(filter.using),
                    notIn: {
                        values: parseDateValues(entities, filter.using, filter.state?.exclude ?? []),
                    },
                },
            });
        }
        if (isMetricValueFilterWithConditions(filter)) {
            // TypeScript narrows to MultipleConditions via type guard
            const conditions = filter.conditions ?? [];

            // Any ALL condition makes this filter a no-op at execution time.
            const hasAllCondition = conditions.some(
                (c) => !c || typeof c !== "object" || !("condition" in c) || c.condition == null,
            );
            if (hasAllCondition) {
                return;
            }

            // Build AFM conditions array
            const afmConditions: MeasureValueCondition[] = [];

            conditions.forEach((c) => {
                if ("condition" in c && c.condition) {
                    if (c.condition === "BETWEEN" || c.condition === "NOT_BETWEEN") {
                        const rangeCondition = c as RangeCondition;
                        afmConditions.push({
                            range: {
                                operator: rangeCondition.condition,
                                from: rangeCondition.from,
                                to: rangeCondition.to,
                            },
                        });
                    } else {
                        const comparisonCondition = c as ComparisonCondition;
                        afmConditions.push({
                            comparison: {
                                operator: comparisonCondition.condition,
                                value: comparisonCondition.value,
                            },
                        });
                    }
                }
            });

            if (afmConditions.length > 0) {
                const compoundMeasureValueFilter: CompoundMeasureValueFilter = {
                    compoundMeasureValueFilter: {
                        measure: createIdentifier(filter.using) || createLocalIdentifier(filter.using),
                        conditions: afmConditions,
                        treatNullValuesAs: filter.null_values_as_zero ? 0 : undefined,
                    },
                };

                if (
                    filter.dimensionality &&
                    Array.isArray(filter.dimensionality) &&
                    filter.dimensionality.length > 0
                ) {
                    compoundMeasureValueFilter.compoundMeasureValueFilter.dimensionality =
                        filter.dimensionality.map(
                            (item: string) => createIdentifier(item) || createLocalIdentifier(item),
                        );
                }

                filters.push(compoundMeasureValueFilter);
            }
        }
        // MVF with operator "All" (no condition) - no-op at execution time.
        if (isMetricAllValueFilter(filter)) {
            return;
        }
        if (isMetricRangeValueFilter(filter)) {
            const rangeMeasureValueFilter: RangeMeasureValueFilter = {
                rangeMeasureValueFilter: {
                    measure: createIdentifier(filter.using) || createLocalIdentifier(filter.using),
                    operator: filter.condition,
                    from: filter.from,
                    to: filter.to,
                    treatNullValuesAs: filter.null_values_as_zero ? 0 : undefined,
                },
            };

            if (
                filter.dimensionality &&
                Array.isArray(filter.dimensionality) &&
                filter.dimensionality.length > 0
            ) {
                rangeMeasureValueFilter.rangeMeasureValueFilter.dimensionality = filter.dimensionality.map(
                    (item: string) => createIdentifier(item) || createLocalIdentifier(item),
                );
            }

            filters.push(rangeMeasureValueFilter);
        }
        if (isMetricComparisonValueFilter(filter)) {
            const comparisonMeasureValueFilter: ComparisonMeasureValueFilter = {
                comparisonMeasureValueFilter: {
                    measure: createIdentifier(filter.using) || createLocalIdentifier(filter.using),
                    operator: filter.condition,
                    value: filter.value,
                    treatNullValuesAs: filter.null_values_as_zero ? 0 : undefined,
                },
            };

            if (
                filter.dimensionality &&
                Array.isArray(filter.dimensionality) &&
                filter.dimensionality.length > 0
            ) {
                comparisonMeasureValueFilter.comparisonMeasureValueFilter.dimensionality =
                    filter.dimensionality.map(
                        (item: string) => createIdentifier(item) || createLocalIdentifier(item),
                    );
            }

            filters.push(comparisonMeasureValueFilter);
        }
        if (isRankingFilter(filter)) {
            filters.push({
                rankingFilter: {
                    measures: [
                        createIdentifier(filter.using) || createLocalIdentifier(filter.using),
                        ...(filter.attribute
                            ? [createIdentifier(filter.attribute) || createLocalIdentifier(filter.attribute)]
                            : []),
                    ],
                    operator: filter.top === undefined ? "BOTTOM" : "TOP",
                    value: filter.top === undefined ? filter.bottom! : filter.top,
                },
            });
        }
    });

    return filters;
}

function buildSorting(sort_by: Sorts | undefined): {
    items: SortKey[];
    sorting: Record<string, "ASC" | "DESC">;
} {
    if (!sort_by) {
        return {
            items: [],
            sorting: {},
        };
    }

    const sorting: Record<string, "ASC" | "DESC"> = {};
    const items = sort_by
        .map((sort) => {
            if (isAttributeSort(sort)) {
                sorting[sort.by] = sort.direction;
                return {
                    attribute: {
                        attributeIdentifier: sort.by,
                        direction: sort.direction,
                        sortType: sort.aggregation === "SUM" ? "AREA" : "DEFAULT",
                    },
                };
            }
            if (isSimpleMetricSort(sort)) {
                const metric = sort.metrics[0] as string;
                sorting[metric] = sort.direction;
                return {
                    value: {
                        dataColumnLocators: {
                            [MEASURES_DIMENSION]: {
                                measureGroup: metric,
                            },
                        },
                        direction: sort.direction,
                    },
                };
            }
            return null;
        })
        .filter(Boolean) as SortKey[];

    return {
        items,
        sorting,
    };
}

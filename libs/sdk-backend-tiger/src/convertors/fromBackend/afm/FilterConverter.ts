// (C) 2024-2025 GoodData Corporation

import isNil from "lodash/isNil.js";

import {
    AbsoluteDateFilter,
    BoundedFilter,
    ComparisonMeasureValueFilter,
    FilterDefinition,
    NegativeAttributeFilter,
    PositiveAttributeFilter,
    RangeMeasureValueFilter,
    RankingFilter,
    RelativeDateFilter,
    isAfmObjectIdentifier,
    isAfmObjectLocalIdentifier,
} from "@gooddata/api-client-tiger";
import { NotSupported } from "@gooddata/sdk-backend-spi";
import { IFilter, ILowerBoundedFilter, IUpperBoundedFilter, ObjRefInScope } from "@gooddata/sdk-model";

import { toSdkGranularity } from "../dateGranularityConversions.js";
import { toLocalRef, toObjRef } from "../ObjRefConverter.js";

const isPositiveAttributeFilter = (filter: unknown): filter is PositiveAttributeFilter => {
    return (filter as PositiveAttributeFilter).positiveAttributeFilter !== undefined;
};

const isNegativeAttributeFilter = (filter: unknown): filter is NegativeAttributeFilter => {
    return (filter as NegativeAttributeFilter).negativeAttributeFilter !== undefined;
};

const isAbsoluteDateFilter = (filter: unknown): filter is AbsoluteDateFilter => {
    return (filter as AbsoluteDateFilter).absoluteDateFilter !== undefined;
};

const isRelativeDateFilter = (filter: unknown): filter is RelativeDateFilter => {
    return (filter as RelativeDateFilter).relativeDateFilter !== undefined;
};

const isRelativeBoundedDateFilter = (
    filter: unknown,
): filter is RelativeDateFilter & {
    relativeDateFilter: RelativeDateFilter & { boundedFilter: BoundedFilter };
} => {
    return isRelativeDateFilter(filter) && filter.relativeDateFilter.boundedFilter !== undefined;
};

const isComparisonMeasureValueFilter = (filter: unknown): filter is ComparisonMeasureValueFilter => {
    return (filter as ComparisonMeasureValueFilter).comparisonMeasureValueFilter !== undefined;
};

const isRangeMeasureValueFilter = (filter: unknown): filter is RangeMeasureValueFilter => {
    return (filter as RangeMeasureValueFilter).rangeMeasureValueFilter !== undefined;
};

const isRankingFilter = (filter: unknown): filter is RankingFilter => {
    return (filter as RankingFilter).rankingFilter !== undefined;
};

export const convertFilter = (filter: FilterDefinition): IFilter => {
    if (isPositiveAttributeFilter(filter) && isAfmObjectIdentifier(filter.positiveAttributeFilter.label)) {
        return {
            positiveAttributeFilter: {
                displayForm: toObjRef(filter.positiveAttributeFilter.label),
                localIdentifier: filter.positiveAttributeFilter.localIdentifier,
                in: filter.positiveAttributeFilter.in,
            },
        };
    } else if (
        isPositiveAttributeFilter(filter) &&
        isAfmObjectLocalIdentifier(filter.positiveAttributeFilter.label)
    ) {
        return {
            positiveAttributeFilter: {
                displayForm: toLocalRef(filter.positiveAttributeFilter.label),
                localIdentifier: filter.positiveAttributeFilter.localIdentifier,
                in: filter.positiveAttributeFilter.in,
            },
        };
    } else if (
        isNegativeAttributeFilter(filter) &&
        isAfmObjectIdentifier(filter.negativeAttributeFilter.label)
    ) {
        return {
            negativeAttributeFilter: {
                displayForm: toObjRef(filter.negativeAttributeFilter.label),
                localIdentifier: filter.negativeAttributeFilter.localIdentifier,
                notIn: filter.negativeAttributeFilter.notIn,
            },
        };
    } else if (
        isNegativeAttributeFilter(filter) &&
        isAfmObjectLocalIdentifier(filter.negativeAttributeFilter.label)
    ) {
        return {
            negativeAttributeFilter: {
                displayForm: toLocalRef(filter.negativeAttributeFilter.label),
                localIdentifier: filter.negativeAttributeFilter.localIdentifier,
                notIn: filter.negativeAttributeFilter.notIn,
            },
        };
    } else if (isAbsoluteDateFilter(filter)) {
        return {
            absoluteDateFilter: {
                dataSet: toObjRef(filter.absoluteDateFilter.dataset),
                localIdentifier: filter.absoluteDateFilter.localIdentifier,
                from: filter.absoluteDateFilter.from,
                to: filter.absoluteDateFilter.to,
            },
        };
    } else if (isRelativeDateFilter(filter)) {
        const { from, to } = filter.relativeDateFilter;

        let boundedFilter: ILowerBoundedFilter | IUpperBoundedFilter | undefined;
        if (isRelativeBoundedDateFilter(filter)) {
            const { from: boundedFrom, to: boundedTo } = filter.relativeDateFilter.boundedFilter;

            if (!isNil(boundedFrom)) {
                boundedFilter = {
                    from: boundedFrom,
                    granularity: toSdkGranularity(filter.relativeDateFilter.boundedFilter.granularity),
                };
            } else if (!isNil(boundedTo)) {
                boundedFilter = {
                    to: boundedTo,
                    granularity: toSdkGranularity(filter.relativeDateFilter.boundedFilter.granularity),
                };
            } else {
                throw new NotSupported("Invalid bounded filter: must have one of the bounds.");
            }
        }

        return {
            relativeDateFilter: {
                dataSet: toObjRef(filter.relativeDateFilter.dataset),
                localIdentifier: filter.relativeDateFilter.localIdentifier,
                from,
                to,
                granularity: toSdkGranularity(filter.relativeDateFilter.granularity),
                ...(boundedFilter ? { boundedFilter } : {}),
            },
        };
    } else if (isComparisonMeasureValueFilter(filter)) {
        const measure = filter.comparisonMeasureValueFilter.measure;
        return {
            measureValueFilter: {
                measure: isAfmObjectIdentifier(measure) ? toObjRef(measure) : measure,
                localIdentifier: filter.comparisonMeasureValueFilter.localIdentifier,
                condition: {
                    comparison: {
                        operator: filter.comparisonMeasureValueFilter.operator,
                        value: filter.comparisonMeasureValueFilter.value,
                    },
                },
            },
        };
    } else if (isRangeMeasureValueFilter(filter)) {
        const measure = filter.rangeMeasureValueFilter.measure;
        return {
            measureValueFilter: {
                measure: isAfmObjectIdentifier(measure) ? toObjRef(measure) : measure,
                localIdentifier: filter.rangeMeasureValueFilter.localIdentifier,
                condition: {
                    range: {
                        operator: filter.rangeMeasureValueFilter.operator,
                        from: filter.rangeMeasureValueFilter.from,
                        to: filter.rangeMeasureValueFilter.to,
                    },
                },
            },
        };
    } else if (isRankingFilter(filter)) {
        return {
            rankingFilter: {
                measure: filter.rankingFilter.measures[0] as ObjRefInScope,
                localIdentifier: filter.rankingFilter.localIdentifier,
                operator: filter.rankingFilter.operator,
                value: filter.rankingFilter.value,
            },
        };
    } else {
        throw new Error(`Unknown Tiger filter type`);
    }
};

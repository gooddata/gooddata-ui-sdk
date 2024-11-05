// (C) 2024 GoodData Corporation

import {
    FilterDefinition,
    AbsoluteDateFilter,
    ComparisonMeasureValueFilter,
    NegativeAttributeFilter,
    PositiveAttributeFilter,
    RangeMeasureValueFilter,
    RankingFilter,
    RelativeDateFilter,
    isAfmObjectIdentifier,
    isAfmObjectLocalIdentifier,
} from "@gooddata/api-client-tiger";
import { IFilter, ObjRefInScope } from "@gooddata/sdk-model";
import { toLocalRef, toObjRef } from "../ObjRefConverter.js";
import { toSdkGranularity } from "../dateGranularityConversions.js";

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
        return {
            relativeDateFilter: {
                dataSet: toObjRef(filter.relativeDateFilter.dataset),
                localIdentifier: filter.relativeDateFilter.localIdentifier,
                from: filter.relativeDateFilter.from,
                to: filter.relativeDateFilter.to,
                granularity: toSdkGranularity(filter.relativeDateFilter.granularity),
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

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
    AfmObjectIdentifier,
} from "@gooddata/api-client-tiger";
import { IFilter } from "@gooddata/sdk-model";
import { toObjRef } from "../ObjRefConverter.js";
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
    if (isPositiveAttributeFilter(filter)) {
        return {
            positiveAttributeFilter: {
                displayForm: toObjRef(filter.positiveAttributeFilter.label as AfmObjectIdentifier),
                in: filter.positiveAttributeFilter.in,
            },
        };
    } else if (isNegativeAttributeFilter(filter)) {
        return {
            negativeAttributeFilter: {
                displayForm: toObjRef(filter.negativeAttributeFilter.label as AfmObjectIdentifier),
                notIn: filter.negativeAttributeFilter.notIn,
            },
        };
    } else if (isAbsoluteDateFilter(filter)) {
        return {
            absoluteDateFilter: {
                dataSet: toObjRef(filter.absoluteDateFilter.dataset),
                from: filter.absoluteDateFilter.from,
                to: filter.absoluteDateFilter.to,
            },
        };
    } else if (isRelativeDateFilter(filter)) {
        return {
            relativeDateFilter: {
                dataSet: toObjRef(filter.relativeDateFilter.dataset),
                from: filter.relativeDateFilter.from,
                to: filter.relativeDateFilter.to,
                granularity: toSdkGranularity(filter.relativeDateFilter.granularity),
            },
        };
    } else if (isComparisonMeasureValueFilter(filter)) {
        return {
            measureValueFilter: {
                measure: toObjRef(filter.comparisonMeasureValueFilter.measure as AfmObjectIdentifier),
                condition: {
                    comparison: {
                        operator: filter.comparisonMeasureValueFilter.operator,
                        value: filter.comparisonMeasureValueFilter.value,
                    },
                },
            },
        };
    } else if (isRangeMeasureValueFilter(filter)) {
        return {
            measureValueFilter: {
                measure: toObjRef(filter.rangeMeasureValueFilter.measure as AfmObjectIdentifier),
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
                measure: toObjRef(filter.rankingFilter.measures[0] as AfmObjectIdentifier),
                operator: filter.rankingFilter.operator,
                value: filter.rankingFilter.value,
            },
        };
    } else {
        throw new Error(`Unknown Tiger filter type`);
    }
};

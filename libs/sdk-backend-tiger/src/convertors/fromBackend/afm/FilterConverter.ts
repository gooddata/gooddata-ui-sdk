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
} from "@gooddata/api-client-tiger";
import { IFilter, ObjRefInScope } from "@gooddata/sdk-model";
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
    if (isPositiveAttributeFilter(filter) && isAfmObjectIdentifier(filter.positiveAttributeFilter.label)) {
        return {
            positiveAttributeFilter: {
                /**
                 * We expect that only identifier is used in the filter definition and not localIdentifier.
                 * Once we support attribute slicing in alerts, we will need to find the possible localIdentifier
                 * in AFM definition and get filter identifier.
                 */
                displayForm: toObjRef(filter.positiveAttributeFilter.label),
                in: filter.positiveAttributeFilter.in,
            },
        };
    } else if (
        isNegativeAttributeFilter(filter) &&
        isAfmObjectIdentifier(filter.negativeAttributeFilter.label)
    ) {
        return {
            negativeAttributeFilter: {
                /**
                 * We expect that only identifier is used in the filter definition and not localIdentifier.
                 * Once we support attribute slicing in alerts, we will need to find the possible localIdentifier
                 * in AFM definition and get filter identifier.
                 */
                displayForm: toObjRef(filter.negativeAttributeFilter.label),
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
        const measure = filter.comparisonMeasureValueFilter.measure;
        return {
            measureValueFilter: {
                measure: isAfmObjectIdentifier(measure) ? toObjRef(measure) : measure,
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
                operator: filter.rankingFilter.operator,
                value: filter.rankingFilter.value,
            },
        };
    } else {
        throw new Error(`Unknown Tiger filter type`);
    }
};

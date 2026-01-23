// (C) 2024-2026 GoodData Corporation

import {
    type AbsoluteDateFilter,
    type BoundedFilter,
    type ComparisonMeasureValueFilter,
    type CompoundMeasureValueFilter,
    type FilterDefinition,
    type MeasureValueCondition,
    type NegativeAttributeFilter,
    type PositiveAttributeFilter,
    type RangeMeasureValueFilter,
    type RankingFilter,
    type RelativeDateFilter,
    isAfmObjectIdentifier,
    isAfmObjectLocalIdentifier,
} from "@gooddata/api-client-tiger";
import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type ComparisonConditionOperator,
    type IFilter,
    type ILowerBoundedFilter,
    type IUpperBoundedFilter,
    type MeasureValueFilterCondition,
    type ObjRefInScope,
    type RangeConditionOperator,
} from "@gooddata/sdk-model";

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

const isCompoundMeasureValueFilter = (filter: unknown): filter is CompoundMeasureValueFilter => {
    return (filter as CompoundMeasureValueFilter).compoundMeasureValueFilter !== undefined;
};

const isRankingFilter = (filter: unknown): filter is RankingFilter => {
    return (filter as RankingFilter).rankingFilter !== undefined;
};

function convertTigerDimensionalityToSdk(dimensionality: unknown[] | undefined): ObjRefInScope[] | undefined {
    const converted = dimensionality
        ?.map((d) => {
            if (isAfmObjectIdentifier(d)) {
                return toObjRef(d);
            }
            if (isAfmObjectLocalIdentifier(d)) {
                return toLocalRef(d);
            }
            return undefined;
        })
        .filter((d): d is ObjRefInScope => d !== undefined);

    return converted?.length ? converted : undefined;
}

function convertTigerMeasureValueConditionsToSdk(
    conditions: MeasureValueCondition[],
    treatNullValuesAs: number | undefined,
): MeasureValueFilterCondition[] {
    type TigerComparisonCondition = { comparison: { operator: unknown; value: number } };
    type TigerRangeCondition = { range: { operator: unknown; from: number; to: number } };

    return conditions.map((c): MeasureValueFilterCondition => {
        if ("comparison" in (c as any)) {
            const { operator, value } = (c as TigerComparisonCondition).comparison;
            return {
                comparison: {
                    operator: operator as ComparisonConditionOperator,
                    value,
                    ...(treatNullValuesAs === undefined ? {} : { treatNullValuesAs }),
                },
            };
        }

        const { operator, from, to } = (c as TigerRangeCondition).range;
        return {
            range: {
                operator: operator as RangeConditionOperator,
                from,
                to,
                ...(treatNullValuesAs === undefined ? {} : { treatNullValuesAs }),
            },
        };
    });
}

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

            if (!(boundedFrom === null || boundedFrom === undefined)) {
                boundedFilter = {
                    from: boundedFrom,
                    granularity: toSdkGranularity(filter.relativeDateFilter.boundedFilter.granularity),
                };
            } else if (boundedTo === null || boundedTo === undefined) {
                throw new NotSupported("Invalid bounded filter: must have one of the bounds.");
            } else {
                boundedFilter = {
                    to: boundedTo,
                    granularity: toSdkGranularity(filter.relativeDateFilter.boundedFilter.granularity),
                };
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
    } else if (isCompoundMeasureValueFilter(filter)) {
        const { measure, localIdentifier, conditions, treatNullValuesAs, dimensionality } =
            filter.compoundMeasureValueFilter;
        const sdkDimensionality = convertTigerDimensionalityToSdk(dimensionality);

        return {
            measureValueFilter: {
                measure: isAfmObjectIdentifier(measure) ? toObjRef(measure) : measure,
                localIdentifier,
                ...(sdkDimensionality ? { dimensionality: sdkDimensionality } : {}),
                conditions: convertTigerMeasureValueConditionsToSdk(conditions, treatNullValuesAs),
            },
        };
    } else if (isComparisonMeasureValueFilter(filter)) {
        const { measure, localIdentifier, operator, value, treatNullValuesAs, dimensionality } =
            filter.comparisonMeasureValueFilter;
        const sdkDimensionality = convertTigerDimensionalityToSdk(dimensionality);
        return {
            measureValueFilter: {
                measure: isAfmObjectIdentifier(measure) ? toObjRef(measure) : measure,
                localIdentifier,
                ...(sdkDimensionality ? { dimensionality: sdkDimensionality } : {}),
                condition: {
                    comparison: {
                        operator,
                        value,
                        treatNullValuesAs,
                    },
                },
            },
        };
    } else if (isRangeMeasureValueFilter(filter)) {
        const { measure, localIdentifier, operator, from, to, treatNullValuesAs, dimensionality } =
            filter.rangeMeasureValueFilter;
        const sdkDimensionality = convertTigerDimensionalityToSdk(dimensionality);
        return {
            measureValueFilter: {
                measure: isAfmObjectIdentifier(measure) ? toObjRef(measure) : measure,
                localIdentifier,
                ...(sdkDimensionality ? { dimensionality: sdkDimensionality } : {}),
                condition: {
                    range: {
                        operator,
                        from,
                        to,
                        treatNullValuesAs,
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

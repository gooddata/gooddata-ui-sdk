// (C) 2026 GoodData Corporation

import {
    type ITigerComparisonConditionInCompound,
    type ITigerCompoundCondition,
    type ITigerFilter,
    type ITigerMeasureValueFilterCondition,
    type ITigerRangeConditionInCompound,
} from "@gooddata/api-client-tiger";
import {
    type IComparisonCondition,
    type IFilter,
    type IRangeCondition,
    type MeasureValueFilterCondition,
    type ObjRef,
    isMeasureValueFilter,
} from "@gooddata/sdk-model";

function isComparisonCondition(condition: unknown) {
    return typeof condition === "object" && condition !== null && "comparison" in condition;
}

function isRangeCondition(condition: unknown) {
    return typeof condition === "object" && condition !== null && "range" in condition;
}

function isCompoundCondition(condition: unknown) {
    return typeof condition === "object" && condition !== null && "compound" in condition;
}

function getTreatNullValuesAsFirstDefined(conditions: MeasureValueFilterCondition[]): number | undefined {
    for (const c of conditions) {
        if (isComparisonCondition(c) && c.comparison.treatNullValuesAs !== undefined) {
            return c.comparison.treatNullValuesAs;
        }
        if (isRangeCondition(c) && c.range.treatNullValuesAs !== undefined) {
            return c.range.treatNullValuesAs;
        }
    }
    return undefined;
}

function stripTreatNullValuesAsFromCondition(
    condition: MeasureValueFilterCondition,
): ITigerComparisonConditionInCompound | ITigerRangeConditionInCompound {
    if (isComparisonCondition(condition)) {
        return {
            comparison: {
                operator: condition.comparison.operator,
                value: condition.comparison.value,
            },
        };
    }

    if (isRangeCondition(condition)) {
        return {
            range: {
                operator: condition.range.operator,
                from: condition.range.from,
                to: condition.range.to,
            },
        };
    }

    throw new Error("Unexpected condition type");
}

function applyTreatNullValuesAsToCondition(
    condition: ITigerComparisonConditionInCompound | ITigerRangeConditionInCompound,
    treatNullValuesAs: number | undefined,
): MeasureValueFilterCondition {
    if (isComparisonCondition(condition)) {
        const { operator, value } = condition.comparison;
        const comparison: IComparisonCondition["comparison"] = {
            operator,
            value,
            ...(treatNullValuesAs === undefined ? {} : { treatNullValuesAs }),
        };
        return { comparison };
    }

    if (isRangeCondition(condition)) {
        const { operator, from, to } = (condition as ITigerRangeConditionInCompound).range;
        const range: IRangeCondition["range"] = {
            operator,
            from,
            to,
            ...(treatNullValuesAs === undefined ? {} : { treatNullValuesAs }),
        };
        return { range };
    }

    throw new Error("Unexpected condition type");
}

/**
 * Converts sdk mvf to Tiger filter shape.
 */
export function convertMeasureValueFilterSdkToTiger(filter: IFilter): ITigerFilter {
    if (!isMeasureValueFilter(filter)) {
        return filter as unknown as ITigerFilter;
    }

    const { conditions, condition, measure, ...measureValueFilter } = filter.measureValueFilter;

    if (conditions && conditions.length > 1) {
        const treatNullValuesAs = getTreatNullValuesAsFirstDefined(conditions);
        const compound: ITigerCompoundCondition["compound"] = {
            conditions: conditions.map(stripTreatNullValuesAsFromCondition),
            ...(treatNullValuesAs === undefined ? {} : { treatNullValuesAs }),
        };

        return {
            measureValueFilter: {
                ...measureValueFilter,
                measure: measure as ObjRef,
                condition: { compound },
            },
        };
    }

    const singleCondition: MeasureValueFilterCondition | undefined = conditions?.[0] ?? condition;

    const tigerCondition: ITigerMeasureValueFilterCondition | undefined = (() => {
        if (!singleCondition) {
            return undefined;
        }

        if (isComparisonCondition(singleCondition)) {
            return {
                comparison: {
                    operator: singleCondition.comparison.operator,
                    value: singleCondition.comparison.value,
                    ...(singleCondition.comparison.treatNullValuesAs === undefined
                        ? {}
                        : { treatNullValuesAs: singleCondition.comparison.treatNullValuesAs }),
                },
            };
        }

        if (isRangeCondition(singleCondition)) {
            return {
                range: {
                    operator: singleCondition.range.operator,
                    from: singleCondition.range.from,
                    to: singleCondition.range.to,
                    ...(singleCondition.range.treatNullValuesAs === undefined
                        ? {}
                        : { treatNullValuesAs: singleCondition.range.treatNullValuesAs }),
                },
            };
        }

        throw new Error("Unsupported measure value filter condition type");
    })();

    return {
        measureValueFilter: {
            ...measureValueFilter,
            measure: measure as ObjRef,
            ...(tigerCondition ? { condition: tigerCondition } : {}),
        },
    };
}

/**
 * Converts Tiger mvf to sdk-model filter shape.
 */
export function convertMeasureValueFilterTigerToSdk(filter: ITigerFilter): IFilter {
    if (!isMeasureValueFilter(filter)) {
        return filter as unknown as IFilter;
    }

    const { condition, ...measureValueFilter } = filter.measureValueFilter;

    if (isCompoundCondition(condition)) {
        const treatNullValuesAs = condition.compound.treatNullValuesAs;
        const conditions: MeasureValueFilterCondition[] = condition.compound.conditions.map((c) =>
            applyTreatNullValuesAsToCondition(c, treatNullValuesAs),
        );

        return {
            measureValueFilter: {
                ...measureValueFilter,
                ...(conditions.length ? { conditions } : {}),
            },
        };
    }

    return {
        measureValueFilter: {
            ...measureValueFilter,
            ...(condition ? { condition: condition as unknown as MeasureValueFilterCondition } : {}),
        },
    };
}

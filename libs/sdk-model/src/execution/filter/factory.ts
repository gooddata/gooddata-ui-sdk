// (C) 2019-2026 GoodData Corporation

import SparkMD5 from "spark-md5";
import { invariant } from "ts-invariant";

import {
    type ComparisonConditionOperator,
    type IAbsoluteDateFilter,
    type IAttributeElements,
    type ILowerBoundedFilter,
    type IMeasureValueFilter,
    type INegativeAttributeFilter,
    type IPositiveAttributeFilter,
    type IRankingFilter,
    type IRelativeDateFilter,
    type IUpperBoundedFilter,
    type MeasureValueFilterCondition,
    type RangeConditionOperator,
    type RankingFilterOperator,
} from "./index.js";
import { type DateAttributeGranularity } from "../../base/dateGranularities.js";
import { idRef, localIdRef } from "../../objRef/factory.js";
import {
    type Identifier,
    type LocalIdRef,
    type ObjRef,
    type ObjRefInScope,
    isObjRef,
    objRefToString,
} from "../../objRef/index.js";
import { sanitizeLocalId } from "../../sanitizeLocalId.js";
import {
    type IAttribute,
    attributeDisplayFormRef,
    attributeLocalId,
    isAttribute,
} from "../attribute/index.js";
import { type IMeasure, isMeasure, measureLocalId } from "../measure/index.js";

export function generateLocalId(prefix: string, objRef: ObjRef, inObject: IAttributeElements): string {
    const hasher = new SparkMD5();
    hasher.append(JSON.stringify(inObject));

    const hash = hasher.end().substr(0, 8);
    return sanitizeLocalId(`${prefix}_${objRefToString(objRef)}_${hash}`);
}

/**
 * Creates a new positive attribute filter.
 *
 * @remarks
 * NOTE: when specifying attribute element using URIs (primary keys), please keep in mind that they MAY NOT be transferable
 * across workspaces. On some backends same element WILL have different URI in each workspace.
 * In general we recommend using URIs only if your code retrieves them at runtime from backend using elements query
 * or from the data view's headers. Hardcoding URIs is never a good idea, if you find yourself doing that,
 * please consider specifying attribute elements by value
 *
 * @param attributeOrRef - either instance of attribute to create filter for or ref or identifier of attribute's display form
 * @param inValues - values to filter for; these can be either specified as AttributeElements object or as an array
 *  of attribute element _values_; if you specify empty array, then the filter will be noop and will be ignored
 * @public
 */
export function newPositiveAttributeFilter(
    attributeOrRef: IAttribute | ObjRef | Identifier,
    inValues: IAttributeElements | (string | null)[],
    localIdentifier?: string,
): IPositiveAttributeFilter {
    const objRef = isObjRef(attributeOrRef)
        ? attributeOrRef
        : typeof attributeOrRef === "string"
          ? idRef(attributeOrRef)
          : attributeDisplayFormRef(attributeOrRef);

    const inObject: IAttributeElements = Array.isArray(inValues) ? { values: inValues } : inValues;

    return {
        positiveAttributeFilter: {
            ...(localIdentifier ? { localIdentifier } : {}),
            displayForm: objRef,
            in: inObject,
        },
    };
}

/**
 * Creates a new negative attribute filter.
 *
 * @remarks
 * NOTE: when specifying attribute element using URIs (primary keys), please keep in mind that they MAY NOT be transferable
 * across workspaces. On some backends same element WILL have different URI in each workspace.
 * In general we recommend using URIs only if your code retrieves them at runtime from backend using elements query
 * or from the data view's headers. Hardcoding URIs is never a good idea, if you find yourself doing that,
 * please consider specifying attribute elements by value
 *
 * @param attributeOrRef - either instance of attribute to create filter for or ref or identifier of attribute's display form
 * @param notInValues - values to filter out; these can be either specified as AttributeElements object or as an array
 *  of attribute element _values_; if you specify empty array, then the filter will be noop and will be ignored
 * @public
 */
export function newNegativeAttributeFilter(
    attributeOrRef: IAttribute | ObjRef | Identifier,
    notInValues: IAttributeElements | string[],
    localIdentifier?: string,
): INegativeAttributeFilter {
    const objRef = isObjRef(attributeOrRef)
        ? attributeOrRef
        : typeof attributeOrRef === "string"
          ? idRef(attributeOrRef)
          : attributeDisplayFormRef(attributeOrRef);

    const notInObject: IAttributeElements = Array.isArray(notInValues)
        ? { values: notInValues }
        : notInValues;

    return {
        negativeAttributeFilter: {
            ...(localIdentifier ? { localIdentifier } : {}),
            displayForm: objRef,
            notIn: notInObject,
        },
    };
}

/**
 * Creates a new absolute date filter.
 *
 * @param dateDataSet - ref or identifier of the date data set to filter on
 * @param from - start of the interval in ISO-8601 calendar date format
 * @param to - end of the interval in ISO-8601 calendar date format
 * @param localIdentifier - filter local identifier
 *
 * @public
 */
export function newAbsoluteDateFilter(
    dateDataSet: ObjRef | Identifier,
    from: string,
    to: string,
    localIdentifier?: string,
): IAbsoluteDateFilter {
    const dataSet = isObjRef(dateDataSet) ? dateDataSet : idRef(dateDataSet);
    return {
        absoluteDateFilter: {
            dataSet,
            from,
            to,
            ...(localIdentifier ? { localIdentifier } : {}),
        },
    };
}

/**
 * Creates a new relative date filter.
 *
 * @param dateDataSet - ref or identifier of the date data set to filter on
 * @param granularity - granularity of the filters (month, year, etc.)
 * @param from - start of the interval – negative numbers mean the past, zero means today, positive numbers mean the future
 * @param to - end of the interval – negative numbers mean the past, zero means today, positive numbers mean the future
 * @param boundedFilter - optional bounded filter to use in the filter
 * @param localIdentifier - filter local identifier
 *
 * See also {@link DateAttributeGranularity} and {@link DateGranularity}
 * @public
 */
export function newRelativeDateFilter(
    dateDataSet: ObjRef | Identifier,
    granularity: DateAttributeGranularity,
    from: number,
    to: number,
    localIdentifier?: string,
    boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter,
): IRelativeDateFilter {
    const dataSet = isObjRef(dateDataSet) ? dateDataSet : idRef(dateDataSet);
    return {
        relativeDateFilter: {
            dataSet,
            granularity,
            from,
            to,
            ...(boundedFilter ? { boundedFilter } : {}),
            ...(localIdentifier ? { localIdentifier } : {}),
        },
    };
}

/**
 * Creates a new all time date filter. This filter is used to indicate that there should be no filtering on the given date data set.
 *
 * @param dateDataSet - ref or identifier of the date data set to filter on
 * @public
 */
export function newAllTimeFilter(
    dateDataSet: ObjRef | Identifier,
    localIdentifier?: string,
): IRelativeDateFilter {
    const dataSet = isObjRef(dateDataSet) ? dateDataSet : idRef(dateDataSet);
    return {
        relativeDateFilter: {
            dataSet,
            granularity: "ALL_TIME_GRANULARITY",
            from: 0,
            to: 0,
            ...(localIdentifier ? { localIdentifier } : {}),
        },
    };
}

function convertMeasureOrRefToObjRefInScope(measureOrRef: IMeasure | ObjRefInScope | string): ObjRefInScope {
    return isMeasure(measureOrRef)
        ? localIdRef(measureLocalId(measureOrRef))
        : typeof measureOrRef === "string"
          ? localIdRef(measureOrRef)
          : measureOrRef;
}

function convertAttributeOrRefToObjRefInScope(
    attributeOrRef: IAttribute | ObjRefInScope | string,
): ObjRefInScope {
    return isAttribute(attributeOrRef)
        ? localIdRef(attributeLocalId(attributeOrRef))
        : typeof attributeOrRef === "string"
          ? localIdRef(attributeOrRef)
          : attributeOrRef;
}

/**
 * Creates a new measure value filter.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param operator - comparison or range operator to use in the filter
 * @param value - the value to compare to
 * @param treatNullValuesAs - value to use instead of null values
 * @public
 */
export function newMeasureValueFilter(
    measureOrRef: IMeasure | ObjRefInScope | string,
    operator: ComparisonConditionOperator,
    value: number,
    treatNullValuesAs?: number,
): IMeasureValueFilter;

/**
 * Creates a new measure value filter.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param operator - range operator to use in the filter
 * @param from - the start of the range
 * @param to - the end of the range
 * @param treatNullValuesAs - value to use instead of null values
 * @public
 */
export function newMeasureValueFilter(
    measureOrRef: IMeasure | ObjRefInScope | LocalIdRef | string,
    operator: RangeConditionOperator,
    from: number,
    to: number,
    treatNullValuesAs?: number,
): IMeasureValueFilter;

/**
 * Creates a new measure value filter.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param operator - comparison or range operator to use in the filter
 * @param val1 - first numeric value, used as value in comparison or as 'from' value in range operators
 * @param val2OrTreatNullValuesAsInComparison - second numeric value, required in range operators and used in 'to' value; optional in comparison operators used as 'treatNullValuesAs' value
 * @param treatNullValuesAsInRange - third numeric value, optional in range operators and used as 'treatNullValuesAs' value; optional and ignored in comparison operators
 * @public
 */
export function newMeasureValueFilter(
    measureOrRef: IMeasure | ObjRefInScope | string,
    operator: ComparisonConditionOperator | RangeConditionOperator,
    val1: number,
    val2OrTreatNullValuesAsInComparison?: number,
    treatNullValuesAsInRange?: number,
): IMeasureValueFilter {
    const ref = convertMeasureOrRefToObjRefInScope(measureOrRef);

    if (operator === "BETWEEN" || operator === "NOT_BETWEEN") {
        invariant(
            val2OrTreatNullValuesAsInComparison !== undefined,
            "measure value filter with range operator requires two numeric values",
        );

        const nullValuesProp =
            treatNullValuesAsInRange === null || treatNullValuesAsInRange === undefined
                ? {}
                : { treatNullValuesAs: treatNullValuesAsInRange };

        return {
            measureValueFilter: {
                measure: ref,
                condition: {
                    range: {
                        operator,
                        from: val1,
                        to: val2OrTreatNullValuesAsInComparison,
                        ...nullValuesProp,
                    },
                },
            },
        };
    } else {
        const nullValuesProp =
            val2OrTreatNullValuesAsInComparison === null || val2OrTreatNullValuesAsInComparison === undefined
                ? {}
                : { treatNullValuesAs: val2OrTreatNullValuesAsInComparison };

        return {
            measureValueFilter: {
                measure: ref,
                condition: {
                    comparison: {
                        operator,
                        value: val1,
                        ...nullValuesProp,
                    },
                },
            },
        };
    }
}

/**
 * Options for creating a measure value filter with comparison condition.
 *
 * @public
 */
export interface IMeasureValueFilterComparisonOptions {
    /**
     * Comparison operator to use in the filter
     */
    operator: ComparisonConditionOperator;
    /**
     * The value to compare to
     */
    value: number;
    /**
     * Optional value to use instead of null values
     */
    treatNullValuesAs?: number;
    /**
     * Optional array of attributes to define the dimensionality for the filter.
     * If instance of attribute is provided, it will be referenced by its local identifier.
     */
    dimensionality?: Array<IAttribute | ObjRefInScope | string>;
}

/**
 * Options for creating a measure value filter with range condition.
 *
 * @public
 */
export interface IMeasureValueFilterRangeOptions {
    /**
     * Range operator to use in the filter
     */
    operator: RangeConditionOperator;
    /**
     * The start of the range
     */
    from: number;
    /**
     * The end of the range
     */
    to: number;
    /**
     * Optional value to use instead of null values
     */
    treatNullValuesAs?: number;
    /**
     * Optional array of attributes to define the dimensionality for the filter.
     * If instance of attribute is provided, it will be referenced by its local identifier.
     */
    dimensionality?: Array<IAttribute | ObjRefInScope | string>;
}

/**
 * Options for creating a measure value filter with ALL operator.
 *
 * @public
 */
export interface IMeasureValueFilterAllOptions {
    operator: "ALL";
    /**
     * Optional array of attributes to define the dimensionality for the filter.
     * If instance of attribute is provided, it will be referenced by its local identifier.
     */
    dimensionality?: Array<IAttribute | ObjRefInScope | string>;
}

/**
 * Condition for comparison operator.
 *
 * @public
 */
export interface IOptionsComparisonCondition {
    operator: ComparisonConditionOperator;
    value: number;
}
/**
 * Condition for range operator.
 *
 * @public
 */
export interface IOptionsRangeCondition {
    operator: RangeConditionOperator;
    from: number;
    to: number;
}

/**
 * Condition for ALL operator.
 *
 * @public
 */
export interface IOptionsAllCondition {
    operator: "ALL";
}

/**
 * Condition for measure value filter.
 *
 * @public
 */
export type OptionsCondition = IOptionsComparisonCondition | IOptionsRangeCondition | IOptionsAllCondition;

/**
 * Options for creating a measure value filter with multiple conditions.
 *
 * @public
 */
export interface IMeasureValueFilterConditionsOptions {
    conditions: OptionsCondition[];
    /**
     * Optional value to use instead of null values
     */
    treatNullValuesAs?: number;
    /**
     * Optional array of attributes to define the dimensionality for the filter.
     * If instance of attribute is provided, it will be referenced by its local identifier.
     */
    dimensionality?: Array<IAttribute | ObjRefInScope | string>;
}

/**
 * Options for creating a measure value filter.
 *
 * @public
 */
export type IMeasureValueFilterOptions =
    | IMeasureValueFilterComparisonOptions
    | IMeasureValueFilterRangeOptions
    | IMeasureValueFilterAllOptions
    | IMeasureValueFilterConditionsOptions;

function getOperator(
    options: IMeasureValueFilterOptions,
): ComparisonConditionOperator | RangeConditionOperator | "ALL" {
    if (isMultipleConditionsOptions(options)) {
        return options.conditions[0]?.operator;
    } else {
        return options.operator;
    }
}

function isMultipleConditionsOptions(
    options: IMeasureValueFilterOptions,
): options is IMeasureValueFilterConditionsOptions {
    return options && "conditions" in options && Array.isArray(options.conditions);
}

function isAllOptions(options: IMeasureValueFilterOptions): options is IMeasureValueFilterAllOptions {
    if (isMultipleConditionsOptions(options)) {
        return false;
    } else {
        return getOperator(options) === "ALL";
    }
}

function isComparisonCondition(condition: OptionsCondition): condition is IOptionsComparisonCondition {
    return (
        condition.operator === "GREATER_THAN" ||
        condition.operator === "GREATER_THAN_OR_EQUAL_TO" ||
        condition.operator === "LESS_THAN" ||
        condition.operator === "LESS_THAN_OR_EQUAL_TO" ||
        condition.operator === "EQUAL_TO" ||
        condition.operator === "NOT_EQUAL_TO"
    );
}

function isComparisonOptions(
    options: IMeasureValueFilterOptions,
): options is IMeasureValueFilterComparisonOptions {
    if (isMultipleConditionsOptions(options)) {
        return false;
    } else {
        const operator = getOperator(options);
        return (
            operator === "GREATER_THAN" ||
            operator === "GREATER_THAN_OR_EQUAL_TO" ||
            operator === "LESS_THAN" ||
            operator === "LESS_THAN_OR_EQUAL_TO" ||
            operator === "EQUAL_TO" ||
            operator === "NOT_EQUAL_TO"
        );
    }
}

function isRangeCondition(condition: OptionsCondition): condition is IOptionsRangeCondition {
    return condition.operator === "BETWEEN" || condition.operator === "NOT_BETWEEN";
}

function isRangeOptions(options: IMeasureValueFilterOptions): options is IMeasureValueFilterRangeOptions {
    if (isMultipleConditionsOptions(options)) {
        return false;
    } else {
        const operator = getOperator(options);
        return operator === "BETWEEN" || operator === "NOT_BETWEEN";
    }
}

function getTreatNullValuesAsProp(options: IMeasureValueFilterOptions): Record<string, number> {
    if (isAllOptions(options)) {
        return {};
    }
    return options.treatNullValuesAs === null || options.treatNullValuesAs === undefined
        ? {}
        : { treatNullValuesAs: options.treatNullValuesAs };
}

/**
 * Creates a new measure value filter with options object.
 *
 * @remarks
 * This factory function provides a cleaner API for creating measure value filters
 * with optional dimensionality support.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param options - options object containing operator, value(s), and optional dimensionality
 * @public
 */
export function newMeasureValueFilterWithOptions(
    measureOrRef: IMeasure | ObjRefInScope | string,
    options: IMeasureValueFilterOptions,
): IMeasureValueFilter {
    const measureRef = convertMeasureOrRefToObjRefInScope(measureOrRef);
    const dimensionalityRefs = options.dimensionality?.map(convertAttributeOrRefToObjRefInScope);
    const dimensionalityProp =
        dimensionalityRefs && dimensionalityRefs.length > 0 ? { dimensionality: dimensionalityRefs } : {};

    if (isRangeOptions(options)) {
        return {
            measureValueFilter: {
                measure: measureRef,
                ...dimensionalityProp,
                condition: {
                    range: {
                        operator: options.operator,
                        from: options.from,
                        to: options.to,
                        ...getTreatNullValuesAsProp(options),
                    },
                },
            },
        };
    } else if (isComparisonOptions(options)) {
        return {
            measureValueFilter: {
                measure: measureRef,
                ...dimensionalityProp,
                condition: {
                    comparison: {
                        operator: options.operator,
                        value: options.value,
                        ...getTreatNullValuesAsProp(options),
                    },
                },
            },
        };
    } else if (isAllOptions(options)) {
        return {
            measureValueFilter: {
                measure: measureRef,
                ...dimensionalityProp,
            },
        };
    } else {
        if (options.conditions.length === 1) {
            const condition = options.conditions[0];
            if (isRangeCondition(condition)) {
                return {
                    measureValueFilter: {
                        measure: measureRef,
                        ...dimensionalityProp,
                        condition: {
                            range: {
                                operator: condition.operator,
                                from: condition.from,
                                to: condition.to,
                                ...getTreatNullValuesAsProp(options),
                            },
                        },
                    },
                };
            } else if (isComparisonCondition(condition)) {
                return newMeasureValueFilterWithOptions(measureOrRef, {
                    operator: condition.operator,
                    value: condition.value,
                    ...getTreatNullValuesAsProp(options),
                    ...dimensionalityProp,
                });
            } else {
                return {
                    measureValueFilter: {
                        measure: measureRef,
                        ...dimensionalityProp,
                    },
                };
            }
        }
        const conditions = options.conditions.reduce((acc: MeasureValueFilterCondition[], condition) => {
            if (isComparisonCondition(condition)) {
                return [
                    ...acc,
                    {
                        comparison: {
                            operator: condition.operator,
                            value: condition.value,
                            ...getTreatNullValuesAsProp(options),
                        },
                    },
                ];
            }
            if (isRangeCondition(condition)) {
                return [
                    ...acc,
                    {
                        range: {
                            operator: condition.operator,
                            from: condition.from,
                            to: condition.to,
                            ...getTreatNullValuesAsProp(options),
                        },
                    },
                ];
            }
            return acc;
        }, []);
        const conditionsProp = conditions.length ? { conditions } : {};
        return {
            measureValueFilter: {
                measure: measureRef,
                ...dimensionalityProp,
                ...conditionsProp,
            },
        };
    }
}

/**
 * Creates a new ranking filter.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param operator - TOP or BOTTOM operator to use in the filter
 * @param value - Number of values to use in filter
 * @param attributesOrRefs - Array of attributes used in filter, or reference of the attribute object. If instance of attribute is
 *   provided, then it is assumed this attribute is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @public
 */
export function newRankingFilter(
    measureOrRef: IMeasure | ObjRefInScope | string,
    attributesOrRefs: Array<IAttribute | ObjRefInScope | string>,
    operator: RankingFilterOperator,
    value: number,
): IRankingFilter;

/**
 * Creates a new ranking filter.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param operator - TOP or BOTTOM operator to use in the filter
 * @param value - Number of values to use in filter
 * @public
 */
export function newRankingFilter(
    measureOrRef: IMeasure | ObjRefInScope | string,
    operator: RankingFilterOperator,
    value: number,
): IRankingFilter;

/**
 * Creates a new ranking filter.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param attributesOrRefsOrOperator - Array of attributes used in filter, or reference of the attribute object. If instance of attribute is
 *   provided, then it is assumed this attribute is in scope of execution and will be referenced by the filter by
 *   its local identifier. If attributes are not specified it's TOP or BOTTOM operator to use in the filter
 * @param operatorOrValue - Number of values to use in filter or operator if attributes are not speciied
 * @param valueOrNothing - Value or nothing if attributes are not specified
 * @public
 */
export function newRankingFilter(
    measureOrRef: IMeasure | ObjRefInScope | string,
    attributesOrRefsOrOperator: Array<IAttribute | ObjRefInScope | string> | RankingFilterOperator,
    operatorOrValue: RankingFilterOperator | number,
    valueOrNothing?: number,
): IRankingFilter {
    if (typeof attributesOrRefsOrOperator === "string" && typeof operatorOrValue === "number") {
        const measureRef = convertMeasureOrRefToObjRefInScope(measureOrRef);
        return {
            rankingFilter: {
                measure: measureRef,
                operator: attributesOrRefsOrOperator,
                value: operatorOrValue,
            },
        };
    } else if (typeof operatorOrValue === "string" && valueOrNothing) {
        const measureRef = convertMeasureOrRefToObjRefInScope(measureOrRef);
        const attributeRefs = (attributesOrRefsOrOperator as Array<IAttribute | ObjRefInScope | string>).map(
            convertAttributeOrRefToObjRefInScope,
        );
        const attributesProp = attributeRefs.length ? { attributes: attributeRefs } : {};
        return {
            rankingFilter: {
                measure: measureRef,
                operator: operatorOrValue,
                value: valueOrNothing,
                ...attributesProp,
            },
        };
    }

    throw new Error("Ranking filter requires measure, operator and value");
}

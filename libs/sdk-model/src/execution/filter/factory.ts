// (C) 2019-2025 GoodData Corporation

import SparkMD5 from "spark-md5";
import { invariant } from "ts-invariant";

import {
    ComparisonConditionOperator,
    IAbsoluteDateFilter,
    IAttributeElements,
    ILowerBoundedFilter,
    IMeasureValueFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRankingFilter,
    IRelativeDateFilter,
    IUpperBoundedFilter,
    RangeConditionOperator,
    RankingFilterOperator,
} from "./index.js";
import { DateAttributeGranularity } from "../../base/dateGranularities.js";
import { idRef, localIdRef } from "../../objRef/factory.js";
import {
    Identifier,
    LocalIdRef,
    ObjRef,
    ObjRefInScope,
    isObjRef,
    objRefToString,
} from "../../objRef/index.js";
import { sanitizeLocalId } from "../../sanitizeLocalId.js";
import { IAttribute, attributeDisplayFormRef, attributeLocalId, isAttribute } from "../attribute/index.js";
import { IMeasure, isMeasure, measureLocalId } from "../measure/index.js";

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
    inValues: IAttributeElements | string[],
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
                        to: val2OrTreatNullValuesAsInComparison!,
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
 * Options for creating a measure value filter.
 *
 * @public
 */
export type IMeasureValueFilterOptions =
    | IMeasureValueFilterComparisonOptions
    | IMeasureValueFilterRangeOptions;

function isRangeOptions(options: IMeasureValueFilterOptions): options is IMeasureValueFilterRangeOptions {
    return options.operator === "BETWEEN" || options.operator === "NOT_BETWEEN";
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
    const nullValuesProp =
        options.treatNullValuesAs === null || options.treatNullValuesAs === undefined
            ? {}
            : { treatNullValuesAs: options.treatNullValuesAs };

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
                        ...nullValuesProp,
                    },
                },
            },
        };
    } else {
        return {
            measureValueFilter: {
                measure: measureRef,
                ...dimensionalityProp,
                condition: {
                    comparison: {
                        operator: options.operator,
                        value: options.value,
                        ...nullValuesProp,
                    },
                },
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

// (C) 2019-2022 GoodData Corporation
import { invariant } from "ts-invariant";
import isNil from "lodash/isNil.js";
import {
    ComparisonConditionOperator,
    IAbsoluteDateFilter,
    IAttributeElements,
    IMeasureValueFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRelativeDateFilter,
    RangeConditionOperator,
    IRankingFilter,
    RankingFilterOperator,
} from "./index.js";
import { attributeDisplayFormRef, IAttribute, isAttribute, attributeLocalId } from "../attribute/index.js";
import { Identifier, isObjRef, LocalIdRef, ObjRef, ObjRefInScope } from "../../objRef/index.js";
import { IMeasure, isMeasure, measureLocalId } from "../measure/index.js";
import { idRef, localIdRef } from "../../objRef/factory.js";
import { DateAttributeGranularity } from "../../base/dateGranularities.js";

/**
 * Creates a new positive attribute filter.
 *
 * @remarks
 * NOTE: when specifying attribute element using URIs (primary keys), please keep in mind that they MAY NOT be transferable
 * across workspaces. On some backends (such as bear) same element WILL have different URI in each workspace.
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
): IPositiveAttributeFilter {
    const objRef = isObjRef(attributeOrRef)
        ? attributeOrRef
        : typeof attributeOrRef === "string"
        ? idRef(attributeOrRef)
        : attributeDisplayFormRef(attributeOrRef);

    const inObject: IAttributeElements = Array.isArray(inValues) ? { values: inValues } : inValues;

    return {
        positiveAttributeFilter: {
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
 * across workspaces. On some backends (such as bear) same element WILL have different URI in each workspace.
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
 * @public
 */
export function newAbsoluteDateFilter(
    dateDataSet: ObjRef | Identifier,
    from: string,
    to: string,
): IAbsoluteDateFilter {
    const dataSet = isObjRef(dateDataSet) ? dateDataSet : idRef(dateDataSet);
    return {
        absoluteDateFilter: {
            dataSet,
            from,
            to,
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
 *
 * See also {@link DateAttributeGranularity} and {@link DateGranularity}
 * @public
 */
export function newRelativeDateFilter(
    dateDataSet: ObjRef | Identifier,
    granularity: DateAttributeGranularity,
    from: number,
    to: number,
): IRelativeDateFilter {
    const dataSet = isObjRef(dateDataSet) ? dateDataSet : idRef(dateDataSet);
    return {
        relativeDateFilter: {
            dataSet,
            granularity,
            from,
            to,
        },
    };
}

/**
 * Creates a new all time date filter. This filter is used to indicate that there should be no filtering on the given date data set.
 *
 * @param dateDataSet - ref or identifier of the date data set to filter on
 * @public
 */
export function newAllTimeFilter(dateDataSet: ObjRef | Identifier): IRelativeDateFilter {
    const dataSet = isObjRef(dateDataSet) ? dateDataSet : idRef(dateDataSet);
    return {
        relativeDateFilter: {
            dataSet,
            granularity: "ALL_TIME_GRANULARITY",
            from: 0,
            to: 0,
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

        const nullValuesProp = !isNil(treatNullValuesAsInRange)
            ? { treatNullValuesAs: treatNullValuesAsInRange }
            : {};

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
        const nullValuesProp = !isNil(val2OrTreatNullValuesAsInComparison)
            ? { treatNullValuesAs: val2OrTreatNullValuesAsInComparison }
            : {};

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

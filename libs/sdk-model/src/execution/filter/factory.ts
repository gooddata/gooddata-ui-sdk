// (C) 2019-2020 GoodData Corporation
import invariant from "ts-invariant";
import {
    AttributeElements,
    ComparisonConditionOperator,
    IAbsoluteDateFilter,
    IMeasureValueFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRelativeDateFilter,
    RangeConditionOperator,
} from "./index";
import { IAttribute, attributeAttributeDisplayFormObjRef } from "../attribute";
import { ObjRefInScope, ObjRef, isObjRef, Identifier } from "../base";
import { IMeasure, isMeasure, measureLocalId } from "../measure";
import { idRef } from "../base/factory";

/**
 * Creates a new positive attribute filter.
 *
 * @param attributeOrRef - either instance of attribute to create filter for or ref or identifier of attribute's display form
 * @param inValues - values to filter for; these can be either specified as AttributeElements object or as an array
 *  of attribute element _values_
 * @public
 */
export function newPositiveAttributeFilter(
    attributeOrRef: IAttribute | ObjRef | Identifier,
    inValues: AttributeElements | string[],
): IPositiveAttributeFilter {
    const objRef = isObjRef(attributeOrRef)
        ? attributeOrRef
        : typeof attributeOrRef === "string"
        ? idRef(attributeOrRef)
        : attributeAttributeDisplayFormObjRef(attributeOrRef);

    const inObject: AttributeElements = Array.isArray(inValues) ? { values: inValues } : inValues;

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
 * @param attributeOrRef - either instance of attribute to create filter for or ref or identifier of attribute's display form
 * @param notInValues - values to filter out; these can be either specified as AttributeElements object or as an array
 *  of attribute element _values_
 * @public
 */
export function newNegativeAttributeFilter(
    attributeOrRef: IAttribute | ObjRef | Identifier,
    notInValues: AttributeElements | string[],
): INegativeAttributeFilter {
    const objRef = isObjRef(attributeOrRef)
        ? attributeOrRef
        : typeof attributeOrRef === "string"
        ? idRef(attributeOrRef)
        : attributeAttributeDisplayFormObjRef(attributeOrRef);

    const notInObject: AttributeElements = Array.isArray(notInValues) ? { values: notInValues } : notInValues;

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
 * @public
 */
export function newRelativeDateFilter(
    dateDataSet: ObjRef | Identifier,
    granularity: string,
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
 * Creates a new measure value filter.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param operator - comparison or range operator to use in the filter
 * @param val1 - first numeric value, used as value in comparison or as 'from' value in range operators
 * @param val2 - second numeric value, required in range operators and used in 'to' value; optional and ignored with comparison operators
 * @public
 */
export function newMeasureValueFilter(
    measureOrRef: IMeasure | ObjRefInScope,
    operator: ComparisonConditionOperator | RangeConditionOperator,
    val1: number,
    val2?: number,
): IMeasureValueFilter {
    const ref: ObjRefInScope = isMeasure(measureOrRef)
        ? { localIdentifier: measureLocalId(measureOrRef) }
        : measureOrRef;

    if (operator === "BETWEEN" || operator === "NOT_BETWEEN") {
        invariant(val2, "measure value filter with range operator requires two numeric values");

        return {
            measureValueFilter: {
                measure: ref,
                condition: {
                    range: {
                        operator,
                        from: val1,
                        to: val2!,
                    },
                },
            },
        };
    } else {
        return {
            measureValueFilter: {
                measure: ref,
                condition: {
                    comparison: {
                        operator,
                        value: val1,
                    },
                },
            },
        };
    }
}

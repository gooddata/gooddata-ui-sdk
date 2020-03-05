// (C) 2007-2020 GoodData Corporation
import { GdcExecuteAFM } from "@gooddata/gd-bear-model";
import {
    filterIsEmpty,
    IAbsoluteDateFilter,
    IAttributeFilter,
    IFilter,
    IMeasureFilter,
    IMeasureValueFilter,
    IRelativeDateFilter,
    isAbsoluteDateFilter,
    isAttributeFilter,
    isComparisonCondition,
    isMeasureValueFilter,
    isPositiveAttributeFilter,
    MeasureValueFilterCondition,
} from "@gooddata/sdk-model";
import { toBearRef, toScopedBearRef } from "../utils/ObjRefConverter";

function convertAttributeFilter(filter: IAttributeFilter): GdcExecuteAFM.FilterItem | null {
    if (!isPositiveAttributeFilter(filter)) {
        if (filterIsEmpty(filter)) {
            return null;
        }

        return {
            negativeAttributeFilter: {
                displayForm: toBearRef(filter.negativeAttributeFilter.displayForm),
                notIn: filter.negativeAttributeFilter.notIn,
            },
        };
    }

    return {
        positiveAttributeFilter: {
            displayForm: toBearRef(filter.positiveAttributeFilter.displayForm),
            in: filter.positiveAttributeFilter.in,
        },
    };
}

export function convertAbsoluteDateFilter(filter: IAbsoluteDateFilter): GdcExecuteAFM.FilterItem | null {
    const { absoluteDateFilter } = filter;

    if (absoluteDateFilter.from === undefined || absoluteDateFilter.to === undefined) {
        return null;
    }

    return {
        absoluteDateFilter: {
            dataSet: toBearRef(absoluteDateFilter.dataSet),
            from: String(absoluteDateFilter.from),
            to: String(absoluteDateFilter.to),
        },
    };
}

export function convertRelativeDateFilter(filter: IRelativeDateFilter): GdcExecuteAFM.FilterItem | null {
    const { relativeDateFilter } = filter;

    if (relativeDateFilter.from === undefined || !relativeDateFilter.to === undefined) {
        return null;
    }

    return {
        relativeDateFilter: {
            dataSet: toBearRef(relativeDateFilter.dataSet),
            granularity: relativeDateFilter.granularity,
            from: Number(relativeDateFilter.from),
            to: Number(relativeDateFilter.to),
        },
    };
}

// Bear supports up to 6 decimal places
const MAX_DECIMAL_PLACES = 6;

function trimNumberToSupportedPrecision(num: number): number {
    return parseFloat(num.toFixed(MAX_DECIMAL_PLACES));
}

function trimConditionToSupportedPrecision(
    condition: MeasureValueFilterCondition,
): MeasureValueFilterCondition {
    if (isComparisonCondition(condition)) {
        return {
            comparison: {
                operator: condition.comparison.operator,
                value: trimNumberToSupportedPrecision(condition.comparison.value),
            },
        };
    } else {
        return {
            range: {
                operator: condition.range.operator,
                from: trimNumberToSupportedPrecision(condition.range.from),
                to: trimNumberToSupportedPrecision(condition.range.to),
            },
        };
    }
}

export function convertMeasureValueFilter(
    filter: IMeasureValueFilter,
): GdcExecuteAFM.IMeasureValueFilter | null {
    if (filter.measureValueFilter.condition === undefined) {
        return null;
    }

    return {
        measureValueFilter: {
            measure: toScopedBearRef(filter.measureValueFilter.measure),
            condition: trimConditionToSupportedPrecision(filter.measureValueFilter.condition),
        },
    };
}

export function convertFilter(filter: IFilter): GdcExecuteAFM.ExtendedFilter | null {
    if (isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    }

    return convertMeasureFilter(filter);
}

export function convertMeasureFilter(filter: IMeasureFilter): GdcExecuteAFM.FilterItem | null {
    if (isAttributeFilter(filter)) {
        return convertAttributeFilter(filter);
    } else if (isAbsoluteDateFilter(filter)) {
        return convertAbsoluteDateFilter(filter);
    } else {
        return convertRelativeDateFilter(filter);
    }
}

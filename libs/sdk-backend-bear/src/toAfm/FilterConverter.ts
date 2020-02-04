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
    isMeasureValueFilter,
    isPositiveAttributeFilter,
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

export function convertMeasureValueFilter(
    filter: IMeasureValueFilter,
): GdcExecuteAFM.IMeasureValueFilter | null {
    if (filter.measureValueFilter.condition === undefined) {
        return null;
    }

    return {
        measureValueFilter: {
            measure: toScopedBearRef(filter.measureValueFilter.measure),
            condition: filter.measureValueFilter.condition,
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

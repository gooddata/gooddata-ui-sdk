// (C) 2007-2019 GoodData Corporation
import { ExecuteAFM } from "@gooddata/typings";
import {
    IAbsoluteDateFilter,
    IAttributeFilter,
    IFilter,
    IRelativeDateFilter,
    isAbsoluteDateFilter,
    isAttributeFilter,
    isPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { filterIsEmpty } from "@gooddata/sdk-model/src";

function convertAttributeFilter(filter: IAttributeFilter): ExecuteAFM.FilterItem | null {
    if (!isPositiveAttributeFilter(filter)) {
        if (filterIsEmpty(filter)) {
            return null;
        }
    }
    return filter;
}

export function convertAbsoluteDateFilter(filter: IAbsoluteDateFilter): ExecuteAFM.FilterItem | null {
    const { absoluteDateFilter } = filter;

    if (absoluteDateFilter.from === undefined || absoluteDateFilter.to === undefined) {
        return null;
    }

    return {
        absoluteDateFilter: {
            dataSet: absoluteDateFilter.dataSet,
            from: String(absoluteDateFilter.from),
            to: String(absoluteDateFilter.to),
        },
    };
}

export function convertRelativeDateFilter(filter: IRelativeDateFilter): ExecuteAFM.FilterItem | null {
    const { relativeDateFilter } = filter;

    if (relativeDateFilter.from === undefined || !relativeDateFilter.to === undefined) {
        return null;
    }

    return {
        relativeDateFilter: {
            dataSet: relativeDateFilter.dataSet,
            granularity: relativeDateFilter.granularity,
            from: Number(relativeDateFilter.from),
            to: Number(relativeDateFilter.to),
        },
    };
}

export function convertVisualizationObjectFilter(filter: IFilter): ExecuteAFM.FilterItem | null {
    if (isAttributeFilter(filter)) {
        return convertAttributeFilter(filter);
    } else if (isAbsoluteDateFilter(filter)) {
        return convertAbsoluteDateFilter(filter);
    } else {
        return convertRelativeDateFilter(filter);
    }
}

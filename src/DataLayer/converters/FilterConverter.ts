// (C) 2007-2019 GoodData Corporation
import { AFM, VisualizationObject } from "@gooddata/typings";
import VisualizationObjectAttributeFilter = VisualizationObject.VisualizationObjectAttributeFilter;
import IVisualizationObjectRelativeDateFilter = VisualizationObject.IVisualizationObjectRelativeDateFilter;
import IVisualizationObjectAbsoluteDateFilter = VisualizationObject.IVisualizationObjectAbsoluteDateFilter;
import VisualizationObjectFilter = VisualizationObject.VisualizationObjectFilter;
import VisualizationObjectExtendedFilter = VisualizationObject.VisualizationObjectExtendedFilter;

function convertAttributeFilter(filter: VisualizationObjectAttributeFilter): AFM.FilterItem | null {
    if (!VisualizationObject.isPositiveAttributeFilter(filter)) {
        if (!filter.negativeAttributeFilter.notIn.length) {
            return null;
        }
    }
    return filter;
}

export function convertAbsoluteDateFilter(
    filter: IVisualizationObjectAbsoluteDateFilter | AFM.IAbsoluteDateFilter,
): AFM.FilterItem | null {
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

export function convertRelativeDateFilter(
    filter: IVisualizationObjectRelativeDateFilter | AFM.IRelativeDateFilter,
): AFM.FilterItem | null {
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

export function convertMeasureValueFilter(
    filter: VisualizationObject.IMeasureValueFilter | AFM.IMeasureValueFilter,
): AFM.IMeasureValueFilter | null {
    if (filter.measureValueFilter.condition === undefined) {
        return null;
    }

    return filter;
}

export function convertVisualizationObjectFilter(filter: VisualizationObjectFilter): AFM.FilterItem | null {
    if (VisualizationObject.isAttributeFilter(filter)) {
        return convertAttributeFilter(filter);
    } else if (VisualizationObject.isAbsoluteDateFilter(filter)) {
        return convertAbsoluteDateFilter(filter);
    } else {
        return convertRelativeDateFilter(filter);
    }
}

export function convertVisualizationObjectExtendedFilter(
    filter: VisualizationObjectExtendedFilter,
): AFM.ExtendedFilter | null {
    if (VisualizationObject.isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    } else {
        return convertVisualizationObjectFilter(filter);
    }
}

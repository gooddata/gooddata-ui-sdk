// (C) 2019-2020 GoodData Corporation
import { GdcVisualizationObject } from "@gooddata/gd-bear-model";
import {
    IFilter,
    isPositiveAttributeFilter,
    IPositiveAttributeFilter,
    filterAttributeElements,
    isAttributeElementsByRef,
    filterObjRef,
    INegativeAttributeFilter,
    isNegativeAttributeFilter,
    IRelativeDateFilter,
    isAbsoluteDateFilter,
    IAbsoluteDateFilter,
    isMeasureValueFilter,
    IMeasureValueFilter,
    measureValueFilterMeasure,
    measureValueFilterCondition,
    isIdentifierRef,
    IMeasureFilter,
    relativeDateFilterValues,
    absoluteDateFilterValues,
} from "@gooddata/sdk-model";
import { toBearRef } from "./ObjRefConverter";

const convertMeasureValueFilter = (
    filter: IMeasureValueFilter,
): GdcVisualizationObject.IMeasureValueFilter => {
    const measureObjQualifier = measureValueFilterMeasure(filter);

    if (isIdentifierRef(measureObjQualifier)) {
        throw new Error("Cannot convert measure value filter for measure specified by identifier");
    }

    return {
        measureValueFilter: {
            measure: measureObjQualifier,
            condition: measureValueFilterCondition(filter),
        },
    };
};

const convertRelativeDateFilter = (
    filter: IRelativeDateFilter,
): GdcVisualizationObject.IRelativeDateFilter => {
    return {
        relativeDateFilter: {
            dataSet: toBearRef(filterObjRef(filter)),
            ...relativeDateFilterValues(filter),
        },
    };
};

const convertAbsoluteDateFilter = (
    filter: IAbsoluteDateFilter,
): GdcVisualizationObject.IAbsoluteDateFilter => {
    return {
        absoluteDateFilter: {
            dataSet: toBearRef(filterObjRef(filter)),
            ...absoluteDateFilterValues(filter),
        },
    };
};

const convertNegativeAttributeFilter = (
    filter: INegativeAttributeFilter,
): GdcVisualizationObject.INegativeAttributeFilter => {
    const elements = filterAttributeElements(filter);
    return {
        negativeAttributeFilter: {
            displayForm: toBearRef(filterObjRef(filter)),
            notIn: isAttributeElementsByRef(elements) ? elements.uris : elements.values,
        },
    };
};

const convertPositiveAttributeFilter = (
    filter: IPositiveAttributeFilter,
): GdcVisualizationObject.IPositiveAttributeFilter => {
    const elements = filterAttributeElements(filter);
    return {
        positiveAttributeFilter: {
            displayForm: toBearRef(filterObjRef(filter)),
            in: isAttributeElementsByRef(elements) ? elements.uris : elements.values,
        },
    };
};

export const convertExtendedFilter = (filter: IFilter): GdcVisualizationObject.ExtendedFilter => {
    if (isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    } else {
        return convertFilter(filter);
    }
};

export const convertFilter = (filter: IMeasureFilter): GdcVisualizationObject.Filter => {
    if (isPositiveAttributeFilter(filter)) {
        return convertPositiveAttributeFilter(filter);
    } else if (isNegativeAttributeFilter(filter)) {
        return convertNegativeAttributeFilter(filter);
    } else if (isAbsoluteDateFilter(filter)) {
        return convertAbsoluteDateFilter(filter);
    } else {
        return convertRelativeDateFilter(filter);
    }
};

const isSelectAllFilter = (filter: IFilter): boolean => {
    if (isNegativeAttributeFilter(filter)) {
        const elements = filterAttributeElements(filter);
        const elementData = isAttributeElementsByRef(elements) ? elements.uris : elements.values;
        return elementData.length === 0;
    }

    return false;
};

export const shouldFilterBeIncluded = (filter: IFilter): boolean => {
    return !isSelectAllFilter(filter);
};

// (C) 2007-2020 GoodData Corporation
import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    filterIsEmpty,
    IAbsoluteDateFilter,
    IAttributeFilter,
    IFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRelativeDateFilter,
    isAbsoluteDateFilter,
    isAttributeElementsByValue,
    isAttributeFilter,
    isPositiveAttributeFilter,
    isRelativeDateFilter,
} from "@gooddata/sdk-model";
import { ExecuteAFM } from "@gooddata/gd-tiger-client";
import { toDateDataSetQualifier, toDisplayFormQualifier } from "./ObjRefConverter";

function convertPositiveFilter(filter: IPositiveAttributeFilter): ExecuteAFM.IPositiveAttributeFilter {
    const displayFormRef = filter.positiveAttributeFilter.displayForm;
    const attributeElements = filter.positiveAttributeFilter.in;

    if (!isAttributeElementsByValue(attributeElements)) {
        throw new NotSupported("Tiger backend only allows specifying attribute elements by value");
    }

    return {
        positiveAttributeFilter: {
            displayForm: toDisplayFormQualifier(displayFormRef),
            in: attributeElements,
        },
    };
}

function convertNegativeFilter(filter: INegativeAttributeFilter): ExecuteAFM.INegativeAttributeFilter | null {
    const displayFormRef = filter.negativeAttributeFilter.displayForm;
    const attributeElements = filter.negativeAttributeFilter.notIn;

    if (!isAttributeElementsByValue(attributeElements)) {
        throw new NotSupported("Tiger backend only allows specifying attribute elements by value");
    }

    return {
        negativeAttributeFilter: {
            displayForm: toDisplayFormQualifier(displayFormRef),
            notIn: attributeElements,
        },
    };
}

function convertAttributeFilter(filter: IAttributeFilter): ExecuteAFM.FilterItem | null {
    if (filterIsEmpty(filter)) {
        return null;
    }

    if (isPositiveAttributeFilter(filter)) {
        return convertPositiveFilter(filter);
    }

    return convertNegativeFilter(filter);
}

export function convertAbsoluteDateFilter(filter: IAbsoluteDateFilter): ExecuteAFM.FilterItem | null {
    const { absoluteDateFilter } = filter;

    if (absoluteDateFilter.from === undefined || absoluteDateFilter.to === undefined) {
        return null;
    }

    const datasetRef = absoluteDateFilter.dataSet;

    return {
        absoluteDateFilter: {
            dataset: toDateDataSetQualifier(datasetRef),
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

    const datasetRef = relativeDateFilter.dataSet;

    return {
        relativeDateFilter: {
            dataset: toDateDataSetQualifier(datasetRef),
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
    } else if (isRelativeDateFilter(filter)) {
        return convertRelativeDateFilter(filter);
    } else {
        throw new NotSupported("Tiger backend does not support measure value filters");
    }
}

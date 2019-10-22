// (C) 2007-2019 GoodData Corporation
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
    isUriRef,
} from "@gooddata/sdk-model";
import { ExecuteAFM } from "../gd-tiger-model/ExecuteAFM";

function convertPositiveFilter(filter: IPositiveAttributeFilter): ExecuteAFM.IPositiveAttributeFilter {
    const attributeRef = filter.positiveAttributeFilter.displayForm;
    const attributeElements = filter.positiveAttributeFilter.in;

    if (isUriRef(attributeRef)) {
        throw new NotSupported("Tiger backend does not allow specifying attributes by URI.");
    }

    if (!isAttributeElementsByValue(attributeElements)) {
        throw new NotSupported("Tiger backend only allows specifying attribute elements by value");
    }

    return {
        positiveAttributeFilter: {
            displayForm: attributeRef,
            in: attributeElements,
        },
    };
}

function convertNegativeFilter(filter: INegativeAttributeFilter): ExecuteAFM.INegativeAttributeFilter | null {
    if (filterIsEmpty(filter)) {
        return null;
    }

    const attributeRef = filter.negativeAttributeFilter.displayForm;
    const attributeElements = filter.negativeAttributeFilter.notIn;

    if (isUriRef(attributeRef)) {
        throw new NotSupported("Tiger backend does not allow specifying attributes by URI.");
    }

    if (!isAttributeElementsByValue(attributeElements)) {
        throw new NotSupported("Tiger backend only allows specifying attribute elements by value");
    }

    return {
        negativeAttributeFilter: {
            displayForm: attributeRef,
            notIn: attributeElements,
        },
    };
}

function convertAttributeFilter(filter: IAttributeFilter): ExecuteAFM.FilterItem | null {
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

    const dataSetRef = absoluteDateFilter.dataSet;

    if (isUriRef(dataSetRef)) {
        throw new NotSupported("Tiger backend does not allow specifying date data set by URI.");
    }

    return {
        absoluteDateFilter: {
            dataSet: dataSetRef,
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

    const dataSetRef = relativeDateFilter.dataSet;

    if (isUriRef(dataSetRef)) {
        throw new NotSupported("Tiger backend does not allow specifying date data set by URI.");
    }

    return {
        relativeDateFilter: {
            dataSet: dataSetRef,
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

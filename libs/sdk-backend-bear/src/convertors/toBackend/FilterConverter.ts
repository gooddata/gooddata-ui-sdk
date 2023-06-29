// (C) 2019-2022 GoodData Corporation
import { GdcVisualizationObject } from "@gooddata/api-model-bear";
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
    isRankingFilter,
    IRankingFilter,
    ObjRefInScope,
} from "@gooddata/sdk-model";
import { toBearRef } from "./ObjRefConverter.js";
import { assertNoNulls } from "./utils.js";

const convertObjRefInScopeToRefWithoutIdentifier = (ref: ObjRefInScope) => {
    if (isIdentifierRef(ref)) {
        throw new Error("Cannot convert ref specified by identifier");
    }
    return ref;
};

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

const convertRankingFilter = (filter: IRankingFilter): GdcVisualizationObject.IRankingFilter => {
    const { measure, attributes, operator, value } = filter.rankingFilter;

    return {
        rankingFilter: {
            measures: [convertObjRefInScopeToRefWithoutIdentifier(measure)],
            attributes: attributes?.map(convertObjRefInScopeToRefWithoutIdentifier),
            operator,
            value,
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
    assertNoNulls(elements);
    return {
        negativeAttributeFilter: {
            displayForm: toBearRef(filterObjRef(filter)),
            notIn: (isAttributeElementsByRef(elements) ? elements.uris : elements.values) as string[], // checked above so the cast is ok
        },
    };
};

const convertPositiveAttributeFilter = (
    filter: IPositiveAttributeFilter,
): GdcVisualizationObject.IPositiveAttributeFilter => {
    const elements = filterAttributeElements(filter);
    assertNoNulls(elements);
    return {
        positiveAttributeFilter: {
            displayForm: toBearRef(filterObjRef(filter)),
            in: (isAttributeElementsByRef(elements) ? elements.uris : elements.values) as string[], // checked above so the cast is ok
        },
    };
};

export const convertExtendedFilter = (filter: IFilter): GdcVisualizationObject.ExtendedFilter => {
    if (isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    } else if (isRankingFilter(filter)) {
        return convertRankingFilter(filter);
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

// (C) 2019-2022 GoodData Corporation
import {
    IVisualizationObjectAbsoluteDateFilter,
    IVisualizationObjectMeasureValueFilter,
    IVisualizationObjectNegativeAttributeFilter,
    IVisualizationObjectPositiveAttributeFilter,
    IVisualizationObjectRankingFilter,
    IVisualizationObjectRelativeDateFilter,
    VisualizationObjectExtendedFilter,
    VisualizationObjectFilter,
} from "@gooddata/api-model-bear";
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

const convertMeasureValueFilter = (filter: IMeasureValueFilter): IVisualizationObjectMeasureValueFilter => {
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

const convertRankingFilter = (filter: IRankingFilter): IVisualizationObjectRankingFilter => {
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

const convertRelativeDateFilter = (filter: IRelativeDateFilter): IVisualizationObjectRelativeDateFilter => {
    return {
        relativeDateFilter: {
            dataSet: toBearRef(filterObjRef(filter)),
            ...relativeDateFilterValues(filter),
        },
    };
};

const convertAbsoluteDateFilter = (filter: IAbsoluteDateFilter): IVisualizationObjectAbsoluteDateFilter => {
    return {
        absoluteDateFilter: {
            dataSet: toBearRef(filterObjRef(filter)),
            ...absoluteDateFilterValues(filter),
        },
    };
};

/**
 * @internal
 */
export interface IConvertInsightOptions {
    /**
     * Disables prohibition of null values in elements of the attribute filter.
     * In most use-cases, it is false/undefined, such as metadata conversion,
     * but in some specific instances, where the same conversion is needed
     * without a strict rule for nulls, it can be disabled.
     */
    allowNullValuesInAttributeFilters?: boolean;
}

const convertNegativeAttributeFilter = (
    filter: INegativeAttributeFilter,
    options?: IConvertInsightOptions,
): IVisualizationObjectNegativeAttributeFilter => {
    const elements = filterAttributeElements(filter);
    if (!options?.allowNullValuesInAttributeFilters) {
        assertNoNulls(elements);
    }
    return {
        negativeAttributeFilter: {
            displayForm: toBearRef(filterObjRef(filter)),
            notIn: (isAttributeElementsByRef(elements) ? elements.uris : elements.values) as string[], // checked above so the cast is ok
        },
    };
};

const convertPositiveAttributeFilter = (
    filter: IPositiveAttributeFilter,
    options?: IConvertInsightOptions,
): IVisualizationObjectPositiveAttributeFilter => {
    const elements = filterAttributeElements(filter);
    if (!options?.allowNullValuesInAttributeFilters) {
        assertNoNulls(elements);
    }
    return {
        positiveAttributeFilter: {
            displayForm: toBearRef(filterObjRef(filter)),
            in: (isAttributeElementsByRef(elements) ? elements.uris : elements.values) as string[], // checked above so the cast is ok
        },
    };
};

export const convertExtendedFilter = (
    filter: IFilter,
    options?: IConvertInsightOptions,
): VisualizationObjectExtendedFilter => {
    if (isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    } else if (isRankingFilter(filter)) {
        return convertRankingFilter(filter);
    } else {
        return convertFilter(filter, options);
    }
};

export const convertFilter = (
    filter: IMeasureFilter,
    options?: IConvertInsightOptions,
): VisualizationObjectFilter => {
    if (isPositiveAttributeFilter(filter)) {
        return convertPositiveAttributeFilter(filter, options);
    } else if (isNegativeAttributeFilter(filter)) {
        return convertNegativeAttributeFilter(filter, options);
    } else if (isAbsoluteDateFilter(filter)) {
        return convertAbsoluteDateFilter(filter);
    } else {
        return convertRelativeDateFilter(filter);
    }
};

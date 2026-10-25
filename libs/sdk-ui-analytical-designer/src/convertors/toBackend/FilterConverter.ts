// (C) 2019-2026 GoodData Corporation

import {
    type IAbsoluteDateFilter,
    type IArbitraryAttributeFilter,
    type IFilter,
    type IMatchAttributeFilter,
    type IMeasureFilter,
    type IMeasureValueFilter,
    type INegativeAttributeFilter,
    type IPositiveAttributeFilter,
    type IRankingFilter,
    type IRelativeDateFilter,
    absoluteDateFilterValues,
    filterAttributeElements,
    filterObjRef,
    isAbsoluteDateFilter,
    isArbitraryAttributeFilter,
    isAttributeElementsByRef,
    isMatchAttributeFilter,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    isRankingFilter,
    isRelativeBoundedDateFilter,
    isRelativeDateFilter,
    measureValueFilterConditions,
    measureValueFilterMeasure,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";

import {
    type IVisualizationObjectAbsoluteDateFilter,
    type IVisualizationObjectArbitraryAttributeFilter,
    type IVisualizationObjectMatchAttributeFilter,
    type IVisualizationObjectMeasureValueFilter,
    type IVisualizationObjectNegativeAttributeFilter,
    type IVisualizationObjectPositiveAttributeFilter,
    type IVisualizationObjectRankingFilter,
    type IVisualizationObjectRelativeDateFilter,
    type VisualizationObjectExtendedFilter,
    type VisualizationObjectFilter,
} from "../../typings/bear/bearTypes.js";

import { toBearRef } from "./ObjRefConverter.js";
import { assertNoNulls } from "./utils.js";

const convertMeasureValueFilter = (filter: IMeasureValueFilter): IVisualizationObjectMeasureValueFilter => {
    const measureObjQualifier = measureValueFilterMeasure(filter);
    const conditions = measureValueFilterConditions(filter);
    const conditionProp = conditions?.length ? { conditions } : {};
    const { applyOnResult } = filter.measureValueFilter;
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    return {
        measureValueFilter: {
            measure: measureObjQualifier,
            ...conditionProp,
            ...applyOnResultProp,
        },
    };
};

const convertRankingFilter = (filter: IRankingFilter): IVisualizationObjectRankingFilter => {
    const { measure, attributes, operator, value, applyOnResult, strictLimitOfRows } = filter.rankingFilter;

    // The "out of" attributes are preserved as-is, like the ranked measure: a bucket attribute is a
    // local-identifier ref, a catalog attribute is an idRef (uri refs pass through too). Stripping the
    // identifier would throw for any catalog (idRef) attribute and abort the conversion, wedging the UI.
    const attributesProp = attributes?.length ? { attributes } : {};
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    const strictLimitOfRowsProp = strictLimitOfRows === undefined ? {} : { strictLimitOfRows };
    return {
        rankingFilter: {
            // The ranked measure is preserved as-is so a catalog metric referenced by identifier survives;
            // a local identifier (bucket measure) or uri ref passes through unchanged as well.
            measures: [measure],
            ...attributesProp,
            operator,
            value,
            ...strictLimitOfRowsProp,
            ...applyOnResultProp,
        },
    };
};

const convertRelativeDateFilter = (filter: IRelativeDateFilter): IVisualizationObjectRelativeDateFilter => {
    const boundedFilter = isRelativeBoundedDateFilter(filter)
        ? filter.relativeDateFilter.boundedFilter
        : undefined;
    return {
        relativeDateFilter: {
            dataSet: toBearRef(filterObjRef(filter)),
            ...relativeDateFilterValues(filter),
            ...(boundedFilter ? { boundedFilter } : {}),
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

const convertArbitraryAttributeFilter = (
    filter: IArbitraryAttributeFilter,
): IVisualizationObjectArbitraryAttributeFilter => ({
    arbitraryAttributeFilter: {
        displayForm: toBearRef(filter.arbitraryAttributeFilter.label),
        values: filter.arbitraryAttributeFilter.values,
        negativeSelection: filter.arbitraryAttributeFilter.negativeSelection,
    },
});

const convertMatchAttributeFilter = (
    filter: IMatchAttributeFilter,
): IVisualizationObjectMatchAttributeFilter => ({
    matchAttributeFilter: {
        displayForm: toBearRef(filter.matchAttributeFilter.label),
        operator: filter.matchAttributeFilter.operator,
        literal: filter.matchAttributeFilter.literal,
        ...(filter.matchAttributeFilter.caseSensitive === undefined
            ? {}
            : { caseSensitive: filter.matchAttributeFilter.caseSensitive }),
        ...(filter.matchAttributeFilter.negativeSelection === undefined
            ? {}
            : {
                  negativeSelection: filter.matchAttributeFilter.negativeSelection,
              }),
    },
});

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
            notIn: isAttributeElementsByRef(elements) ? elements.uris : elements.values, // checked above so the cast is ok
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
            in: isAttributeElementsByRef(elements) ? elements.uris : elements.values, // checked above so the cast is ok
        },
    };
};

export const convertExtendedFilter = (
    filter: IFilter,
    options?: IConvertInsightOptions,
): VisualizationObjectExtendedFilter => {
    if (isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    }

    if (isRankingFilter(filter)) {
        return convertRankingFilter(filter);
    }

    if (isArbitraryAttributeFilter(filter)) {
        return convertArbitraryAttributeFilter(filter);
    }

    if (isMatchAttributeFilter(filter)) {
        return convertMatchAttributeFilter(filter);
    }

    return convertFilter(filter, options);
};

export const convertFilter = (
    filter: IMeasureFilter,
    options?: IConvertInsightOptions,
): VisualizationObjectFilter => {
    if (isPositiveAttributeFilter(filter)) {
        return convertPositiveAttributeFilter(filter, options);
    } else if (isNegativeAttributeFilter(filter)) {
        return convertNegativeAttributeFilter(filter, options);
    } else if (isArbitraryAttributeFilter(filter)) {
        return convertArbitraryAttributeFilter(filter);
    } else if (isMatchAttributeFilter(filter)) {
        return convertMatchAttributeFilter(filter);
    } else if (isAbsoluteDateFilter(filter)) {
        return convertAbsoluteDateFilter(filter);
    } else if (isRelativeDateFilter(filter)) {
        return convertRelativeDateFilter(filter);
    }
    throw new Error("Unsupported filter type");
};

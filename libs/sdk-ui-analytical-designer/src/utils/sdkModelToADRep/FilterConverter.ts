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
    filterLocalIdentifier,
    filterObjRef,
    isAbsoluteDateFilter,
    isArbitraryAttributeFilter,
    isAttributeElementsByRef,
    isMatchAttributeFilter,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    isRankingFilter,
    measureValueFilterConditions,
    measureValueFilterDimensionality,
    measureValueFilterMeasure,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";

import { generateBucketItemIdentifier } from "../../models/bucket_item_identifier.js";
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

const convertMeasureValueFilter = (filter: IMeasureValueFilter): IVisualizationObjectMeasureValueFilter => {
    const measureObjQualifier = measureValueFilterMeasure(filter);
    const dimensionality = measureValueFilterDimensionality(filter);
    const dimensionalityProp = dimensionality?.length ? { dimensionality } : {};
    const conditions = measureValueFilterConditions(filter);
    const { applyOnResult } = filter.measureValueFilter;
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };

    return {
        measureValueFilter: {
            measure: measureObjQualifier,
            ...(conditions?.length ? { conditions } : {}),
            ...dimensionalityProp,
            ...applyOnResultProp,
        },
    };
};

const convertRankingFilter = (filter: IRankingFilter): IVisualizationObjectRankingFilter => {
    const { measure, attributes, operator, value, applyOnResult, strictLimitOfRows } = filter.rankingFilter;
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    const strictLimitOfRowsProp = strictLimitOfRows === undefined ? {} : { strictLimitOfRows };

    return {
        rankingFilter: {
            // The ranked measure and the "out of" attributes are preserved as-is: a bucket measure/attribute
            // is a local-identifier ref, a catalog one is an idRef (and uri refs pass through too). Wrapping
            // them to strip the identifier would throw for any catalog (idRef) item, aborting the
            // reference-point round-trip and wedging the UI.
            measures: [measure],
            attributes,
            operator,
            value,
            ...strictLimitOfRowsProp,
            ...applyOnResultProp,
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

const convertArbitraryAttributeFilter = (
    filter: IArbitraryAttributeFilter,
    autoGenerateFilterLocalIdentifier: boolean,
): IVisualizationObjectArbitraryAttributeFilter => {
    const localIdentifier = filterLocalIdentifier(filter);
    return {
        arbitraryAttributeFilter: {
            ...(localIdentifier || autoGenerateFilterLocalIdentifier
                ? {
                      localIdentifier: localIdentifier ?? generateBucketItemIdentifier(),
                  }
                : {}),
            displayForm: filterObjRef(filter),
            values: filter.arbitraryAttributeFilter.values,
            negativeSelection: filter.arbitraryAttributeFilter.negativeSelection,
        },
    };
};

const convertMatchAttributeFilter = (
    filter: IMatchAttributeFilter,
    autoGenerateFilterLocalIdentifier: boolean,
): IVisualizationObjectMatchAttributeFilter => {
    const localIdentifier = filterLocalIdentifier(filter);
    return {
        matchAttributeFilter: {
            ...(localIdentifier || autoGenerateFilterLocalIdentifier
                ? {
                      localIdentifier: localIdentifier ?? generateBucketItemIdentifier(),
                  }
                : {}),
            displayForm: filterObjRef(filter),
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
    };
};

const convertNegativeAttributeFilter = (
    filter: INegativeAttributeFilter,
    autoGenerateFilterLocalIdentifier: boolean,
): IVisualizationObjectNegativeAttributeFilter => {
    const elements = filterAttributeElements(filter);
    const localIdentifier = filterLocalIdentifier(filter);
    return {
        negativeAttributeFilter: {
            ...(localIdentifier || autoGenerateFilterLocalIdentifier
                ? {
                      localIdentifier: localIdentifier ?? generateBucketItemIdentifier(),
                  }
                : {}),
            displayForm: filterObjRef(filter),
            notIn: isAttributeElementsByRef(elements) ? elements.uris : elements.values,
        },
    };
};

const convertPositiveAttributeFilter = (
    filter: IPositiveAttributeFilter,
    autoGenerateFilterLocalIdentifier: boolean,
): IVisualizationObjectPositiveAttributeFilter => {
    const elements = filterAttributeElements(filter);
    const localIdentifier = filterLocalIdentifier(filter);
    return {
        positiveAttributeFilter: {
            ...(localIdentifier || autoGenerateFilterLocalIdentifier
                ? {
                      localIdentifier: localIdentifier ?? generateBucketItemIdentifier(),
                  }
                : {}),
            displayForm: filterObjRef(filter),
            in: isAttributeElementsByRef(elements) ? elements.uris : elements.values,
        },
    };
};

export const convertExtendedFilter = (
    filter: IFilter,
    autoGenerateFilterLocalIdentifier: boolean,
): VisualizationObjectExtendedFilter => {
    if (isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    }

    if (isRankingFilter(filter)) {
        return convertRankingFilter(filter);
    }

    if (isArbitraryAttributeFilter(filter)) {
        return convertArbitraryAttributeFilter(filter, autoGenerateFilterLocalIdentifier);
    }

    if (isMatchAttributeFilter(filter)) {
        return convertMatchAttributeFilter(filter, autoGenerateFilterLocalIdentifier);
    }

    return convertFilter(filter, autoGenerateFilterLocalIdentifier);
};

export const convertFilter = (
    filter: IMeasureFilter,
    autoGenerateFilterLocalIdentifier: boolean,
): VisualizationObjectFilter => {
    if (isPositiveAttributeFilter(filter)) {
        return convertPositiveAttributeFilter(filter, autoGenerateFilterLocalIdentifier);
    } else if (isNegativeAttributeFilter(filter)) {
        return convertNegativeAttributeFilter(filter, autoGenerateFilterLocalIdentifier);
    } else if (isArbitraryAttributeFilter(filter)) {
        return convertArbitraryAttributeFilter(filter, autoGenerateFilterLocalIdentifier);
    } else if (isMatchAttributeFilter(filter)) {
        return convertMatchAttributeFilter(filter, autoGenerateFilterLocalIdentifier);
    } else if (isAbsoluteDateFilter(filter)) {
        return convertAbsoluteDateFilter(filter);
    } else {
        return convertRelativeDateFilter(filter);
    }
};

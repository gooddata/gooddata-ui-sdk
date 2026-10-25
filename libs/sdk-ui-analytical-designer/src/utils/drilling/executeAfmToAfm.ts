// (C) 2020-2026 GoodData Corporation

import {
    type AttributeElements,
    type CompatibilityFilter as CompatibilityFilterAFM,
    type FilterItem as FilterItemAFM,
    type IAfm as IAfmBear,
    type IMeasure as IMeasureAFM,
    type INegativeAttributeFilter as INegativeAttributeFilterAFM,
    type IPositiveAttributeFilter as IPositiveAttributeFilterAFM,
    type IRankingFilter as IRankingFilterAFM,
    isAttributeElementsArray,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isExpressionFilter,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    isRankingFilter,
    isSimpleMeasureDefinition,
} from "../../typings/bear/bearTypes.js";

// Adapted from gooddata-js execute-afm.convert.ts
import {
    type CompatibilityFilter,
    type FilterItem,
    type IAfm,
    type IMeasure,
    type INegativeAttributeFilter,
    type IPositiveAttributeFilter,
    type IRankingFilter,
} from "./types.js";

const isTextFilter = (elements: AttributeElements): boolean => isAttributeElementsByValue(elements);

const convertElementsArray = (elements: AttributeElements): string[] => {
    if (isAttributeElementsArray(elements)) {
        return elements;
    } else if (isAttributeElementsByRef(elements)) {
        return elements.uris;
    } else {
        return elements.values;
    }
};

const convertPositiveAttributeFilter = (filter: IPositiveAttributeFilterAFM): IPositiveAttributeFilter => {
    const { positiveAttributeFilter: oldFilter } = filter;

    return {
        positiveAttributeFilter: {
            displayForm: oldFilter.displayForm,
            in: convertElementsArray(oldFilter.in),
            ...(isTextFilter(oldFilter.in) && { textFilter: true }),
        },
    };
};

const convertNegativeAttributeFilter = (filter: INegativeAttributeFilterAFM): INegativeAttributeFilter => {
    const { negativeAttributeFilter: oldFilter } = filter;

    return {
        negativeAttributeFilter: {
            displayForm: oldFilter.displayForm,
            notIn: convertElementsArray(oldFilter.notIn),
            ...(isTextFilter(oldFilter.notIn) && { textFilter: true }),
        },
    };
};

const convertRankingFilter = (filter: IRankingFilterAFM): IRankingFilter => {
    const { measures, attributes, operator, value, strictLimitOfRows } = filter.rankingFilter;
    const attributesProp = attributes ? { attributes } : {};
    const strictLimitOfRowsProp = strictLimitOfRows === undefined ? {} : { strictLimitOfRows };
    return {
        rankingFilter: {
            measures,
            ...attributesProp,
            operator,
            value,
            ...strictLimitOfRowsProp,
        },
    };
};

function convertFilter(filter: FilterItemAFM): FilterItem;
function convertFilter(filter: CompatibilityFilterAFM): CompatibilityFilter;
function convertFilter(filter: CompatibilityFilterAFM): CompatibilityFilter {
    if (isPositiveAttributeFilter(filter)) {
        return convertPositiveAttributeFilter(filter);
    } else if (isNegativeAttributeFilter(filter)) {
        return convertNegativeAttributeFilter(filter);
    } else if (isExpressionFilter(filter)) {
        return {
            value: filter.expression.value,
        };
    } else if (isRankingFilter(filter)) {
        return convertRankingFilter(filter);
    }

    return filter;
}

// spelled out rather than point-free: passing `convertFilter` itself would resolve its overloads
// against the last signature for both callers
const convertFilters = (filters: CompatibilityFilterAFM[] | undefined): CompatibilityFilter[] | undefined =>
    filters?.map((filter) => convertFilter(filter));

const convertMeasureFilters = (filters: FilterItemAFM[] | undefined): FilterItem[] | undefined =>
    filters?.map((filter) => convertFilter(filter));

const convertMeasure = (measure: IMeasureAFM): IMeasure => {
    const { definition } = measure;
    if (isSimpleMeasureDefinition(definition)) {
        const { filters: oldFilters, ...simpleMeasure } = definition.measure;
        const filters = convertMeasureFilters(oldFilters);
        const filtersProp = filters ? { filters } : {};

        return {
            ...measure,
            definition: {
                measure: {
                    ...simpleMeasure,
                    ...filtersProp,
                },
            },
        };
    }

    // arithmetic / pop / previous-period definitions are identical in both type families
    return { ...measure, definition };
};

const convertMeasures = (measures?: IMeasureAFM[]): IMeasure[] | undefined => measures?.map(convertMeasure);

export const convertAfm = (afm: IAfmBear): IAfm => {
    // the bear-flavoured parts are pulled OUT so the spread carries only the shared fields; key
    // presence is preserved exactly (an absent part stays absent)
    const { measures: bearMeasures, filters: bearFilters, ...rest } = afm;

    return {
        ...rest,
        ...(bearMeasures ? { measures: convertMeasures(bearMeasures) } : {}),
        ...(bearFilters ? { filters: convertFilters(bearFilters) } : {}),
    };
};

// (C) 2007-2025 GoodData Corporation
import {
    AbsoluteDateFilter,
    AttributeFilter,
    FilterDefinition,
    MeasureValueFilter,
    NegativeAttributeFilter,
    PositiveAttributeFilter,
    RankingFilter,
    RelativeDateFilter,
} from "@gooddata/api-client-tiger";
import {
    filterIsEmpty,
    IAbsoluteDateFilter,
    IAttributeElements,
    IAttributeFilter,
    IFilter,
    IMeasureValueFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRankingFilter,
    IRelativeDateFilter,
    isAbsoluteDateFilter,
    isAttributeElementsByValue,
    isAttributeFilter,
    isComparisonCondition,
    isFilter,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isObjRef,
    isPositiveAttributeFilter,
    isRangeCondition,
    isRankingFilter,
    isRelativeDateFilter,
    isRelativeBoundedDateFilterBody,
    isUpperBound,
    isLowerBound,
} from "@gooddata/sdk-model";
import { toTigerGranularity } from "../../fromBackend/dateGranularityConversions.js";
import {
    toLabelQualifier,
    toAfmIdentifier,
    toDateDataSetQualifier,
    toLocalIdentifier,
} from "../ObjRefConverter.js";

/**
 * Tiger specific wrapper for IFilter, adding 'applyOnResult' property influencing the place of filter application.
 * This property could very well be part of each I*Filter but since it's needed only internally so far it's better
 * to not change the public API.
 *
 * @internal
 */
export interface IFilterWithApplyOnResult {
    filter: IFilter;
    applyOnResult: boolean | undefined;
}

export function newFilterWithApplyOnResult(
    filter: IFilter,
    applyOnResult: boolean | undefined,
): IFilterWithApplyOnResult {
    return { filter, applyOnResult };
}

type ApplyOnResultProp = { applyOnResult?: boolean };

function extractValuesFromAttributeElements(attributeElements: IAttributeElements): Array<string | null> {
    if (isAttributeElementsByValue(attributeElements)) {
        return attributeElements.values;
    }

    // XXX: there is no other way now then to be lenient. the KD does not support text filters and always works
    //  primarily with URIs. Changing / refactoring KD in this area is out of question. So this code is now
    //  more lenient and if it finds attribute elements to be URIs, it will use them in the filter.
    //
    //  Furthermore.. this is not 100% wrong anyway as tiger elements have URIs which are in the end
    //  text values as well :)
    return attributeElements.uris;
}

function convertPositiveFilter(
    filter: IPositiveAttributeFilter,
    applyOnResultProp: ApplyOnResultProp,
): PositiveAttributeFilter {
    const labelRef = filter.positiveAttributeFilter.displayForm;
    const attributeElements = filter.positiveAttributeFilter.in;
    const localIdentifier = filter.positiveAttributeFilter.localIdentifier;

    return {
        positiveAttributeFilter: {
            label: isObjRef(labelRef)
                ? toLabelQualifier(labelRef)
                : toLocalIdentifier(labelRef.localIdentifier),
            in: {
                values: extractValuesFromAttributeElements(attributeElements),
            },
            localIdentifier,
            ...applyOnResultProp,
        },
    };
}

function convertNegativeFilter(
    filter: INegativeAttributeFilter,
    applyOnResultProp: ApplyOnResultProp,
): NegativeAttributeFilter {
    const labelRef = filter.negativeAttributeFilter.displayForm;
    const attributeElements = filter.negativeAttributeFilter.notIn;
    const localIdentifier = filter.negativeAttributeFilter.localIdentifier;

    return {
        negativeAttributeFilter: {
            label: isObjRef(labelRef)
                ? toLabelQualifier(labelRef)
                : toLocalIdentifier(labelRef.localIdentifier),
            notIn: {
                values: extractValuesFromAttributeElements(attributeElements),
            },
            localIdentifier,
            ...applyOnResultProp,
        },
    };
}

function convertAttributeFilter(
    filter: IAttributeFilter,
    applyOnResultProp: ApplyOnResultProp,
    keepEmptyAttributeFilters: boolean = false,
): AttributeFilter | null {
    if (isNegativeAttributeFilter(filter) && filterIsEmpty(filter) && !keepEmptyAttributeFilters) {
        return null;
    }

    if (isPositiveAttributeFilter(filter)) {
        return convertPositiveFilter(filter, applyOnResultProp);
    }

    return convertNegativeFilter(filter, applyOnResultProp);
}

function convertAbsoluteDateFilter(
    filter: IAbsoluteDateFilter,
    applyOnResultProp: ApplyOnResultProp,
): AbsoluteDateFilter | null {
    const { absoluteDateFilter } = filter;

    if (absoluteDateFilter.from === undefined || absoluteDateFilter.to === undefined) {
        return null;
    }

    const datasetRef = absoluteDateFilter.dataSet;
    const localIdentifier = absoluteDateFilter.localIdentifier;

    return {
        absoluteDateFilter: {
            dataset: toDateDataSetQualifier(datasetRef),
            from: String(absoluteDateFilter.from),
            to: String(absoluteDateFilter.to),
            localIdentifier,
            ...applyOnResultProp,
        },
    };
}

function convertRelativeDateFilter(
    filter: IRelativeDateFilter,
    applyOnResultProp: ApplyOnResultProp,
): RelativeDateFilter | null {
    const { relativeDateFilter } = filter;

    if (relativeDateFilter.from === undefined || !relativeDateFilter.to === undefined) {
        return null;
    }

    const datasetRef = relativeDateFilter.dataSet;
    const dataset = toDateDataSetQualifier(datasetRef);
    const localIdentifier = relativeDateFilter.localIdentifier;

    const boundedFilter = isRelativeBoundedDateFilterBody(relativeDateFilter)
        ? {
              boundedFilter: {
                  granularity: toTigerGranularity(relativeDateFilter.boundedFilter.granularity as any),
                  from: isLowerBound(relativeDateFilter.boundedFilter)
                      ? Number(relativeDateFilter.boundedFilter.from)
                      : undefined,
                  to: isUpperBound(relativeDateFilter.boundedFilter)
                      ? Number(relativeDateFilter.boundedFilter.to)
                      : undefined,
                  dataset,
              },
          }
        : undefined;

    return {
        relativeDateFilter: {
            dataset,
            granularity: toTigerGranularity(relativeDateFilter.granularity as any),
            from: Number(relativeDateFilter.from),
            to: Number(relativeDateFilter.to),
            localIdentifier,
            ...boundedFilter,
            ...applyOnResultProp,
        },
    };
}

function convertMeasureValueFilter(
    filter: IMeasureValueFilter,
    applyOnResultProp: ApplyOnResultProp,
): MeasureValueFilter | null {
    const { measureValueFilter } = filter;
    const condition = measureValueFilter.condition;
    const localIdentifier = measureValueFilter.localIdentifier;

    if (isComparisonCondition(condition)) {
        const { operator, value, treatNullValuesAs } = condition.comparison;
        return {
            comparisonMeasureValueFilter: {
                measure: toAfmIdentifier(measureValueFilter.measure),
                // Operator has same values, we only need type assertion
                operator,
                value,
                treatNullValuesAs,
                localIdentifier,
                ...applyOnResultProp,
            },
        };
    }

    if (isRangeCondition(condition)) {
        const { operator, from: originalFrom, to: originalTo, treatNullValuesAs } = condition.range;
        return {
            rangeMeasureValueFilter: {
                measure: toAfmIdentifier(measureValueFilter.measure),
                // Operator has same values, we only need type assertion
                operator,
                // make sure the boundaries are always from <= to, because tiger backend cannot handle from > to in a user friendly way
                // this is effectively the same behavior as in bear
                from: Math.min(originalFrom, originalTo),
                to: Math.max(originalFrom, originalTo),
                treatNullValuesAs,
                ...applyOnResultProp,
            },
        };
    }

    return null;
}

function convertRankingFilter(filter: IRankingFilter, applyOnResultProp: ApplyOnResultProp): RankingFilter {
    const { measure, attributes, operator, value } = filter.rankingFilter;
    const dimensionalityProp = attributes ? { dimensionality: attributes.map(toAfmIdentifier) } : {};
    const localIdentifier = filter.rankingFilter.localIdentifier;
    return {
        rankingFilter: {
            measures: [toAfmIdentifier(measure)],
            ...dimensionalityProp,
            operator,
            value,
            localIdentifier,
            ...applyOnResultProp,
        },
    };
}

export function convertFilter(
    filter0: IFilter | IFilterWithApplyOnResult,
    keepEmptyAttributeFilters: boolean = false,
): FilterDefinition | null {
    const [filter, applyOnResult] = isFilter(filter0)
        ? [filter0, undefined]
        : [filter0.filter, filter0.applyOnResult];
    const applyOnResultProp: ApplyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    if (isAttributeFilter(filter)) {
        return convertAttributeFilter(filter, applyOnResultProp, keepEmptyAttributeFilters);
    } else if (isAbsoluteDateFilter(filter)) {
        return convertAbsoluteDateFilter(filter, applyOnResultProp);
    } else if (isRelativeDateFilter(filter)) {
        return convertRelativeDateFilter(filter, applyOnResultProp);
    } else if (isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter, applyOnResultProp);
    } else if (isRankingFilter(filter)) {
        return convertRankingFilter(filter, applyOnResultProp);
    } else {
        console.warn("Tiger does not support this filter. The filter will be ignored");
        return null;
    }
}

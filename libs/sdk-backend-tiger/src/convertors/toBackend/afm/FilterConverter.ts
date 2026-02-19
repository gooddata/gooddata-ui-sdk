// (C) 2007-2026 GoodData Corporation

import {
    type AbsoluteDateFilter,
    type AbsoluteDateFilterAbsoluteDateFilterEmptyValueHandlingEnum,
    type AllTimeDateFilter,
    type AllTimeDateFilterAllTimeDateFilterEmptyValueHandlingEnum,
    type AttributeFilter,
    type FilterDefinition,
    type MeasureValueFilter,
    type NegativeAttributeFilter,
    type PositiveAttributeFilter,
    type RankingFilter,
    type RelativeDateFilter,
    type RelativeDateFilterRelativeDateFilterEmptyValueHandlingEnum,
    type MeasureValueCondition as TigerMeasureValueCondition,
} from "@gooddata/api-client-tiger";
import {
    type EmptyValues,
    type IAbsoluteDateFilter,
    type IAttributeElements,
    type IAttributeFilter,
    type IFilter,
    type IMeasureValueFilter,
    type INegativeAttributeFilter,
    type IPositiveAttributeFilter,
    type IRankingFilter,
    type IRelativeDateFilter,
    filterIsEmpty,
    isAbsoluteDateFilter,
    isAllTimeDateFilter,
    isAttributeElementsByValue,
    isAttributeFilter,
    isComparisonCondition,
    isFilter,
    isLowerBound,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isObjRef,
    isPositiveAttributeFilter,
    isRangeCondition,
    isRankingFilter,
    isRelativeBoundedDateFilterBody,
    isRelativeDateFilter,
    isUpperBound,
} from "@gooddata/sdk-model";

import { toTigerGranularity } from "../../fromBackend/dateGranularityConversions.js";
import {
    toAfmIdentifier,
    toDateDataSetQualifier,
    toLabelQualifier,
    toLocalIdentifier,
} from "../ObjRefConverter.js";

function toTigerEmptyValueHandling(
    emptyValues: EmptyValues | undefined,
):
    | AllTimeDateFilterAllTimeDateFilterEmptyValueHandlingEnum
    | AbsoluteDateFilterAbsoluteDateFilterEmptyValueHandlingEnum
    | RelativeDateFilterRelativeDateFilterEmptyValueHandlingEnum
    | undefined {
    if (emptyValues === "include") {
        return "INCLUDE" as const;
    }
    if (emptyValues === "exclude") {
        return "EXCLUDE" as const;
    }
    if (emptyValues === "only") {
        return "ONLY" as const;
    }
    return undefined;
}

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
    const emptyValueHandling = toTigerEmptyValueHandling(absoluteDateFilter.emptyValueHandling);

    return {
        absoluteDateFilter: {
            dataset: toDateDataSetQualifier(datasetRef),
            from: String(absoluteDateFilter.from),
            to: String(absoluteDateFilter.to),
            localIdentifier,
            ...(emptyValueHandling === undefined ? {} : { emptyValueHandling }),
            ...applyOnResultProp,
        },
    };
}

function convertAllTimeDateFilter(
    filter: IRelativeDateFilter,
    applyOnResultProp: ApplyOnResultProp,
): AllTimeDateFilter | null {
    const { relativeDateFilter } = filter;

    const datasetRef = relativeDateFilter.dataSet;
    const localIdentifier = relativeDateFilter.localIdentifier;
    const emptyValueHandling = toTigerEmptyValueHandling(relativeDateFilter.emptyValueHandling);

    // Noop all-time filters have no execution effect; send only meaningful variants.
    if (emptyValueHandling === "EXCLUDE" || emptyValueHandling === "ONLY") {
        return {
            allTimeDateFilter: {
                dataset: toDateDataSetQualifier(datasetRef),
                localIdentifier,
                emptyValueHandling,
                ...applyOnResultProp,
            },
        };
    }

    return null;
}

function convertRelativeDateFilter(
    filter: IRelativeDateFilter,
    applyOnResultProp: ApplyOnResultProp,
): RelativeDateFilter | AllTimeDateFilter | null {
    const { relativeDateFilter } = filter;

    if (isAllTimeDateFilter(filter)) {
        // All time date filters map to a dedicated AFM filter type.
        // The backend defaults the granularity used for null-date checks (DAY) if not specified.
        return convertAllTimeDateFilter(filter, applyOnResultProp);
    }

    if (relativeDateFilter.from === undefined) {
        return null;
    }

    const datasetRef = relativeDateFilter.dataSet;
    const localIdentifier = relativeDateFilter.localIdentifier;
    const emptyValueHandling = toTigerEmptyValueHandling(relativeDateFilter.emptyValueHandling);

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
              },
          }
        : undefined;

    return {
        relativeDateFilter: {
            dataset: toDateDataSetQualifier(datasetRef),
            granularity: toTigerGranularity(relativeDateFilter.granularity as any),
            from: Number(relativeDateFilter.from),
            to: Number(relativeDateFilter.to),
            localIdentifier,
            ...(emptyValueHandling === undefined ? {} : { emptyValueHandling }),
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
    const conditions = measureValueFilter.conditions;
    const localIdentifier = measureValueFilter.localIdentifier;
    const dimensionalityProp =
        (measureValueFilter.dimensionality?.length ?? 0) > 0
            ? { dimensionality: measureValueFilter.dimensionality?.map(toAfmIdentifier) }
            : {};

    if (conditions && conditions.length > 1) {
        // Tiger compound MVF supports just a single `treatNullValuesAs` for the entire filter.
        // The model-level intent here is "treat nulls as zero" => if at least one condition requests it, turn it on.
        const treatNullValuesAs = conditions.some((c) => {
            return isComparisonCondition(c)
                ? c.comparison.treatNullValuesAs !== undefined
                : c.range.treatNullValuesAs !== undefined;
        })
            ? 0
            : undefined;

        const tigerConditions: TigerMeasureValueCondition[] = conditions.map((c) => {
            if (isComparisonCondition(c)) {
                return {
                    comparison: {
                        operator: c.comparison.operator,
                        value: c.comparison.value,
                    },
                };
            }

            const originalFrom = c.range.from;
            const originalTo = c.range.to;

            return {
                range: {
                    operator: c.range.operator,
                    // make sure the boundaries are always from <= to, because tiger backend cannot handle from > to in a user friendly way
                    // this is effectively the same behavior as in bear
                    from: Math.min(originalFrom, originalTo),
                    to: Math.max(originalFrom, originalTo),
                },
            };
        });

        return {
            compoundMeasureValueFilter: {
                measure: toAfmIdentifier(measureValueFilter.measure),
                conditions: tigerConditions,
                ...(treatNullValuesAs === undefined ? {} : { treatNullValuesAs }),
                localIdentifier,
                ...dimensionalityProp,
                ...applyOnResultProp,
            },
        };
    }

    const condition = conditions?.[0] ?? measureValueFilter.condition;

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
                ...dimensionalityProp,
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
                ...dimensionalityProp,
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
    const [filter, wrapperApplyOnResult] = isFilter(filter0)
        ? [filter0, undefined]
        : [filter0.filter, filter0.applyOnResult];
    const filterApplyOnResult = isMeasureValueFilter(filter)
        ? filter.measureValueFilter.applyOnResult
        : isRankingFilter(filter)
          ? filter.rankingFilter.applyOnResult
          : undefined;
    const applyOnResult = wrapperApplyOnResult ?? filterApplyOnResult;
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

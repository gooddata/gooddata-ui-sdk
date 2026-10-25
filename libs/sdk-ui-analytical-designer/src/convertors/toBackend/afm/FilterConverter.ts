// (C) 2007-2026 GoodData Corporation

import { compact } from "lodash-es";

import {
    type IAbsoluteDateFilter,
    type IAttributeFilterWithSelection,
    type IFilter,
    type IMeasureFilter,
    type IMeasureValueFilter,
    type IRankingFilter,
    type IRelativeDateFilter,
    type MeasureValueFilterCondition,
    filterIsEmpty,
    isAbsoluteDateFilter,
    isArbitraryAttributeFilter,
    isAttributeFilterWithSelection,
    isComparisonCondition,
    isMatchAttributeFilter,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isObjRef,
    isRankingFilter,
    isRelativeBoundedDateFilter,
    isRelativeDateFilter,
} from "@gooddata/sdk-model";

import {
    type AttributeElements,
    type CompatibilityFilter,
    type ExtendedFilter,
    type FilterItem,
    type IMeasureValueFilter as IBearMeasureValueFilter,
    type IRankingFilter as IBearRankingFilter,
} from "../../../typings/bear/bearTypes.js";
import { toBearRef, toScopedBearRef } from "../ObjRefConverter.js";
import { assertNoNulls } from "../utils.js";

function convertAttributeFilter(filter: IAttributeFilterWithSelection): FilterItem | null {
    /*
     * When sending either positive or negative filter and the in/notIn is empty, backend will bomb
     * with "Cannot parse MAQL expression(s): %s". Previously code was only throwing away empty negative
     * filters.
     * Skip `All` filters represented by negative filter with empty selection, have no effect on execution now.
     * Pass by positive empty filters `None` as they are handled later in execution by NO DATA error
     */
    if (isNegativeAttributeFilter(filter) && filterIsEmpty(filter)) {
        return null;
    }

    if (isNegativeAttributeFilter(filter)) {
        assertNoNulls(filter.negativeAttributeFilter.notIn);

        //NOTE: Currently in designer filters we are not support local identifiers, so we can safely assume that
        // that displayForm is ObjRef
        if (!isObjRef(filter.negativeAttributeFilter.displayForm)) {
            throw new Error("Expected negative attribute filter display form to be ObjRef");
        }

        return {
            negativeAttributeFilter: {
                displayForm: toBearRef(filter.negativeAttributeFilter.displayForm),
                notIn: filter.negativeAttributeFilter.notIn as AttributeElements, // checked above so the cast is ok
            },
        };
    }

    assertNoNulls(filter.positiveAttributeFilter.in);

    //NOTE: Currently in designer filters we are not support local identifiers, so we can safely assume that
    // that displayForm is ObjRef
    if (!isObjRef(filter.positiveAttributeFilter.displayForm)) {
        throw new Error("Expected positive attribute filter display form to be ObjRef");
    }

    return {
        positiveAttributeFilter: {
            displayForm: toBearRef(filter.positiveAttributeFilter.displayForm),
            in: filter.positiveAttributeFilter.in as AttributeElements, // checked above so the cast is ok
        },
    };
}

export function convertAbsoluteDateFilter({ absoluteDateFilter }: IAbsoluteDateFilter): FilterItem | null {
    if (absoluteDateFilter.from === undefined || absoluteDateFilter.to === undefined) {
        return null;
    }

    return {
        absoluteDateFilter: {
            dataSet: toBearRef(absoluteDateFilter.dataSet),
            from: String(absoluteDateFilter.from),
            to: String(absoluteDateFilter.to),
        },
    };
}

export function convertRelativeDateFilter(dateFilter: IRelativeDateFilter): FilterItem | null {
    const { relativeDateFilter } = dateFilter;
    if (relativeDateFilter.from === undefined) {
        return null;
    }

    const boundedFilter = isRelativeBoundedDateFilter(dateFilter)
        ? dateFilter.relativeDateFilter.boundedFilter
        : undefined;

    return {
        relativeDateFilter: {
            dataSet: toBearRef(relativeDateFilter.dataSet),
            granularity: relativeDateFilter.granularity,
            from: Number(relativeDateFilter.from),
            to: Number(relativeDateFilter.to),
            ...(boundedFilter ? { boundedFilter } : {}),
        },
    };
}

// Bear supports up to 6 decimal places
const MAX_DECIMAL_PLACES = 6;

function trimNumberToSupportedPrecision(num: number): number {
    return parseFloat(num.toFixed(MAX_DECIMAL_PLACES));
}

function trimConditionToSupportedPrecision(
    condition: MeasureValueFilterCondition,
): MeasureValueFilterCondition {
    if (isComparisonCondition(condition)) {
        const nullValuesProp =
            condition.comparison.treatNullValuesAs === null ||
            condition.comparison.treatNullValuesAs === undefined
                ? {}
                : { treatNullValuesAs: condition.comparison.treatNullValuesAs };

        return {
            comparison: {
                operator: condition.comparison.operator,
                value: trimNumberToSupportedPrecision(condition.comparison.value),
                ...nullValuesProp,
            },
        };
    } else {
        const nullValuesProp =
            condition.range.treatNullValuesAs === null || condition.range.treatNullValuesAs === undefined
                ? {}
                : { treatNullValuesAs: condition.range.treatNullValuesAs };

        return {
            range: {
                operator: condition.range.operator,
                from: trimNumberToSupportedPrecision(condition.range.from),
                to: trimNumberToSupportedPrecision(condition.range.to),
                ...nullValuesProp,
            },
        };
    }
}

export function convertMeasureValueFilter(filter: IMeasureValueFilter): IBearMeasureValueFilter | null {
    const legacyCondition = filter.measureValueFilter.condition;
    const conditions = filter.measureValueFilter.conditions?.length
        ? filter.measureValueFilter.conditions
        : legacyCondition
          ? [legacyCondition]
          : [];

    if (!conditions.length) {
        return null;
    }

    const dimensionalityProp = filter.measureValueFilter.dimensionality?.length
        ? {
              dimensionality: filter.measureValueFilter.dimensionality.map(toScopedBearRef),
          }
        : {};

    const { applyOnResult } = filter.measureValueFilter;
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };

    const trimmed = conditions.map(trimConditionToSupportedPrecision);

    return {
        measureValueFilter: {
            measure: toScopedBearRef(filter.measureValueFilter.measure),
            ...(trimmed.length === 1 ? { condition: trimmed[0] } : { conditions: trimmed }),
            ...dimensionalityProp,
            ...applyOnResultProp,
        },
    };
}

export function convertRankingFilter(filter: IRankingFilter): IBearRankingFilter | null {
    const { measure, attributes, operator, value, applyOnResult, strictLimitOfRows } = filter.rankingFilter;
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    const strictLimitOfRowsProp = strictLimitOfRows === undefined ? {} : { strictLimitOfRows };
    return {
        rankingFilter: {
            measures: [toScopedBearRef(measure)],
            attributes: attributes?.map(toScopedBearRef),
            operator,
            value,
            ...applyOnResultProp,
            ...strictLimitOfRowsProp,
        },
    };
}

export function convertFilter(filter: IFilter): ExtendedFilter | null {
    if (isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    }

    if (isRankingFilter(filter)) {
        return convertRankingFilter(filter);
    }

    if (isArbitraryAttributeFilter(filter) || isMatchAttributeFilter(filter)) {
        // These filter types are persisted in the VisualizationObject but are not supported
        // in the Bear AFM execution format and cannot be sent to the execution engine.
        return null;
    }

    return convertMeasureFilter(filter);
}

export function convertMeasureFilter(filter: IMeasureFilter): FilterItem | null {
    if (isAttributeFilterWithSelection(filter)) {
        return convertAttributeFilter(filter);
    } else if (isAbsoluteDateFilter(filter)) {
        return convertAbsoluteDateFilter(filter);
    } else if (isRelativeDateFilter(filter)) {
        return convertRelativeDateFilter(filter);
    }
    // New text-based attribute filter types (arbitrary, match) are handled in convertFilter() above
    // before convertMeasureFilter() is called, so they will not reach this fallthrough.
    return null;
}

export function convertFilters(filters: IFilter[]): CompatibilityFilter[] {
    return filters ? compact(filters.map(convertFilter)) : [];
}

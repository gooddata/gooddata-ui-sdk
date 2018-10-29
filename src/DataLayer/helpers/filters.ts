// (C) 2007-2018 GoodData Corporation
import cloneDeep = require('lodash/cloneDeep');
import isEmpty = require('lodash/isEmpty');
import { AFM } from '@gooddata/typings';
import {
    unwrapSimpleMeasure,
    getId,
    getDateFilterDateDataSet
} from '../utils/AfmUtils';

function isFilterItem(filter: AFM.CompatibilityFilter): filter is AFM.FilterItem {
    return !(filter as AFM.IExpressionFilter).value;
}

function isDateFilter(filter: AFM.CompatibilityFilter): filter is AFM.DateFilterItem {
    return !!(
        (filter as AFM.IAbsoluteDateFilter).absoluteDateFilter
        || (filter as AFM.IRelativeDateFilter).relativeDateFilter
    );
}

function getSelection(filter: AFM.CompatibilityFilter): string[] {
    if ((filter as AFM.IPositiveAttributeFilter).positiveAttributeFilter) {
        return (filter as AFM.IPositiveAttributeFilter).positiveAttributeFilter.in;
    }
    if ((filter as AFM.INegativeAttributeFilter).negativeAttributeFilter) {
        return (filter as AFM.INegativeAttributeFilter).negativeAttributeFilter.notIn;
    }
    return [];
}

export function isNotEmptyFilter(filter: AFM.CompatibilityFilter): boolean {
    return isDateFilter(filter) || !isEmpty(getSelection(filter));
}

export function mergeFilters(afm: AFM.IAfm, filters: AFM.FilterItem[]): AFM.IAfm {
    const cloned = cloneDeep(afm);

    return {
        ...cloned,
        filters: [...(cloned.filters || []), ...filters]
            .filter(isNotEmptyFilter)
    };
}

function measureHasDateFilter(simpleMeasure: AFM.ISimpleMeasure) {
    return (simpleMeasure.filters || []).some(isDateFilter);
}

function getGlobalDateFilters(afm: AFM.IAfm): AFM.DateFilterItem[] {
    const ret: AFM.DateFilterItem[] = [];
    for (const filter of (afm.filters || [])) {
        if (isFilterItem(filter) && isDateFilter(filter)) {
            ret.push(filter);
        }
    }
    return ret;
}

/**
 * AFM Date Filter logic:
 *
 * When:
 *   There is at least one metric with date filter & global date filter present
 * Then:
 *   1. To each metric add all global date filters if there isn't other date filter with the same date data set
 *   2. Remove global date filter
 * Otherwise
 *   Return provided AFM without any change
 */

export function handleMeasureDateFilter(afm: AFM.IAfm): AFM.IAfm {
    const globalDateFilters: AFM.DateFilterItem[] = getGlobalDateFilters(afm);
    if (!globalDateFilters.length) {
        return afm;
    }

    const measureDateFilterIsPresent = (afm.measures || []).some((item: AFM.IMeasure) => {
        const simpleMeasure = unwrapSimpleMeasure(item);
        if (!simpleMeasure) {
            return false;
        }
        return measureHasDateFilter(simpleMeasure);
    });

    if (!measureDateFilterIsPresent) {
        return afm;
    }

    return {
        ...afm,
        filters: (afm.filters || []).filter(f => isFilterItem(f) && !isDateFilter(f)),
        measures: (afm.measures || []).map((measure: AFM.IMeasure): AFM.IMeasure => {
            const simpleMeasure = unwrapSimpleMeasure(measure);
            if (simpleMeasure) {
                const simpleMeasureFilters = simpleMeasure.filters || [];
                return {
                    ...measure,
                    definition: {
                        measure: {
                            ...simpleMeasure,
                            filters: joinGlobalAndMeasureFilters(simpleMeasureFilters, globalDateFilters)
                        }
                    }
                };
            }

            return measure;
        })
    };
}

function joinGlobalAndMeasureFilters(
    measureFilters: AFM.FilterItem[], globalDateFilters: AFM.DateFilterItem[]
): AFM.FilterItem[] {
    const measureDateFilters: AFM.DateFilterItem[] = measureFilters.filter(isDateFilter);
    const globalDateFiltersToAdd = globalDateFilters.filter((globalDateFilter: AFM.DateFilterItem) => {
        const dateDataSetPresent = !measureDateFilters.some((measureDateFilter: AFM.DateFilterItem) => {
            const globalFilterDataSet = getDateFilterDateDataSet(globalDateFilter);
            const measureFilterDataSet = getDateFilterDateDataSet(measureDateFilter);
            return getId(globalFilterDataSet) === getId(measureFilterDataSet);
        });
        return dateDataSetPresent;
    });

    return [...measureFilters, ...globalDateFiltersToAdd];
}

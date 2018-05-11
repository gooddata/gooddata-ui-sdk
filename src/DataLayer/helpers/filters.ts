// (C) 2007-2018 GoodData Corporation
import cloneDeep = require('lodash/cloneDeep');
import isEmpty = require('lodash/isEmpty');
import { AFM } from '@gooddata/typings';
import { unwrapSimpleMeasure } from '../utils/AfmUtils';

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
 * Prerequisities: At least one metric (M1) with date filter & global date filter (D1)
 *
 * Steps:
 * 1. Remove date filter (D1) from global
 * 2. Add D1 to each metric without date filter
 * 3. M1 is untouched
 */
export function handleMeasureDateFilter(afm: AFM.IAfm): AFM.IAfm {
    const globalDateFilters = getGlobalDateFilters(afm);
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
        measures: (afm.measures || []).map((item: AFM.IMeasure): AFM.IMeasure => {
            const simpleMeasure = unwrapSimpleMeasure(item);
            if (!simpleMeasure || measureHasDateFilter(simpleMeasure)) {
                return item;
            }
            return {
                ...item,
                definition: {
                    measure: {
                        ...simpleMeasure,
                        filters: [...(simpleMeasure.filters || []), ...globalDateFilters]
                    }
                }
            };
        })
    };
}

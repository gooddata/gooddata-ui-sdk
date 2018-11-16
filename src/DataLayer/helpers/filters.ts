// (C) 2007-2018 GoodData Corporation
import cloneDeep = require('lodash/cloneDeep');
import isEmpty = require('lodash/isEmpty');
import { AFM } from '@gooddata/typings';

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

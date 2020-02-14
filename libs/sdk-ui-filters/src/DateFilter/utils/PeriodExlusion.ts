// (C) 2007-2019 GoodData Corporation

import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";

/**
 * Returns the date filter option with excludeCurrentPeriod applied if applicable.
 */
export const applyExcludeCurrentPeriod = (
    dateFilterOption: ExtendedDateFilters.DateFilterOption | undefined,
    excludeCurrentPeriod: boolean,
): ExtendedDateFilters.DateFilterOption => {
    if (!dateFilterOption || !excludeCurrentPeriod) {
        return dateFilterOption;
    }

    if (
        ExtendedDateFilters.isAllTimeDateFilter(dateFilterOption) ||
        ExtendedDateFilters.isAbsoluteDateFilterForm(dateFilterOption) ||
        ExtendedDateFilters.isAbsoluteDateFilterPreset(dateFilterOption) ||
        ExtendedDateFilters.isRelativeDateFilterForm(dateFilterOption)
    ) {
        return dateFilterOption;
    } else if (ExtendedDateFilters.isRelativeDateFilterPreset(dateFilterOption)) {
        const { from, to } = dateFilterOption;
        const shouldExcludeCurrent = to === 0 && from < to;

        return {
            ...dateFilterOption,
            from: shouldExcludeCurrent ? dateFilterOption.from - 1 : dateFilterOption.from,
            to: shouldExcludeCurrent ? -1 : to,
        };
    } else {
        throw new Error("Unknown date filter value type");
    }
};

export const canExcludeCurrentPeriod = (dateFilterOption: ExtendedDateFilters.DateFilterOption): boolean => {
    if (!dateFilterOption.visible) {
        return false;
    }
    if (ExtendedDateFilters.isRelativeDateFilterPreset(dateFilterOption)) {
        return dateFilterOption.to === 0 && dateFilterOption.from < dateFilterOption.to;
    }
    return false;
};

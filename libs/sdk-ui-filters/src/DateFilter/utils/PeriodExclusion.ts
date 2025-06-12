// (C) 2007-2022 GoodData Corporation

import {
    isAllTimeDateFilterOption,
    isAbsoluteDateFilterForm,
    isAbsoluteDateFilterPreset,
    isRelativeDateFilterForm,
    isRelativeDateFilterPreset,
} from "@gooddata/sdk-model";
import { DateFilterOption } from "../interfaces/index.js";

/**
 * Returns the date filter option with excludeCurrentPeriod applied if applicable.
 */
export const applyExcludeCurrentPeriod = (
    dateFilterOption: DateFilterOption | undefined,
    excludeCurrentPeriod: boolean,
): DateFilterOption => {
    if (!dateFilterOption || !excludeCurrentPeriod) {
        return dateFilterOption;
    }

    if (
        isAllTimeDateFilterOption(dateFilterOption) ||
        isAbsoluteDateFilterForm(dateFilterOption) ||
        isAbsoluteDateFilterPreset(dateFilterOption) ||
        isRelativeDateFilterForm(dateFilterOption)
    ) {
        return dateFilterOption;
    } else if (isRelativeDateFilterPreset(dateFilterOption)) {
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

export const canExcludeCurrentPeriod = (dateFilterOption: DateFilterOption): boolean => {
    if (!dateFilterOption.visible) {
        return false;
    }
    if (isRelativeDateFilterPreset(dateFilterOption)) {
        return dateFilterOption.to === 0 && dateFilterOption.from < dateFilterOption.to;
    }
    return false;
};

// (C) 2007-2026 GoodData Corporation

import {
    isAbsoluteDateFilterForm,
    isAbsoluteDateFilterPreset,
    isAllTimeDateFilterOption,
    isEmptyValuesDateFilterOption,
    isRelativeDateFilterForm,
    isRelativeDateFilterPreset,
} from "@gooddata/sdk-model";

import { type DateFilterOption } from "../interfaces/index.js";

/**
 * Returns the date filter option with excludeCurrentPeriod applied if applicable.
 */
export const applyExcludeCurrentPeriod = (
    dateFilterOption: DateFilterOption | undefined,
    excludeCurrentPeriod: boolean,
): DateFilterOption | undefined => {
    if (!dateFilterOption || !excludeCurrentPeriod) {
        return dateFilterOption;
    }

    if (
        isAllTimeDateFilterOption(dateFilterOption) ||
        isEmptyValuesDateFilterOption(dateFilterOption) ||
        isAbsoluteDateFilterForm(dateFilterOption) ||
        isAbsoluteDateFilterPreset(dateFilterOption) ||
        isRelativeDateFilterForm(dateFilterOption)
    ) {
        return dateFilterOption;
    } else if (isRelativeDateFilterPreset(dateFilterOption)) {
        const { from, to } = dateFilterOption;
        const excluded = excludeCurrentPeriodFromRange({ from, to }, true);
        const shouldExcludeCurrent = excluded.from !== from || excluded.to !== to;

        return {
            ...dateFilterOption,
            // When exclusion is applied, the selection no longer matches the original preset interval,
            // so the title should be computed from the adjusted interval instead of reusing preset's name.
            name: shouldExcludeCurrent ? "" : dateFilterOption.name,
            from: excluded.from,
            to: excluded.to,
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

/**
 * The numeric core of exclude-current-period: a current-period-ending range shifts back by one
 * period; anything else is returned unchanged (exclusion does not apply). This is what the filter
 * bar persists — no flag, just the shifted offsets.
 *
 * @alpha
 */
export const excludeCurrentPeriodFromRange = (
    range: { from: number; to: number },
    excludeCurrentPeriod: boolean,
): { from: number; to: number } =>
    excludeCurrentPeriod && range.to === 0 && range.from < range.to
        ? { from: range.from - 1, to: -1 }
        : range;

/**
 * Inverse of {@link excludeCurrentPeriodFromRange}: the current-period-ending range that would have
 * produced the stored offsets via exclusion, or undefined when the stored range cannot be an
 * exclusion result. Lets stored offsets be matched back to "preset + checked toggle".
 *
 * @alpha
 */
export const revertExcludedCurrentPeriodRange = (range: {
    from: number;
    to: number;
}): { from: number; to: number } | undefined =>
    range.to === -1 && range.from < range.to ? { from: range.from + 1, to: 0 } : undefined;

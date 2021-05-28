// (C) 2021 GoodData Corporation
import {
    IAbsoluteDateFilterPreset,
    IAllTimeDateFilterOption,
    IDashboardDateFilter,
    IRelativeDateFilterPreset,
    isDashboardDateFilter,
    OptionType,
} from "@gooddata/sdk-backend-spi";
import {
    DateFilterOption,
    IDateFilterOptionsByType,
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
} from "@gooddata/sdk-ui-filters";
import { createSelector } from "@reduxjs/toolkit";
import compact from "lodash/compact";
import flatten from "lodash/flatten";
import values from "lodash/values";
import { selectEffectiveDateFilterOptions, selectFilterContextFilters } from "../model";

const VIRTUAL_PRESET_IDENTIFIER = "GDC__VIRTUAL_PRESET";

const virtualPresetBase = {
    localIdentifier: VIRTUAL_PRESET_IDENTIFIER,
    name: "",
    visible: false,
};

interface IDateFilterOptionInfo {
    dateFilterOption: DateFilterOption;
    excludeCurrentPeriod: boolean;
}

export const effectiveDateFilterOptionInfoSelector = createSelector(
    [selectFilterContextFilters, selectEffectiveDateFilterOptions],
    (filters, dateFilterOptions) => {
        const dateFilter = filters.find(isDashboardDateFilter);
        return matchDateFilterToDateFilterOption(dateFilter, dateFilterOptions);
    },
);

/**
 * Tries to match a preset or a form with the provided value. Prioritizes presets over forms.
 * @param dateFilterValue Value to match against.
 */
export function matchDateFilterToDateFilterOption(
    dateFilter: IDashboardDateFilter | undefined,
    availableOptions: IDateFilterOptionsByType,
): IDateFilterOptionInfo {
    // no value means All Time, try matching against All time (if it is available) or create virtual preset for it
    if (!dateFilter) {
        const { allTime } = availableOptions;
        return allTime
            ? { dateFilterOption: allTime, excludeCurrentPeriod: false }
            : createVirtualPresetForStoredFilter(undefined);
    }
    // try matching the filter as is
    const matchingFilter = findDateFilterOptionByValue(dateFilter, availableOptions);
    if (matchingFilter) {
        return { dateFilterOption: matchingFilter, excludeCurrentPeriod: false };
    }
    // try matching the filter with excludeCurrentPeriod === true, but only for relativeFormPresets
    if (dateFilter.dateFilter.type === "relative" && dateFilter.dateFilter.to === "-1") {
        const filterToMatch: IDashboardDateFilter = {
            dateFilter: {
                ...dateFilter.dateFilter,
                from: (Number.parseInt(dateFilter.dateFilter.from!.toString(), 10) + 1).toString(10),
                to: "0",
            },
        };
        const matchingFilter = findDateFilterOptionByValueAndType(
            filterToMatch,
            availableOptions,
            "relativePreset",
        );
        if (matchingFilter) {
            return { dateFilterOption: matchingFilter, excludeCurrentPeriod: true };
        }
    }
    // the stored filter must be a form with custom values
    if (canReconstructFormForStoredFilter(availableOptions, dateFilter)) {
        return reconstructFormForStoredFilter(availableOptions, dateFilter);
    }

    // we cannot use the form because it is disabled or otherwise incompatible
    // -> we must create a virtual hidden preset
    return createVirtualPresetForStoredFilter(dateFilter);
}

function canReconstructFormForStoredFilter(
    options: IDateFilterOptionsByType,
    dateFilter: IDashboardDateFilter,
): boolean {
    switch (dateFilter.dateFilter.type) {
        case "absolute":
            return isDateFilterOptionVisible(options.absoluteForm);
        case "relative":
            return isDateFilterOptionVisible(options.relativeForm);
        default:
            throw new Error("Unknown dateFilterValue type");
    }
}

function reconstructFormForStoredFilter(
    options: IDateFilterOptionsByType,
    dateFilter: IDashboardDateFilter,
): IDateFilterOptionInfo {
    if (dateFilter.dateFilter.type === "absolute") {
        const dateFilterOption: IUiAbsoluteDateFilterForm = {
            ...options.absoluteForm!,
            from: dateFilter.dateFilter.from!.toString(),
            to: dateFilter.dateFilter.to!.toString(),
            type: "absoluteForm",
        };
        return { dateFilterOption, excludeCurrentPeriod: false };
    } else {
        const dateFilterOption: IUiRelativeDateFilterForm = {
            ...options.relativeForm!,
            from: Number.parseInt(dateFilter.dateFilter.from!.toString(), 10),
            to: Number.parseInt(dateFilter.dateFilter.to!.toString(), 10),
            granularity: dateFilter.dateFilter.granularity,
            type: "relativeForm",
        };
        return { dateFilterOption, excludeCurrentPeriod: false };
    }
}

function isDateFilterOptionVisible(option: DateFilterOption | undefined) {
    return !!(option && option.visible);
}

function findDateFilterOptionByValue(
    dateFilter: IDashboardDateFilter,
    dateFilterOptions: IDateFilterOptionsByType,
) {
    return getDateFilterOptionsFlattened(dateFilterOptions).find(filterMatchesData(dateFilter));
}

function findDateFilterOptionByValueAndType(
    dateFilter: IDashboardDateFilter,
    dateFilterOptions: IDateFilterOptionsByType,
    type: OptionType,
) {
    return getDateFilterOptionsFlattened(dateFilterOptions)
        .filter((option) => option.type === type)
        .find(filterMatchesData(dateFilter));
}

function getDateFilterOptionsFlattened(dateFilterOptions: IDateFilterOptionsByType) {
    const relativePresets = flatten(
        values(dateFilterOptions.relativePreset) as IRelativeDateFilterPreset[][],
    );
    // the order is significant here
    // the first visible filter is selected for new dashboards if none is specified in config
    return compact([
        dateFilterOptions.allTime,
        ...(dateFilterOptions.absolutePreset || []),
        ...relativePresets,
        dateFilterOptions.absoluteForm,
        dateFilterOptions.relativeForm,
    ]);
}

const filterMatchesData = (dateFilter: IDashboardDateFilter) => (filter: DateFilterOption) => {
    if (!filter) {
        return false;
    }

    const data = dateFilter.dateFilter;

    if (isAbsoluteDateFilterOption(filter)) {
        return data.type === "absolute" && filter.from === data.from && filter.to === data.to;
    }
    if (isRelativeDateFilterOption(filter)) {
        return (
            data.type === "relative" &&
            filter.from !== undefined &&
            filter.from.toString() === data.from &&
            filter.to !== undefined &&
            filter.to.toString() === data.to &&
            filter.granularity === data.granularity
        );
    }
    return false;
};

/**
 * Creates a virtual preset with values corresponding to a provided server-side value.
 * This is used in situations when a dashboard was saved with setting
 * that can no longer be reproduced by the available options (e.g. relativeForm was used and later, was disabled)
 * @param dateFilter
 */
function createVirtualPresetForStoredFilter(
    dateFilter: IDashboardDateFilter | undefined,
): IDateFilterOptionInfo {
    if (!dateFilter) {
        const dateFilterOption: IAllTimeDateFilterOption = {
            ...virtualPresetBase,
            type: "allTime",
        };
        return { dateFilterOption, excludeCurrentPeriod: false };
    }

    const { type, from, to, granularity } = dateFilter.dateFilter;

    if (type === "absolute") {
        const dateFilterOption: IAbsoluteDateFilterPreset = {
            ...virtualPresetBase,
            from: from!.toString(),
            to: to!.toString(),
            type: "absolutePreset",
        };
        return { dateFilterOption, excludeCurrentPeriod: false };
    } else {
        const dateFilterOption: IRelativeDateFilterPreset = {
            ...virtualPresetBase,
            from: Number.parseInt(from!.toString(), 10),
            to: Number.parseInt(to!.toString(), 10),
            granularity,
            type: "relativePreset",
        };
        return { dateFilterOption, excludeCurrentPeriod: false };
    }
}

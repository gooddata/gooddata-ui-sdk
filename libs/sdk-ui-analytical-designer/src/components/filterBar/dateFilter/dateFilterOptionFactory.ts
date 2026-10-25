// (C) 2022-2026 GoodData Corporation

import {
    type DateFilterGranularity,
    isAbsoluteDateFilterForm,
    isAllTimeDateFilterOption,
    isRelativeDateFilterPreset,
} from "@gooddata/sdk-model";
import {
    type DateFilterOption,
    type IUiAbsoluteDateFilterForm,
    type IUiRelativeDateFilterForm,
    isUiRelativeDateFilterForm,
} from "@gooddata/sdk-ui-filters";

import { ALL_TIME } from "../../../constants/presets.js";
import { type IDateFilterConfig } from "../../../store/filter_bar/filter_bar_types.js";

import { ALL_TIME_FILTER_OPTION } from "./defaultFilterOptions.js";
import { findRelativePresetByValue } from "./presets.js";

export interface IDateFilterOption {
    filterOption: DateFilterOption;
    excludeCurrentPeriod: boolean;
    isTimeForAbsoluteRangeEnabled?: boolean;
}

const virtualPresetBase = {
    name: "",
    visible: true,
};

const buildAllTimeOption = (): IDateFilterOption => {
    return {
        filterOption: ALL_TIME_FILTER_OPTION,
        excludeCurrentPeriod: false,
    };
};

const isRelativeFilter = (dateFilterValue: IDateFilterConfig) =>
    dateFilterValue.type === "relative" ||
    (typeof dateFilterValue.interval[0] === "number" && typeof dateFilterValue.interval[1] === "number");

const reconstructFormForStoredFilter = (
    dateFilterValue: IDateFilterConfig,
): IDateFilterOption | undefined => {
    if (dateFilterValue.type === "absolute") {
        const filterOption: IUiAbsoluteDateFilterForm = {
            ...virtualPresetBase,
            localIdentifier: "ABSOLUTE_FORM",
            from: dateFilterValue.interval[0] as string,
            to: dateFilterValue.interval[1] as string,
            type: "absoluteForm",
        };

        return {
            filterOption,
            excludeCurrentPeriod: false,
        };
    }
    if (isRelativeFilter(dateFilterValue)) {
        const filterOption: IUiRelativeDateFilterForm = {
            ...virtualPresetBase,
            localIdentifier: "RELATIVE_FORM",
            from: dateFilterValue.interval[0] as number,
            to: dateFilterValue.interval[1] as number,
            granularity: dateFilterValue.granularity as DateFilterGranularity,
            type: "relativeForm",
        };
        return { filterOption, excludeCurrentPeriod: false };
    }
    // Return undefined to maintain original functionality
    return undefined;
};

/**
 * Tries to match a preset or a form with the provided value. Prioritizes preset over form.
 * @param dateFilterValue - Value to match against.
 */
export const matchDateFilterValueToDateFilterOption = (
    dateFilterValue: IDateFilterConfig,
): IDateFilterOption | undefined => {
    // no value means All Time, create virtual preset for it
    if (!dateFilterValue || dateFilterValue.name === ALL_TIME) {
        return buildAllTimeOption();
    }
    // try matching the filter as is against presets
    const matchingFilter = findRelativePresetByValue(dateFilterValue);
    if (matchingFilter) {
        return { filterOption: matchingFilter, excludeCurrentPeriod: false };
    }
    // try matching the filter with excludeCurrentPeriod === true against presets
    if (isRelativeFilter(dateFilterValue) && dateFilterValue.interval[1] === -1) {
        const filterToMatch: IDateFilterConfig = {
            ...dateFilterValue,
            // interval is always number at this step, move "from" by 1 and set "to" from -1 to 0
            //  to include "this" period and replicate how the preset would look without excluded period
            interval: [(dateFilterValue.interval[0] as number) + 1, 0],
        };
        const matchingFilter = findRelativePresetByValue(filterToMatch);
        if (matchingFilter) {
            return { filterOption: matchingFilter, excludeCurrentPeriod: true };
        }
    }
    // the stored filter must be a form with custom values (absolute or relative)
    return reconstructFormForStoredFilter(dateFilterValue);
};

export const buildDateFilterValueFromDateFilterOption = (
    option: DateFilterOption,
): IDateFilterConfig | undefined => {
    if (isAllTimeDateFilterOption(option)) {
        return {
            name: ALL_TIME,
            interval: undefined,
            granularity: undefined,
        };
    }
    if (isAbsoluteDateFilterForm(option)) {
        return {
            type: "absolute",
            granularity: "GDC.time.date",
            interval: [option.from, option.to],
        };
    }
    if (isUiRelativeDateFilterForm(option) || isRelativeDateFilterPreset(option)) {
        return {
            type: "relative",
            granularity: option.granularity,
            interval: [option.from, option.to],
            name: option.name || option.localIdentifier,
            ...(option.boundedFilter ? { boundedFilter: option.boundedFilter } : {}),
        };
    }
    // Return undefined to maintain original functionality
    return undefined;
};

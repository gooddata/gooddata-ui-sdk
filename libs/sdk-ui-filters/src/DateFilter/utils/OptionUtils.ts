// (C) 2019-2023 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import {
    DateFilterOption,
    DateFilterRelativeOptionGroup,
    IDateFilterOptionsByType,
    isUiRelativeDateFilterForm,
} from "../interfaces/index.js";
import {
    DateFilterGranularity,
    IDateFilterOption,
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
    isRelativeDateFilterPreset,
} from "@gooddata/sdk-model";

export function getDateFilterOptionGranularity(dateFilterOption: DateFilterOption): DateFilterGranularity {
    return isUiRelativeDateFilterForm(dateFilterOption) || isRelativeDateFilterPreset(dateFilterOption)
        ? dateFilterOption.granularity
        : undefined;
}

function isDateFilterOptionVisible(option: IDateFilterOption) {
    return option?.visible;
}

function pickDateFilterOptionIfVisible<T extends IDateFilterOption>(option: T) {
    return isDateFilterOptionVisible(option) ? option : undefined;
}

function filterVisibleRelativePresets(
    relativePreset: DateFilterRelativeOptionGroup,
): DateFilterRelativeOptionGroup {
    return Object.keys(relativePreset).reduce(
        (
            filtered: { [key in DateFilterGranularity]?: IRelativeDateFilterPreset[] },
            granularity: DateFilterGranularity,
        ) => {
            const presetsOfGranularity: IRelativeDateFilterPreset[] = relativePreset[granularity];
            const visiblePresetsOfGranularity = presetsOfGranularity.filter(isDateFilterOptionVisible);

            if (visiblePresetsOfGranularity.length) {
                filtered[granularity] = visiblePresetsOfGranularity;
            }

            return filtered;
        },
        {},
    ) as DateFilterRelativeOptionGroup;
}

function removeEmptyKeysFromDateFilterOptions(
    dateFilterOptions: IDateFilterOptionsByType,
): IDateFilterOptionsByType {
    const { absoluteForm, absolutePreset, allTime, relativeForm, relativePreset } = dateFilterOptions;
    return {
        ...(allTime && { allTime }),
        ...(absoluteForm && { absoluteForm }),
        ...(!isEmpty(absolutePreset) && { absolutePreset }),
        ...(relativeForm && { relativeForm }),
        ...(!isEmpty(relativePreset) && { relativePreset }),
    };
}

/**
 * Returns dateFilterOptions with only items that have visible set to true.
 *
 * @param dateFilterOptions - options to filter
 * @public
 */
export function filterVisibleDateFilterOptions(
    dateFilterOptions: IDateFilterOptionsByType,
): IDateFilterOptionsByType {
    const allTime = pickDateFilterOptionIfVisible(dateFilterOptions.allTime);

    const absoluteForm = pickDateFilterOptionIfVisible(dateFilterOptions.absoluteForm);

    const relativeForm = pickDateFilterOptionIfVisible(dateFilterOptions.relativeForm);

    const absolutePreset = dateFilterOptions.absolutePreset?.filter(isDateFilterOptionVisible);

    const relativePreset =
        dateFilterOptions.relativePreset && filterVisibleRelativePresets(dateFilterOptions.relativePreset);

    return removeEmptyKeysFromDateFilterOptions({
        allTime,
        absoluteForm,
        absolutePreset,
        relativeForm,
        relativePreset,
    });
}

function sanitizePreset<T extends IAbsoluteDateFilterPreset | IRelativeDateFilterPreset>(option: T): T {
    if (option.from > option.to) {
        return {
            ...option,
            from: option.to,
            to: option.from,
        };
    }

    return option;
}

function sanitizeRelativePresets(
    relativePreset: DateFilterRelativeOptionGroup,
): DateFilterRelativeOptionGroup {
    return Object.keys(relativePreset).reduce(
        (
            filtered: { [key in DateFilterGranularity]?: IRelativeDateFilterPreset[] },
            granularity: DateFilterGranularity,
        ) => {
            const presetsOfGranularity: IRelativeDateFilterPreset[] = relativePreset[granularity];
            filtered[granularity] = presetsOfGranularity.map(sanitizePreset);

            return filtered;
        },
        {},
    ) as DateFilterRelativeOptionGroup;
}

/**
 * Returns dateFilterOptions with all the presets sanitized, i.e. having `from <= to`.
 * @param dateFilterOptions - options to sanitize
 */
export function sanitizePresetIntervals(
    dateFilterOptions: IDateFilterOptionsByType,
): IDateFilterOptionsByType {
    const absolutePreset = dateFilterOptions.absolutePreset?.map(sanitizePreset);

    const relativePreset =
        dateFilterOptions.relativePreset && sanitizeRelativePresets(dateFilterOptions.relativePreset);

    return removeEmptyKeysFromDateFilterOptions({
        ...dateFilterOptions,
        absolutePreset,
        relativePreset,
    });
}

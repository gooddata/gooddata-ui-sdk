// (C) 2019-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    type DateFilterGranularity,
    type IAbsoluteDateFilterPreset,
    type IDateFilterOption,
    type IRelativeDateFilterPreset,
    isRelativeDateFilterPreset,
} from "@gooddata/sdk-model";

import {
    type DateFilterOption,
    type DateFilterRelativeOptionGroup,
    type IDateFilterOptionsByType,
    isUiRelativeDateFilterForm,
} from "../interfaces/index.js";

export function getDateFilterOptionGranularity(
    dateFilterOption: DateFilterOption,
): DateFilterGranularity | undefined {
    return isUiRelativeDateFilterForm(dateFilterOption) || isRelativeDateFilterPreset(dateFilterOption)
        ? dateFilterOption.granularity
        : undefined;
}

function isDateFilterOptionVisible(option: IDateFilterOption) {
    return option?.visible;
}

function pickDateFilterOptionIfVisible<T extends IDateFilterOption>(option: T | undefined): T | undefined {
    return option && isDateFilterOptionVisible(option) ? option : undefined;
}

function filterVisibleRelativePresets(
    relativePreset: DateFilterRelativeOptionGroup,
): DateFilterRelativeOptionGroup {
    return (Object.keys(relativePreset) as DateFilterGranularity[]).reduce(
        (
            filtered: { [key in DateFilterGranularity]?: IRelativeDateFilterPreset[] },
            granularity: DateFilterGranularity,
        ) => {
            const presetsOfGranularity: IRelativeDateFilterPreset[] = relativePreset[granularity] ?? [];
            const visiblePresetsOfGranularity = presetsOfGranularity.filter(isDateFilterOptionVisible);

            if (visiblePresetsOfGranularity.length) {
                filtered[granularity] = visiblePresetsOfGranularity;
            }

            return filtered;
        },
        {},
    ) as DateFilterRelativeOptionGroup;
}

function removeEmptyKeysFromDateFilterOptions({
    absoluteForm,
    absolutePreset,
    allTime,
    emptyValues,
    relativeForm,
    relativePreset,
}: IDateFilterOptionsByType): IDateFilterOptionsByType {
    return {
        ...(allTime && { allTime }),
        ...(emptyValues && { emptyValues }),
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

    const emptyValues = pickDateFilterOptionIfVisible(dateFilterOptions.emptyValues);

    const absoluteForm = pickDateFilterOptionIfVisible(dateFilterOptions.absoluteForm);

    const relativeForm = pickDateFilterOptionIfVisible(dateFilterOptions.relativeForm);

    const absolutePreset = dateFilterOptions.absolutePreset?.filter(isDateFilterOptionVisible);

    const relativePreset =
        dateFilterOptions.relativePreset && filterVisibleRelativePresets(dateFilterOptions.relativePreset);

    return removeEmptyKeysFromDateFilterOptions({
        allTime,
        emptyValues,
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
    return (Object.keys(relativePreset) as DateFilterGranularity[]).reduce(
        (
            filtered: { [key in DateFilterGranularity]?: IRelativeDateFilterPreset[] },
            granularity: DateFilterGranularity,
        ) => {
            const presetsOfGranularity: IRelativeDateFilterPreset[] = relativePreset[granularity] ?? [];
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

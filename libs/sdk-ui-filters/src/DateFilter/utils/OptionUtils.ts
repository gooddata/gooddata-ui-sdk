// (C) 2019-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { DateFilterOption, DateFilterRelativeOptionGroup, IDateFilterOptionsByType } from "../interfaces";
import {
    DateFilterGranularity,
    IDateFilterOption,
    IRelativeDateFilterPreset,
    isRelativeDateFilterForm,
    isRelativeDateFilterPreset,
} from "@gooddata/sdk-backend-spi";

export function getDateFilterOptionGranularity(dateFilterOption: DateFilterOption): DateFilterGranularity {
    return isRelativeDateFilterForm(dateFilterOption) || isRelativeDateFilterPreset(dateFilterOption)
        ? dateFilterOption.granularity
        : undefined;
}

function isDateFilterOptionVisible(option: IDateFilterOption) {
    return option && option.visible;
}

function pickDateFilterOptionIfVisible<T extends IDateFilterOption>(option: T) {
    return isDateFilterOptionVisible(option) ? option : undefined;
}

function filterVisibleRelativePresets(
    relativePreset: DateFilterRelativeOptionGroup,
): DateFilterRelativeOptionGroup {
    return Object.keys(relativePreset).reduce((filtered: DateFilterRelativeOptionGroup, granularity) => {
        const presetsOfGranularity: IRelativeDateFilterPreset[] = relativePreset[granularity];
        const visiblePresetsOfGranularity = presetsOfGranularity.filter(isDateFilterOptionVisible);

        if (visiblePresetsOfGranularity.length) {
            filtered[granularity] = visiblePresetsOfGranularity;
        }

        return filtered;
    }, {});
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
 * @beta
 */
export function filterVisibleDateFilterOptions(
    dateFilterOptions: IDateFilterOptionsByType,
): IDateFilterOptionsByType {
    const allTime = pickDateFilterOptionIfVisible(dateFilterOptions.allTime);

    const absoluteForm = pickDateFilterOptionIfVisible(dateFilterOptions.absoluteForm);

    const relativeForm = pickDateFilterOptionIfVisible(dateFilterOptions.relativeForm);

    const absolutePreset =
        dateFilterOptions.absolutePreset &&
        dateFilterOptions.absolutePreset.filter(isDateFilterOptionVisible);

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

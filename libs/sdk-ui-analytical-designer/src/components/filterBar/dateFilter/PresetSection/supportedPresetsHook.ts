// (C) 2022-2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import { omit } from "lodash-es";

import {
    type DateFilterGranularity,
    type IRelativeDateFilterPreset,
    areObjRefsEqual,
    isDateFilterGranularity,
} from "@gooddata/sdk-model";
import {
    type DateFilterOption,
    type DateFilterRelativeOptionGroup,
    isUiRelativeDateFilterForm,
} from "@gooddata/sdk-ui-filters";

import { type IDecoratedDateDataset } from "../../../../models/decorated_date_dataset.js";
import { type IDateDatasetRefWithGranularities } from "../../../../typings/datasets.js";
import { type IDateFilterOption } from "../dateFilterOptionFactory.js";
import { ALL_TIME_FILTER_OPTION, RELATIVE_PERIOD_FILTER_OPTION } from "../defaultFilterOptions.js";

/**
 * Hook returns memoized DateFilterRelativeOptionGroup created by filtering out unsupported granularities from the provided `allRelativeDateFilterPresets`.
 * The granularities are taken from `dateDatasetRefsWithGranularities` based on the currently selected date dataset.
 *
 * Hook also returns a list of chronological granularities supported by the currently selected date dataset.
 *
 * @param allRelativeDateFilterPresets -
 * @param selectedDateDataset -
 * @param dateDatasetRefsWithGranularities -
 */
export const useSupportedDateFilterPresets = (
    allRelativeDateFilterPresets: DateFilterRelativeOptionGroup,
    selectedDateDataset: IDecoratedDateDataset,
    dateDatasetRefsWithGranularities: IDateDatasetRefWithGranularities[],
    isSecondsGranularityEnabled: boolean,
) => {
    return useMemo((): {
        supportedDateFilterPresets: DateFilterRelativeOptionGroup;
        supportedChronologicalGranularities: DateFilterGranularity[];
    } => {
        const currentDatasetGranularities =
            dateDatasetRefsWithGranularities.find(({ ref }) => areObjRefsEqual(ref, selectedDateDataset?.ref))
                ?.attributes || [];

        // When the enableSecondGranularities flag is off, second precision must not surface anywhere in the
        // UI even if the dataset still exposes GDC.time.second — mirroring the absolute-range gate and the
        // Dashboard app. Treat it as unsupported so it is dropped from both the presets and the granularities.
        const flagGatedGranularities = isSecondsGranularityEnabled ? [] : ["GDC.time.second"];

        const missingGranularities = Object.keys(allRelativeDateFilterPresets)
            .filter(
                (granularity) =>
                    !currentDatasetGranularities.some(
                        (attributeGranularity) => attributeGranularity.dateType === granularity,
                    ),
            )
            .concat(flagGatedGranularities);
        const supportedChronologicalGranularities = currentDatasetGranularities
            .map((attributeGranularity) => attributeGranularity.dateType)
            .filter(isDateFilterGranularity) // choose only chronological granularities compatible with SDK
            .filter((granularity) => !missingGranularities.includes(granularity));

        return {
            supportedDateFilterPresets: omit(allRelativeDateFilterPresets, missingGranularities),
            supportedChronologicalGranularities,
        };
    }, [
        selectedDateDataset,
        dateDatasetRefsWithGranularities,
        allRelativeDateFilterPresets,
        isSecondsGranularityEnabled,
    ]);
};

const defaultPreset: IDateFilterOption = {
    filterOption: ALL_TIME_FILTER_OPTION,
    excludeCurrentPeriod: false,
};

const isSupportedPresetSelected = (
    filter: DateFilterOption,
    dateFilterPresets: DateFilterRelativeOptionGroup,
) => {
    const flatPresets: IRelativeDateFilterPreset[] = Object.values(dateFilterPresets).flat();
    const isSupportedPresetSelected = flatPresets.some(
        (preset) => preset.localIdentifier === filter.localIdentifier,
    );
    return isSupportedPresetSelected || filter.type !== "relativePreset";
};

/**
 * Hook calls `resetCallback` function with default preset object when provided `selectedFilter` is relative
 *  preset, but it is not amongst the `supportedDateFilterPresets`.
 *
 * @param selectedFilter -
 * @param supportedDateFilterPresets -
 * @param resetCallback -
 */
export const useResetPresetWhenUnsupportedOneIsSelected = (
    selectedFilter: DateFilterOption,
    supportedDateFilterPresets: DateFilterRelativeOptionGroup,
    resetCallback: (filter: IDateFilterOption) => void,
) => {
    useEffect(() => {
        if (!isSupportedPresetSelected(selectedFilter, supportedDateFilterPresets)) {
            resetCallback(defaultPreset);
        }
    }, [selectedFilter, supportedDateFilterPresets, resetCallback]);
};

const defaultRelativeRange: IDateFilterOption = {
    filterOption: RELATIVE_PERIOD_FILTER_OPTION,
    excludeCurrentPeriod: false,
};

const isSupportedRelativeRangeSelected = (
    filter: DateFilterOption,
    supportedChronologicalGranularities: DateFilterGranularity[],
) => !isUiRelativeDateFilterForm(filter) || supportedChronologicalGranularities.includes(filter.granularity);

/**
 * Hook calls `resetCallback` function with default relative period option when provided `selectedFilter`
 *  is relative period option, but its granularity is not amongst `supportedChronologicalGranularities`.
 *
 * @param selectedFilter -
 * @param supportedChronologicalGranularities -
 * @param resetCallback -
 */
export const useResetRelativeRangeWhenUnsupportedOneIsSelected = (
    selectedFilter: DateFilterOption,
    supportedChronologicalGranularities: DateFilterGranularity[],
    resetCallback: (filter: IDateFilterOption) => void,
) => {
    useEffect(() => {
        if (!isSupportedRelativeRangeSelected(selectedFilter, supportedChronologicalGranularities)) {
            resetCallback(defaultRelativeRange);
        }
    }, [selectedFilter, supportedChronologicalGranularities, resetCallback]);
};

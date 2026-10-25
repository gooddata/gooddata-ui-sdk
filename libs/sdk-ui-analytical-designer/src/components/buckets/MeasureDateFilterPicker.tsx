// (C) 2026 GoodData Corporation

import { useState } from "react";

import {
    type IActiveCalendars,
    type WeekStart,
    areObjRefsEqual,
    isAllTimeDateFilterOption,
} from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { type DateFilterRelativeOptionGroup } from "@gooddata/sdk-ui-filters";

import { type IDecoratedDateDataset } from "../../models/decorated_date_dataset.js";
import { type IDecoratedDateDatasets } from "../../models/decorated_date_datasets.js";
import {
    type EmptyDateValuesFilterMode,
    type IAttributeFilter,
} from "../../store/filter_bar/filter_bar_types.js";
import { type IDateDatasetRefWithGranularities } from "../../typings/datasets.js";
import { AdditionalDateFilters } from "../filterBar/dateFilter/AdditionalFiltersSection/AdditionalDateFilters.js";
import { useAdditionalDateFiltersState } from "../filterBar/dateFilter/AdditionalFiltersSection/useAdditionalDateFiltersState.js";
import { ApplyButton } from "../filterBar/dateFilter/Buttons/ApplyButton.js";
import {
    useApplyButtonEnabled,
    useDisabledApplyButtonTooltip,
} from "../filterBar/dateFilter/Buttons/applyButtonHook.js";
import { CancelButton } from "../filterBar/dateFilter/Buttons/CancelButton.js";
import { datasetRefWithGranularitiesHasSeconds } from "../filterBar/dateFilter/dateDatasetGranularities.js";
import { DateDatasetSection } from "../filterBar/dateFilter/DateDatasetSection/DateDatasetSection.js";
import { type IDateFilterOption } from "../filterBar/dateFilter/dateFilterOptionFactory.js";
import { ALL_TIME_FILTER_OPTION } from "../filterBar/dateFilter/defaultFilterOptions.js";
import { PresetsSection } from "../filterBar/dateFilter/PresetSection/PresetsSection.js";

// A metric gets its date filter as All time the moment it is added, so the picker edits an existing
// filter; this only covers the render between the add and the store answering.
const NO_PERIOD: IDateFilterOption = { filterOption: ALL_TIME_FILTER_OPTION, excludeCurrentPeriod: false };

const NO_ADDITIONAL_FILTERS: IAttributeFilter[] = [];

export interface IMeasureDateFilterPickerProps {
    /**
     * The metric's stored date filter; undefined only between adding it and the store answering.
     */
    filter: IDateFilterOption | undefined;
    /**
     * The date dataset picked in the open dropdown; it is committed only on Apply.
     */
    dateDataset: IDecoratedDateDataset;
    /**
     * The date dataset the stored filter uses.
     */
    appliedDateDataset: IDecoratedDateDataset | undefined;
    dateDatasets: IDecoratedDateDatasets;
    onDateDatasetChange: (dateDataset: IDecoratedDateDataset) => void;
    loadDateDatasets: () => void;
    isDateDatasetsDropdownLoaded: boolean;
    enableUnavailableItemsVisibility: boolean;
    relativeDateFilterPresets: DateFilterRelativeOptionGroup;
    dateDatasetRefsWithGranularities: IDateDatasetRefWithGranularities[];
    dateFormat: string;
    isTimeForAbsoluteRangeEnabled: boolean;
    isSecondsGranularityEnabled: boolean;
    weekStart?: WeekStart;
    activeCalendars?: IActiveCalendars;
    /**
     * The metric's stored additional date filters: its attribute filters on the date dataset's own
     * attributes, in the shape the filter bar's additional-filter components edit.
     */
    additionalDateAttributeFilters?: IAttributeFilter[];
    /**
     * Whether the backend can serve elements of generic date attributes; without it the additional
     * filters section is not offered, as in the filter bar.
     */
    areAdditionalDateFiltersSupported?: boolean;
    /**
     * The metric's stored empty date values mode; offered in the additional filters section like on the
     * filter bar, so it needs `areAdditionalDateFiltersSupported` as well.
     */
    emptyDateValuesFilter?: EmptyDateValuesFilterMode;
    onApply: (
        filter: IDateFilterOption,
        additionalDateAttributeFilters: IAttributeFilter[],
        emptyDateValuesFilter: EmptyDateValuesFilterMode | undefined,
    ) => void;
    onCancel: () => void;
}

/**
 * Metric date filter dropdown built from the same sections as the insight date filter picker in the filter
 * bar, without over-time comparison.
 */
export function MeasureDateFilterPicker({
    filter,
    dateDataset,
    appliedDateDataset,
    dateDatasets,
    onDateDatasetChange,
    loadDateDatasets,
    isDateDatasetsDropdownLoaded,
    enableUnavailableItemsVisibility,
    relativeDateFilterPresets,
    dateDatasetRefsWithGranularities,
    dateFormat,
    isTimeForAbsoluteRangeEnabled,
    isSecondsGranularityEnabled,
    weekStart,
    activeCalendars,
    additionalDateAttributeFilters = NO_ADDITIONAL_FILTERS,
    areAdditionalDateFiltersSupported = false,
    emptyDateValuesFilter,
    onApply,
    onCancel,
}: IMeasureDateFilterPickerProps) {
    const originalFilter = filter ?? NO_PERIOD;
    const [selectedFilter, setSelectedFilter] = useState(originalFilter);
    const {
        selectedAdditionalDateFilters,
        setSelectedAdditionalDateFilters,
        selectedEmptyDateValuesFilterMode,
        setSelectedEmptyDateValuesFilterMode,
        currentMigratedFilters,
        isOtherFiltersDisabled,
        migrateToDateDataset,
        dismissMigratedFilters,
    } = useAdditionalDateFiltersState({
        additionalDateFilters: additionalDateAttributeFilters,
        emptyDateValuesFilterMode: emptyDateValuesFilter,
    });

    const isAllTime = isAllTimeDateFilterOption(selectedFilter.filterOption);
    const isSecondsForAbsoluteRangeEnabled =
        isSecondsGranularityEnabled &&
        datasetRefWithGranularitiesHasSeconds(dateDatasetRefsWithGranularities, dateDataset.ref);

    // Without a stored filter, switching the dataset alone changes nothing that could be applied.
    const isChangeApplicable = useApplyButtonEnabled(
        selectedFilter,
        originalFilter,
        dateDataset,
        filter ? appliedDateDataset : dateDataset,
        OverTimeComparisonTypes.NOTHING,
        OverTimeComparisonTypes.NOTHING,
        [],
        [],
        selectedAdditionalDateFilters,
        additionalDateAttributeFilters,
        true,
        selectedEmptyDateValuesFilterMode,
        emptyDateValuesFilter,
    );
    const isApplyEnabled = isChangeApplicable;
    const applyButtonTooltip = useDisabledApplyButtonTooltip(
        selectedFilter.filterOption,
        OverTimeComparisonTypes.NOTHING,
        true,
        selectedEmptyDateValuesFilterMode,
    );

    const apply = () => {
        if (isApplyEnabled) {
            // like the filter bar, "Only" forces All time and drops the additional filters
            const isOnlyEmptyValues = selectedEmptyDateValuesFilterMode === "only";
            onApply(
                isOnlyEmptyValues ? NO_PERIOD : selectedFilter,
                isOnlyEmptyValues ? [] : selectedAdditionalDateFilters,
                selectedEmptyDateValuesFilterMode,
            );
        }
    };

    // Same as the filter bar: a dataset change re-points the additional filters at the new dataset's matching
    // attributes and marks the ones it has to drop.
    const handleDateDatasetChange = (nextDateDataset: IDecoratedDateDataset) => {
        if (!areObjRefsEqual(nextDateDataset.ref, dateDataset.ref)) {
            migrateToDateDataset(nextDateDataset.ref, dateDatasetRefsWithGranularities);
        }
        onDateDatasetChange(nextDateDataset);
    };

    // "Only" empty values stands alone: besides locking the other sections it resets their local state to
    // All time without additional filters right away, not just on Apply.
    const handleEmptyDateValuesFilterModeChange = (mode: EmptyDateValuesFilterMode | undefined) => {
        setSelectedEmptyDateValuesFilterMode(mode);
        if (mode === "only") {
            setSelectedFilter(NO_PERIOD);
            setSelectedAdditionalDateFilters([]);
            dismissMigratedFilters();
        }
    };

    return (
        <>
            <DateDatasetSection
                selectedDateDataset={dateDataset}
                dateDatasets={dateDatasets}
                onChange={handleDateDatasetChange}
                loadDateDatasets={loadDateDatasets}
                isDateDatasetsDropdownLoaded={isDateDatasetsDropdownLoaded}
                enableUnavailableItemsVisibility={enableUnavailableItemsVisibility}
            />
            <div className="adi-date-filter-body s-adi-date-filter-body">
                <PresetsSection
                    filter={selectedFilter}
                    onChange={setSelectedFilter}
                    onEdit={dismissMigratedFilters}
                    relativeDateFilterPresets={relativeDateFilterPresets}
                    dateDataset={dateDataset}
                    dateDatasetRefsWithGranularities={dateDatasetRefsWithGranularities}
                    dateFormat={dateFormat}
                    isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                    isSecondsForAbsoluteRangeEnabled={isSecondsForAbsoluteRangeEnabled}
                    isSecondsGranularityEnabled={isSecondsGranularityEnabled}
                    weekStart={weekStart}
                    submitForm={apply}
                    isDisabled={isOtherFiltersDisabled}
                    activeCalendars={activeCalendars}
                />
                {areAdditionalDateFiltersSupported ? (
                    <AdditionalDateFilters
                        dateDataset={dateDataset}
                        dateDatasetRefsWithGranularities={dateDatasetRefsWithGranularities}
                        additionalDateAttributeFilters={selectedAdditionalDateFilters}
                        migratedAdditionalFilters={currentMigratedFilters}
                        emptyDateValuesFilterMode={selectedEmptyDateValuesFilterMode}
                        onFiltersUpdate={setSelectedAdditionalDateFilters}
                        onMigratedFiltersDismiss={dismissMigratedFilters}
                        onEmptyDateValuesFilterModeChange={handleEmptyDateValuesFilterModeChange}
                        isDisabled={isOtherFiltersDisabled}
                        isAllTime={isAllTime}
                        showDateGranularities
                    />
                ) : null}
            </div>
            <div className="filter-picker-buttons">
                <CancelButton onClick={onCancel} />
                <ApplyButton onClick={apply} isEnabled={isApplyEnabled} tooltip={applyButtonTooltip} />
            </div>
        </>
    );
}

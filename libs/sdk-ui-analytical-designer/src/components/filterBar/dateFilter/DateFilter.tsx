// (C) 2022-2026 GoodData Corporation

import { useCallback, useRef, useState } from "react";

import { isEqual } from "lodash-es";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { type ObjRef, areObjRefsEqual, isAllTimeDateFilterOption } from "@gooddata/sdk-model";
import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";
import { normalizeSelectedFilterOption } from "@gooddata/sdk-ui-filters/internal";

import { type IDecoratedDateDataset } from "../../../models/decorated_date_dataset.js";
import { loadDateDatasetsToDateDropdown } from "../../../sagas/date_datasets/date_datasets_actions.js";
import { setMigratedAdditionalFilters } from "../../../store/filter_bar/filter_bar_actions.js";
import { type EmptyDateValuesFilterMode } from "../../../store/filter_bar/filter_bar_types.js";
import { type AppDispatch, type IAppState } from "../../../store/types.js";

import { AdditionalDateFilters } from "./AdditionalFiltersSection/AdditionalDateFilters.js";
import { useAdditionalDateFiltersState } from "./AdditionalFiltersSection/useAdditionalDateFiltersState.js";
import { ApplyButton } from "./Buttons/ApplyButton.js";
import { useApplyButtonEnabled, useDisabledApplyButtonTooltip } from "./Buttons/applyButtonHook.js";
import { CancelButton } from "./Buttons/CancelButton.js";
import { STATIC_DATE_RANGE_BUTTON_LABEL_FORMAT } from "./constants.js";
import { datasetRefWithGranularitiesHasSeconds } from "./dateDatasetGranularities.js";
import { DateDatasetSection } from "./DateDatasetSection/DateDatasetSection.js";
import { ALL_TIME_FILTER_OPTION } from "./defaultFilterOptions.js";
import { FilterDropdown } from "./FilterDropdown/FilterDropdown.js";
import { PresetsSection } from "./PresetSection/PresetsSection.js";
import { selectDateFilterProps } from "./selectors.js";
import { TimeComparisonSection } from "./TimeComparisonSection/TimeComparisonSection.js";
import { type IDateFilterProps } from "./types.js";

const isValidDateDatasetSelected = (
    selectedDateDataset: IDecoratedDateDataset,
    dateBucketItemDateDatasetRefs: ObjRef[],
) => {
    const areDateBucketItemsEmpty = dateBucketItemDateDatasetRefs.length <= 0;
    const hasSomeCommonDateDatasets = dateBucketItemDateDatasetRefs.some(
        (dateBucketItemDateDatasetRef: ObjRef) =>
            areObjRefsEqual(dateBucketItemDateDatasetRef, selectedDateDataset.ref),
    );
    return areDateBucketItemsEmpty || hasSomeCommonDateDatasets;
};

export function DateFilter(ownProps: IDateFilterProps) {
    const { onApply, onClose, className, isDragged, isAutoOpen = false } = ownProps;

    const {
        filter,
        relativeDateFilterPresets,
        dateDataset,
        dateDatasets,
        dateDatasetRefsWithGranularities,
        dateFormat,
        timeComparisonMeasures,
        supportedTimeComparisonTypes,
        timeComparisonType,
        timeComparisonCompatibleMeasures,
        isUsedByInsight,
        dateBucketItemDateDatasetRefs,
        isDateDatasetsDropdownLoaded,
        areGenericDateAttributeElementsSupported,
        additionalDateAttributeFilters,
        additionalDateFilterLabels,
        migratedAdditionalFilters,
        isTimeForAbsoluteRangeEnabled,
        isSecondsGranularityEnabled,
        formatLocale,
        weekStart,
        enableUnavailableItemsVisibility,
        storedEmptyDateValuesFilter,
        isFirstDateFilter,
        activeCalendars,
    } = useSelector((state: IAppState) => selectDateFilterProps(state, ownProps), shallowEqual);

    const dispatch = useDispatch<AppDispatch>();
    const loadDateDatasets = useCallback(
        (ignoreDateDataset: boolean) => dispatch(loadDateDatasetsToDateDropdown(ignoreDateDataset)),
        [dispatch],
    );

    // A filter the user just added mounts with its picker open (the add and the auto-open hand-over land
    // in one render), and the local selections below start from the stored filter either way. Read at
    // mount only: a later flip of isAutoOpen only ever goes true -> false (another filter took the
    // hand-over, or this picker closed), which needs no reaction.
    const [isDropdownOpen, setDropdownOpen] = useState(isAutoOpen);
    const [selectedFilter, setSelectedFilter] = useState(filter);
    const [selectedDateDataset, setSelectedDateDataset] = useState(dateDataset);
    const [selectedTimeComparison, setSelectedTimeComparison] = useState(timeComparisonType);
    const [selectedTimeComparisonMeasures, setSelectedTimeComparisonMeasures] =
        useState(timeComparisonMeasures);
    const {
        selectedAdditionalDateFilters,
        setSelectedAdditionalDateFilters,
        selectedEmptyDateValuesFilterMode,
        setSelectedEmptyDateValuesFilterMode,
        currentMigratedFilters,
        setCurrentMigratedFilters,
        isOtherFiltersDisabled,
        migrateToDateDataset,
        dismissMigratedFilters,
    } = useAdditionalDateFiltersState({
        additionalDateFilters: additionalDateAttributeFilters,
        emptyDateValuesFilterMode: storedEmptyDateValuesFilter,
        migratedFilters: migratedAdditionalFilters,
    });

    const lastMigratedFilters = useRef(migratedAdditionalFilters);

    if (!isEqual(migratedAdditionalFilters, lastMigratedFilters.current)) {
        setCurrentMigratedFilters(migratedAdditionalFilters);
    }
    lastMigratedFilters.current = migratedAdditionalFilters;

    // Seconds precision in the absolute range is offered only when the global gate is on AND the LOCALLY
    // selected date dataset (which can change in the open dropdown before Apply) exposes GDC.time.second — so
    // switching datasets updates seconds availability immediately, not only after Apply.
    const isSecondsForAbsoluteRangeEnabled =
        isSecondsGranularityEnabled &&
        (selectedDateDataset
            ? datasetRefWithGranularitiesHasSeconds(dateDatasetRefsWithGranularities, selectedDateDataset.ref)
            : dateDatasetRefsWithGranularities.some((dataset) =>
                  dataset.attributes.some((attribute) => attribute.dateType === "GDC.time.second"),
              ));

    // Button label reflects the applied filter, so seconds in the title follow the applied dataset
    // rather than a dataset the user may have selected in the open dropdown but not yet applied.
    const isSecondsForAppliedFilterButton =
        isSecondsGranularityEnabled &&
        datasetRefWithGranularitiesHasSeconds(dateDatasetRefsWithGranularities, dateDataset?.ref);

    const isAllTime = isAllTimeDateFilterOption(selectedFilter.filterOption);
    const isValidDateDataset = isValidDateDatasetSelected(selectedDateDataset, dateBucketItemDateDatasetRefs);

    const applyButtonTooltip = useDisabledApplyButtonTooltip(
        selectedFilter.filterOption,
        selectedTimeComparison,
        isValidDateDataset,
        selectedEmptyDateValuesFilterMode,
    );

    const isApplyEnabled = useApplyButtonEnabled(
        selectedFilter,
        filter,
        selectedDateDataset,
        dateDataset,
        selectedTimeComparison,
        timeComparisonType,
        selectedTimeComparisonMeasures,
        timeComparisonMeasures,
        selectedAdditionalDateFilters,
        additionalDateAttributeFilters,
        isValidDateDataset,
        selectedEmptyDateValuesFilterMode,
        storedEmptyDateValuesFilter,
    );

    const handleOnOpen = () => {
        setDropdownOpen(true);
        setSelectedFilter(filter);
        setSelectedDateDataset(dateDataset);
        setSelectedTimeComparison(timeComparisonType);
        setSelectedTimeComparisonMeasures(timeComparisonMeasures);
        setSelectedAdditionalDateFilters(additionalDateAttributeFilters);
        setCurrentMigratedFilters(migratedAdditionalFilters);
        setSelectedEmptyDateValuesFilterMode(storedEmptyDateValuesFilter);
    };

    const handleOnClose = () => {
        setDropdownOpen(false);
        onClose();
    };

    const handleOnApply = () => {
        const { filterOption, excludeCurrentPeriod } = selectedFilter;

        // When "Only" empty values is selected, force All time, remove additional filters, and reset comparison
        const isOnlyEmptyValues = selectedEmptyDateValuesFilterMode === "only";
        const effectiveFilterOption = isOnlyEmptyValues ? ALL_TIME_FILTER_OPTION : filterOption;
        const effectiveAdditionalFilters = isOnlyEmptyValues ? [] : selectedAdditionalDateFilters;
        // All time doesn't support exclude current period
        const effectiveExcludeCurrentPeriod = isOnlyEmptyValues ? false : excludeCurrentPeriod;
        // Reset time comparison when "Only" is selected
        const effectiveTimeComparison = isOnlyEmptyValues
            ? OverTimeComparisonTypes.NOTHING
            : selectedTimeComparison;
        const effectiveTimeComparisonMeasures = isOnlyEmptyValues ? [] : selectedTimeComparisonMeasures;

        const normalizedFilterOption = normalizeSelectedFilterOption(effectiveFilterOption);
        onApply({
            dateDatasetRef: selectedDateDataset.ref,
            additionalDateAttributeFilters: effectiveAdditionalFilters,
            overTimeComparisonType: effectiveTimeComparison,
            overTimeComparisonMeasures: effectiveTimeComparisonMeasures,
            filter: DateFilterHelpers.applyExcludeCurrentPeriod(
                normalizedFilterOption,
                effectiveExcludeCurrentPeriod,
            ),
            isCurrentPeriodExcluded: effectiveExcludeCurrentPeriod,
            emptyDateValuesFilter: selectedEmptyDateValuesFilterMode,
        });
        handleOnClose();
    };

    const handleOnDateDataset = (newDateDataset: IDecoratedDateDataset) => {
        if (!areObjRefsEqual(newDateDataset.ref, selectedDateDataset.ref)) {
            migrateToDateDataset(newDateDataset.ref, dateDatasetRefsWithGranularities);
            setSelectedDateDataset(newDateDataset);
        }
    };

    // The warning is dismissed as a whole: the marks of a change made in this open picker are local,
    // the ones of a change the date bucket item drove live in the store and feed the button tooltip.
    const onMigratedFiltersDismiss = () => {
        dismissMigratedFilters();
        if (migratedAdditionalFilters.length > 0) {
            dispatch(setMigratedAdditionalFilters([]));
        }
    };

    // Any edit of the filter acknowledges the warning, not only one of the additional filters.
    const handleTimeComparisonTypeSelected = (type: OverTimeComparisonType) => {
        setSelectedTimeComparison(type);
        onMigratedFiltersDismiss();
    };

    const handleTimeComparisonMeasuresSelected = (measureLocalIdentifiers: string[]) => {
        setSelectedTimeComparisonMeasures(measureLocalIdentifiers);
        onMigratedFiltersDismiss();
    };

    // "Only" empty values stands alone: besides locking the other sections it resets their local state to
    // All time without additional filters or time comparison right away, not just on Apply.
    const handleEmptyDateValuesFilterModeChange = (mode: EmptyDateValuesFilterMode | undefined) => {
        setSelectedEmptyDateValuesFilterMode(mode);
        if (mode === "only") {
            setSelectedFilter({ filterOption: ALL_TIME_FILTER_OPTION, excludeCurrentPeriod: false });
            setSelectedAdditionalDateFilters([]);
            setSelectedTimeComparison(OverTimeComparisonTypes.NOTHING);
            setSelectedTimeComparisonMeasures([]);
            onMigratedFiltersDismiss();
        }
    };

    const filterDropdownDateFormat = formatLocale ? dateFormat : STATIC_DATE_RANGE_BUTTON_LABEL_FORMAT;

    return (
        // Component uses original props and not the current state (filter, compare related stuff, dataset,
        //  additional filters) as it forwards them to filter button that should change only when Apply
        //  button is clicked.
        <FilterDropdown
            filter={filter}
            className={className}
            onOpen={handleOnOpen}
            onClose={handleOnClose}
            isOpen={isDropdownOpen}
            overTimeComparisonSummary={
                isFirstDateFilter
                    ? {
                          type: timeComparisonType,
                          compatibleMeasuresCount: timeComparisonCompatibleMeasures.length,
                          selectedMeasuresCount: timeComparisonMeasures.length,
                      }
                    : null
            }
            additionalDateFilterLabels={additionalDateFilterLabels}
            emptyDateValuesFilterMode={storedEmptyDateValuesFilter}
            isDragged={isDragged}
            datasetTitle={dateDataset?.title} // can be undefined when filter is dragged to trash
            isUsedByInsight={isUsedByInsight}
            migratedAdditionalFilters={migratedAdditionalFilters}
            dateFormat={filterDropdownDateFormat}
            isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
            isSecondsForAbsoluteRangeEnabled={isSecondsForAppliedFilterButton}
        >
            <DateDatasetSection
                selectedDateDataset={selectedDateDataset}
                dateDatasets={dateDatasets}
                onChange={handleOnDateDataset}
                loadDateDatasets={loadDateDatasets}
                isDateDatasetsDropdownLoaded={isDateDatasetsDropdownLoaded}
                enableUnavailableItemsVisibility={enableUnavailableItemsVisibility}
            />
            <div className="adi-date-filter-body s-adi-date-filter-body">
                <PresetsSection
                    filter={selectedFilter}
                    onChange={setSelectedFilter}
                    onEdit={onMigratedFiltersDismiss}
                    relativeDateFilterPresets={relativeDateFilterPresets}
                    dateDataset={selectedDateDataset}
                    dateDatasetRefsWithGranularities={dateDatasetRefsWithGranularities}
                    dateFormat={dateFormat}
                    isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                    isSecondsForAbsoluteRangeEnabled={isSecondsForAbsoluteRangeEnabled}
                    isSecondsGranularityEnabled={isSecondsGranularityEnabled}
                    weekStart={weekStart}
                    submitForm={handleOnApply}
                    isDisabled={isOtherFiltersDisabled}
                    activeCalendars={activeCalendars}
                />
                {areGenericDateAttributeElementsSupported ? (
                    <AdditionalDateFilters
                        dateDataset={selectedDateDataset}
                        dateDatasetRefsWithGranularities={dateDatasetRefsWithGranularities}
                        additionalDateAttributeFilters={
                            isFirstDateFilter ? selectedAdditionalDateFilters : []
                        }
                        migratedAdditionalFilters={currentMigratedFilters}
                        emptyDateValuesFilterMode={selectedEmptyDateValuesFilterMode}
                        onFiltersUpdate={setSelectedAdditionalDateFilters}
                        onMigratedFiltersDismiss={onMigratedFiltersDismiss}
                        onEmptyDateValuesFilterModeChange={handleEmptyDateValuesFilterModeChange}
                        isDisabled={isOtherFiltersDisabled}
                        isAllTime={isAllTime}
                        showDateGranularities={isFirstDateFilter}
                    />
                ) : null}

                <TimeComparisonSection
                    selectedType={selectedTimeComparison}
                    selectedMeasureIds={selectedTimeComparisonMeasures}
                    onTypeSelected={handleTimeComparisonTypeSelected}
                    onMeasuresSelected={handleTimeComparisonMeasuresSelected}
                    compatibleMeasures={timeComparisonCompatibleMeasures}
                    supportedTypes={supportedTimeComparisonTypes}
                    isAllTimeDateFilter={isAllTime}
                    isPoPAvailable={isValidDateDataset}
                    isSectionHidden={!isFirstDateFilter}
                    isDisabled={isOtherFiltersDisabled}
                />
            </div>
            <div className="filter-picker-buttons">
                <CancelButton onClick={handleOnClose} />
                <ApplyButton
                    onClick={handleOnApply}
                    isEnabled={isApplyEnabled}
                    tooltip={applyButtonTooltip}
                />
            </div>
        </FilterDropdown>
    );
}

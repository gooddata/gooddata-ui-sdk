// (C) 2022-2026 GoodData Corporation

import moment from "moment";
import { useIntl } from "react-intl";

import { areObjRefsEqual, isAllTimeDateFilterOption } from "@gooddata/sdk-model";
import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import {
    type DateFilterOption,
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
} from "@gooddata/sdk-ui-filters";
import { _isEqual } from "@gooddata/util";

import { type IDecoratedDateDataset } from "../../../../models/decorated_date_dataset.js";
import {
    type EmptyDateValuesFilterMode,
    type IAttributeFilter,
} from "../../../../store/filter_bar/filter_bar_types.js";
import { type IDateFilterOption } from "../dateFilterOptionFactory.js";

const isAllTimeSelectedAndTimeComparisonApplied = (
    selectedFilter: DateFilterOption,
    selectedTimeComparisonType: OverTimeComparisonType,
) =>
    isAllTimeDateFilterOption(selectedFilter) &&
    (OverTimeComparisonTypes.PREVIOUS_PERIOD === selectedTimeComparisonType ||
        OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR === selectedTimeComparisonType);

const areSameMeasuresSelected = (
    selectedComparisonMeasures: string[],
    originalComparisonMeasures: string[],
) => _isEqual(selectedComparisonMeasures.slice().sort(), originalComparisonMeasures.slice().sort());

/**
 * Include with a period works only as the date filter's own empty values handling; the legacy
 * representation supports it with All time alone.
 */
const isEmptyValuesIncludeInvalid = (
    filterOption: DateFilterOption,
    mode: EmptyDateValuesFilterMode | undefined,
    isIncludeWithPeriodAllowed: boolean,
) => mode === "include" && !isIncludeWithPeriodAllowed && !isAllTimeDateFilterOption(filterOption);

const isEndTimeAfterOrAtStartTime = (start: string, end: string) => moment(start) <= moment(end);

const isValidAbsoluteDateRange = (selectedFilter: DateFilterOption) =>
    !isAbsoluteDateFilterOption(selectedFilter) ||
    (selectedFilter.from !== undefined &&
        selectedFilter.to !== undefined &&
        isEndTimeAfterOrAtStartTime(selectedFilter.from, selectedFilter.to));

const isValidFloatingDateRange = (selectedFilter: DateFilterOption) =>
    !isRelativeDateFilterOption(selectedFilter) ||
    (selectedFilter.from !== undefined && selectedFilter.to !== undefined);

/**
 * The mode as it is saved: include on All time is the default and is not stored, so it equals no mode.
 * Any other mode is stored as chosen, so choosing it is a change even when it matches the backend default.
 */
const getStoredEmptyDateValuesFilterMode = (
    mode: EmptyDateValuesFilterMode | undefined,
    filterOption: DateFilterOption,
): EmptyDateValuesFilterMode | undefined =>
    mode === "include" && isAllTimeDateFilterOption(filterOption) ? undefined : mode;

const isDialogStateChanged = (
    selectedFilter: IDateFilterOption,
    originalFilter: IDateFilterOption,
    selectedDateDataset: IDecoratedDateDataset,
    originalDateDataset: IDecoratedDateDataset,
    selectedTimeComparisonType: OverTimeComparisonType,
    originalTimeComparisonType: OverTimeComparisonType,
    selectedComparisonMeasures: string[],
    originalComparisonMeasures: string[],
    additionalDateFilters: IAttributeFilter[],
    originalAdditionalDateFilters: IAttributeFilter[],
    selectedEmptyDateValuesFilterMode: EmptyDateValuesFilterMode | undefined,
    originalEmptyDateValuesFilterMode: EmptyDateValuesFilterMode | undefined,
) => {
    const isFilterSame = _isEqual(selectedFilter, originalFilter);
    const isComparisonTypeSame = selectedTimeComparisonType === originalTimeComparisonType;
    // originalDateDataset is undefined when component is removed from filter bar (when dragged to trash)
    const isSameDateDataset = areObjRefsEqual(selectedDateDataset.ref, originalDateDataset?.ref);
    const areComparisonMeasuresSame = areSameMeasuresSelected(
        selectedComparisonMeasures,
        originalComparisonMeasures,
    );
    const areAdditionalFiltersSame = _isEqual(additionalDateFilters, originalAdditionalDateFilters);
    const isEmptyDateValuesFilterModeSame =
        getStoredEmptyDateValuesFilterMode(selectedEmptyDateValuesFilterMode, selectedFilter.filterOption) ===
        getStoredEmptyDateValuesFilterMode(originalEmptyDateValuesFilterMode, originalFilter.filterOption);

    return (
        !isFilterSame ||
        !isComparisonTypeSame ||
        !isSameDateDataset ||
        !areComparisonMeasuresSame ||
        !areAdditionalFiltersSame ||
        !isEmptyDateValuesFilterModeSame
    );
};

export const useApplyButtonEnabled = (
    selectedFilter: IDateFilterOption,
    originalFilter: IDateFilterOption,
    selectedDateDataset: IDecoratedDateDataset,
    originalDateDataset: IDecoratedDateDataset,
    selectedTimeComparisonType: OverTimeComparisonType,
    originalTimeComparisonType: OverTimeComparisonType,
    selectedComparisonMeasures: string[],
    originalComparisonMeasures: string[],
    additionalDateFilters: IAttributeFilter[],
    originalAdditionalDateFilters: IAttributeFilter[],
    isValidDateDataset: boolean,
    selectedEmptyDateValuesFilterMode?: EmptyDateValuesFilterMode,
    originalEmptyDateValuesFilterMode?: EmptyDateValuesFilterMode,
    isIncludeWithPeriodAllowed = false,
) => {
    const { filterOption } = selectedFilter;
    const isSelectionDifferent = isDialogStateChanged(
        selectedFilter,
        originalFilter,
        selectedDateDataset,
        originalDateDataset,
        selectedTimeComparisonType,
        originalTimeComparisonType,
        selectedComparisonMeasures,
        originalComparisonMeasures,
        additionalDateFilters,
        originalAdditionalDateFilters,
        selectedEmptyDateValuesFilterMode,
        originalEmptyDateValuesFilterMode,
    );
    const ignoreTimeComparison = selectedTimeComparisonType === OverTimeComparisonTypes.NOTHING;
    const isValidTimeComparison = isAllTimeSelectedAndTimeComparisonApplied(
        filterOption,
        selectedTimeComparisonType,
    );
    const isInvalidEmptyValuesInclude = isEmptyValuesIncludeInvalid(
        filterOption,
        selectedEmptyDateValuesFilterMode,
        isIncludeWithPeriodAllowed,
    );
    return (
        isSelectionDifferent &&
        isValidAbsoluteDateRange(filterOption) &&
        isValidFloatingDateRange(filterOption) &&
        (ignoreTimeComparison || isValidDateDataset) &&
        !isValidTimeComparison &&
        !isInvalidEmptyValuesInclude
    );
};

export const useDisabledApplyButtonTooltip = (
    selectedFilter: DateFilterOption,
    selectedTimeComparisonType: OverTimeComparisonType,
    isValidDateDataset: boolean,
    selectedEmptyDateValuesFilterMode?: EmptyDateValuesFilterMode,
    isIncludeWithPeriodAllowed = false,
) => {
    const intl = useIntl();

    const ignoreTimeComparison = selectedTimeComparisonType === OverTimeComparisonTypes.NOTHING;
    const isAllTime = isAllTimeDateFilterOption(selectedFilter);

    if (
        isEmptyValuesIncludeInvalid(
            selectedFilter,
            selectedEmptyDateValuesFilterMode,
            isIncludeWithPeriodAllowed,
        )
    ) {
        return intl.formatMessage({ id: "filter.date.empty_values.include.disabled_apply_tooltip" });
    }
    if (!isValidDateDataset && !ignoreTimeComparison) {
        return intl.formatMessage({ id: "filter.compare.type.dropdown.disabled_for_pop_apply" });
    }
    if (isAllTime && selectedTimeComparisonType === OverTimeComparisonTypes.PREVIOUS_PERIOD) {
        return intl.formatMessage({ id: "filter.compare.previous_period.all_time_not_supported" });
    }
    if (isAllTime && selectedTimeComparisonType === OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR) {
        return intl.formatMessage({
            id: "filter.compare.same_period_previous_year.all_time_not_supported",
        });
    }
    return undefined;
};

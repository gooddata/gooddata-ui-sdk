// (C) 2022-2026 GoodData Corporation

import { isEqual } from "lodash-es";
import moment from "moment";
import { useIntl } from "react-intl";

import { areObjRefsEqual, isAllTimeDateFilterOption } from "@gooddata/sdk-model";
import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import {
    type DateFilterOption,
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
} from "@gooddata/sdk-ui-filters";

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
) => isEqual(selectedComparisonMeasures.slice().sort(), originalComparisonMeasures.slice().sort());

const isEndTimeAfterOrAtStartTime = (start: string, end: string) => moment(start) <= moment(end);

const isValidAbsoluteDateRange = (selectedFilter: DateFilterOption) =>
    !isAbsoluteDateFilterOption(selectedFilter) ||
    (selectedFilter.from !== undefined &&
        selectedFilter.to !== undefined &&
        isEndTimeAfterOrAtStartTime(selectedFilter.from, selectedFilter.to));

const isValidFloatingDateRange = (selectedFilter: DateFilterOption) =>
    !isRelativeDateFilterOption(selectedFilter) ||
    (selectedFilter.from !== undefined && selectedFilter.to !== undefined);

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
    const isFilterSame = isEqual(selectedFilter, originalFilter);
    const isComparisonTypeSame = selectedTimeComparisonType === originalTimeComparisonType;
    // originalDateDataset is undefined when component is removed from filter bar (when dragged to trash)
    const isSameDateDataset = areObjRefsEqual(selectedDateDataset.ref, originalDateDataset?.ref);
    const areComparisonMeasuresSame = areSameMeasuresSelected(
        selectedComparisonMeasures,
        originalComparisonMeasures,
    );
    const areAdditionalFiltersSame = isEqual(additionalDateFilters, originalAdditionalDateFilters);
    const isEmptyDateValuesFilterModeSame =
        (selectedEmptyDateValuesFilterMode || "include") === (originalEmptyDateValuesFilterMode || "include");

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
    const isAllTime = isAllTimeDateFilterOption(filterOption);
    // "Include" empty values is only allowed when period is "All time"
    const isInvalidEmptyValuesInclude = selectedEmptyDateValuesFilterMode === "include" && !isAllTime;
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
) => {
    const intl = useIntl();

    const ignoreTimeComparison = selectedTimeComparisonType === OverTimeComparisonTypes.NOTHING;
    const isAllTime = isAllTimeDateFilterOption(selectedFilter);

    // "Include" empty values is only allowed when period is "All time"
    if (selectedEmptyDateValuesFilterMode === "include" && !isAllTime) {
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

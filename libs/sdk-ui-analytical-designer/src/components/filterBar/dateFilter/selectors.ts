// (C) 2022-2026 GoodData Corporation

import { createSelector, createStructuredSelector } from "reselect";

import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { DecoratedDateDataset as DecoratedDataset } from "../../../models/decorated_date_dataset.js";
import { getAdditionalDateFiltersLabel } from "../../../selectors/additional_date_filter_selector.js";
import {
    areGenericDateAttributeElementsSupported,
    supportsTimeGranularities,
} from "../../../selectors/backend_capabilities_selector.js";
import { getFormatLocale } from "../../../selectors/bootstrap_selector.js";
import {
    getDateBucketItemDateDatasetRefs,
    getDateBucketItems,
    getDecoratedBucketItems,
    getMeasureDescriptions,
} from "../../../selectors/buckets_selector.js";
import { getDateDatasetRefsWithGranularities } from "../../../selectors/date_dataset_with_granularities_selector.js";
import {
    getDecoratedDateDatasets,
    getLocalizedDateFormat,
    isPoPAvailable,
    isUsedByInsight,
    selectedOverTimeComparisonMeasures,
} from "../../../selectors/date_filter_selector.js";
import {
    enableSecondGranularities,
    enableUnavailableItemsVisibility,
    getActiveCalendars,
    getWeekStart,
} from "../../../selectors/feature_flag_selector.js";
import { getMeasureSequenceNumbers } from "../../../selectors/measure_sequence_numbers_selector.js";
import {
    getCompatibleDerivedMeasures,
    getSupportedOverTimeComparisonTypes,
    isSelectedViewByDateOfWeekGranularity,
} from "../../../services/buckets_service.js";
import { DateDatasetsService } from "../../../services/date_datasets_service.js";
import { getCompatibleMeasures } from "../../../services/over_time_comparison_service.js";
import {
    getAdditionalDateAttributeFilters,
    getFilterItems,
    getMigratedAdditionalFilters,
} from "../../../store/filter_bar/filter_bar_selector.js";
import {
    type EmptyDateValuesFilterMode,
    FilterBar,
    type IDateFilter,
} from "../../../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../../../store/types.js";
import {
    type IDecoratedBucketItem,
    type IRawBucketItem,
    type IRawBucketItems,
} from "../../../typings/buckets.js";

import { matchDateFilterValueToDateFilterOption } from "./dateFilterOptionFactory.js";
import { findSupportedRelativePresets } from "./presets.js";
import {
    type IComparisonCompatibleMeasure,
    type IDateFilterProps,
    type IDateFilterStateProps,
} from "./types.js";

const collectionContainsBucketItem = (collection: IRawBucketItems, decoratedItem: IDecoratedBucketItem) =>
    collection.some((item: IRawBucketItem) => item?.localIdentifier === decoratedItem.localIdentifier);

const getComparisonCompatibleMeasure = createSelector(
    getDecoratedBucketItems,
    getCompatibleMeasures,
    getMeasureSequenceNumbers,
    getMeasureDescriptions,
    (decoratedBucketItems, compatibleMeasures, measureSequenceNumbers, measureDescriptions) =>
        decoratedBucketItems
            .filter((decoratedBucketItem: IDecoratedBucketItem) =>
                collectionContainsBucketItem(compatibleMeasures, decoratedBucketItem),
            )
            .map(({ localIdentifier }): IComparisonCompatibleMeasure => ({
                localIdentifier,
                sequenceNumber: measureSequenceNumbers[localIdentifier],
                title: measureDescriptions[localIdentifier].title,
                alias: measureDescriptions[localIdentifier].alias,
            })),
);

const getDateFilterItem = (state: IAppState, props: IDateFilterProps): IDateFilter =>
    getFilterItems(state)
        .filter(FilterBar.isDateFilter)
        .find((item) => item.localIdentifier === props.filterLocalIdentifier);

const selectDateFilter = createSelector(getDateFilterItem, (filterItem) =>
    matchDateFilterValueToDateFilterOption(filterItem?.filterConfig),
);

const getDateDataset = (state: IAppState, props: IDateFilterProps) => {
    const dateFilter = getDateFilterItem(state, props);
    return DateDatasetsService.getDateDatasetByRef(state, dateFilter?.dateDatasetRef);
};

const getDateDatasetRef = (state: IAppState, props: IDateFilterProps) => {
    const dateFilter = getDateFilterItem(state, props);
    return dateFilter?.dateDatasetRef;
};

const isDateRefUsedByInsight = (state: IAppState, props: IDateFilterProps) => {
    return isUsedByInsight(state, getDateDatasetRef(state, props));
};

const getDateFilterDataSet = createSelector(
    getDateDataset,
    (dateDataset) => dateDataset && DecoratedDataset.createDecorated(dateDataset),
);

const getSelectedOverTimeComparisonType = createSelector(
    getSupportedOverTimeComparisonTypes,
    getCompatibleDerivedMeasures,
    getDateBucketItems,
    isPoPAvailable,
    (
        supportedTypes: OverTimeComparisonType[],
        derivedMeasure: IRawBucketItems,
        dateBucketItems: IRawBucketItems,
        popIsAvailable: boolean,
    ): OverTimeComparisonType => {
        const firstDerivedMeasure = derivedMeasure?.[0];
        const comparisonType = firstDerivedMeasure?.overTimeComparisonType as OverTimeComparisonType;
        const areDateBucketItemsEmpty = dateBucketItems.length === 0;

        if (!areDateBucketItemsEmpty && !popIsAvailable) {
            return OverTimeComparisonTypes.NOTHING;
        }
        if (comparisonType && supportedTypes.includes(comparisonType)) {
            return comparisonType;
        }
        return OverTimeComparisonTypes.NOTHING;
    },
);

export const selectRelativeDateFilterPresets = createSelector(
    (_state: IAppState) => supportsTimeGranularities(),
    (supportsTime) => findSupportedRelativePresets(supportsTime),
);

// Global gate for second-level precision: the backend supports time granularities and the
// enableSecondGranularities feature flag is on. Whether the *relevant* date dimension actually exposes the
// GDC.time.second attribute is evaluated in the component against the locally-selected dataset (which can
// change in the open dropdown before Apply), so the gate here stays dataset-independent.
export const selectIsSecondsGranularityEnabled = createSelector(
    supportsTimeGranularities,
    enableSecondGranularities,
    (supportsTime, secondsEnabled): boolean => supportsTime && secondsEnabled,
);

const isFirstDateFilter = createSelector(
    getDateFilterItem,
    (state) => getFilterItems(state).filter(FilterBar.isDateFilter),
    (filterItem, allDateFilters) => allDateFilters[0]?.localIdentifier === filterItem?.localIdentifier,
);

const getStoredEmptyDateValuesFilter = createSelector(
    getFilterItems,
    (_state: IAppState, props: IDateFilterProps) => props.filterLocalIdentifier,
    (filterItems, filterLocalIdentifier): EmptyDateValuesFilterMode | undefined => {
        const dateFilter = filterItems
            .filter(FilterBar.isDateFilter)
            .find((item) => item.localIdentifier === filterLocalIdentifier);
        return dateFilter?.emptyDateValuesFilter;
    },
);

export const selectDateFilterOrderDependentProps = createSelector(
    isFirstDateFilter,
    selectedOverTimeComparisonMeasures,
    getSupportedOverTimeComparisonTypes,
    getSelectedOverTimeComparisonType,
    getComparisonCompatibleMeasure,
    getAdditionalDateAttributeFilters,
    getAdditionalDateFiltersLabel,
    getMigratedAdditionalFilters,
    getStoredEmptyDateValuesFilter,
    (
        isFirstDateFilter,
        timeComparisonMeasures,
        supportedTimeComparisonTypes,
        timeComparisonType,
        timeComparisonCompatibleMeasures,
        additionalDateAttributeFilters,
        additionalDateFilterLabels,
        migratedAdditionalFilters,
        storedEmptyDateValuesFilter,
    ): Partial<IDateFilterStateProps> => ({
        isFirstDateFilter,
        timeComparisonMeasures: isFirstDateFilter ? timeComparisonMeasures : [],
        supportedTimeComparisonTypes: isFirstDateFilter ? supportedTimeComparisonTypes : [],
        timeComparisonType: isFirstDateFilter ? timeComparisonType : OverTimeComparisonTypes.NOTHING,
        timeComparisonCompatibleMeasures: isFirstDateFilter ? timeComparisonCompatibleMeasures : [],
        additionalDateAttributeFilters: isFirstDateFilter ? additionalDateAttributeFilters : [],
        additionalDateFilterLabels: isFirstDateFilter ? additionalDateFilterLabels : [],
        migratedAdditionalFilters: isFirstDateFilter ? migratedAdditionalFilters : [],
        storedEmptyDateValuesFilter,
    }),
);

const selectDateFilterOrderIndependentProps = createStructuredSelector({
    filter: selectDateFilter,
    relativeDateFilterPresets: selectRelativeDateFilterPresets,
    dateDataset: getDateFilterDataSet,
    dateDatasets: getDecoratedDateDatasets,
    dateDatasetRefsWithGranularities: getDateDatasetRefsWithGranularities,
    dateFormat: getLocalizedDateFormat,
    isSelectedWeekGranularityInViewByDate: isSelectedViewByDateOfWeekGranularity,
    isUsedByInsight: isDateRefUsedByInsight,
    dateBucketItemDateDatasetRefs: getDateBucketItemDateDatasetRefs,
    isDateDatasetsDropdownLoaded: DateDatasetsService.isDateDatasetsDropdownLoaded,
    areGenericDateAttributeElementsSupported,
    isTimeForAbsoluteRangeEnabled: supportsTimeGranularities,
    isSecondsGranularityEnabled: selectIsSecondsGranularityEnabled,
    formatLocale: getFormatLocale,
    weekStart: getWeekStart,
    enableUnavailableItemsVisibility,
    activeCalendars: getActiveCalendars,
});

export const selectDateFilterProps = createSelector(
    selectDateFilterOrderIndependentProps,
    selectDateFilterOrderDependentProps,
    (dateFilterOrderIndependentProps, dateFilterOrderDependentProps: Partial<IDateFilterStateProps>) => ({
        ...dateFilterOrderIndependentProps,
        ...dateFilterOrderDependentProps,
    }),
);

export const DateFilterSelectorTest = {
    getDateFilterItem,
    getComparisonCompatibleMeasure,
    getSelectedOverTimeComparisonType,
};

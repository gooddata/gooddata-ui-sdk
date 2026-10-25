// (C) 2019-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IAttributeFilterConfig, objRefToString } from "@gooddata/sdk-model";

import { ALL_TIME } from "../../constants/presets.js";
import { DateDatasetsMetaService } from "../../services/date_datasets_meta_service.js";
import {
    getExtendedReferencePointFilters,
    getUiConfigBuckets,
} from "../reference_point/extended_reference_point_selectors.js";
import { type IAppState } from "../types.js";

import {
    dateFilterExistsIn,
    findAttributeFilter,
    findDateFilter,
    findDateFilterIndex,
    findFirstDateFilter,
    findMeasureValueFilter,
    findMeasureValueFilterForMeasure,
    findMeasureValueFilters,
    findRankingFilter,
    flattenDateDatasetAttributes,
    pickAdditionalDateAttributeFilters,
    removeAdditionalDateAttributeFilters,
} from "./filter_bar_helpers.js";
import { type IFilterBarState } from "./filter_bar_state.js";
import {
    FilterBar,
    type FilterBarAcceptedType,
    type IAttributeFilter,
    type IDateFilter,
    type IFilter,
    type IFilterBarConfig,
    type IMeasureValueFilter,
    type IRankingFilter,
} from "./filter_bar_types.js";
import { type IParameterFilter, isParameterOverridden } from "./parameter_filter_types.js";

export const getFilterBarState = (state: IAppState): IFilterBarState => state.data.filterBar;

export const getFilterItems = createSelector(getFilterBarState, (filterBarState) => filterBarState.items);

export const getParameterFilters = createSelector(
    getFilterBarState,
    (filterBarState): ReadonlyArray<IParameterFilter> => filterBarState.parameterItems ?? [],
);

export const getActiveParameterRefKeys = createSelector(
    getParameterFilters,
    (filters): ReadonlySet<string> => new Set(filters.map((filter) => objRefToString(filter.parameterRef))),
);

export const getAttributeFilterConfigs = createSelector(
    getFilterBarState,
    (filterBarState) => filterBarState.attributeFilterConfigs ?? {},
);

export const getAdditionalDateAttributeFilters = createSelector(
    getFilterItems,
    DateDatasetsMetaService.getDateDatasetsMetaItems,
    (filterItems, dateDatasetItems): IAttributeFilter[] =>
        pickAdditionalDateAttributeFilters(filterItems, flattenDateDatasetAttributes(dateDatasetItems)),
);

export const getFilterItemsWithoutAdditionalDateAttributes = createSelector(
    getFilterItems,
    DateDatasetsMetaService.getDateDatasetsMetaItems,
    (filterItems, dateDatasetItems) =>
        removeAdditionalDateAttributeFilters(filterItems, flattenDateDatasetAttributes(dateDatasetItems)),
);

const isDateFilterSetUp = (filter: IDateFilter) =>
    filter.filterConfig && filter.filterConfig.name !== ALL_TIME;

const isMeasureValueFilterSetUp = (filter: IMeasureValueFilter) => (filter.conditions?.length ?? 0) > 0;

const isAttributeFilterSetUp = (filter: IAttributeFilter) =>
    filter.textModeFilter !== undefined ||
    (filter.filterConfig && filter.filterConfig.selectedElements.length > 0);

const isFilterSetUp = (filter: IFilter) =>
    (FilterBar.isDateFilter(filter) && isDateFilterSetUp(filter)) ||
    (FilterBar.isMeasureValueFilter(filter) && isMeasureValueFilterSetUp(filter)) ||
    FilterBar.isRankingFilter(filter) ||
    (FilterBar.isAttributeFilter(filter) && isAttributeFilterSetUp(filter));

export const areSomeFiltersSetUp = createSelector(
    getFilterItems,
    getParameterFilters,
    (filterItems, parameterItems) =>
        filterItems.some((filter) => isFilterSetUp(filter)) ||
        parameterItems.some((filter) => isParameterOverridden(filter)),
);

export const isMultiline = (state: IAppState) => {
    const filterBarState = getFilterBarState(state);
    return filterBarState.isMultiline;
};

export const getFilterItemsExtended = (state: IAppState): ReadonlyArray<IFilter> => {
    const extended: ReadonlyArray<IFilter> | undefined = getExtendedReferencePointFilters(state);
    return extended ?? getFilterItems(state);
};

export const getConfig = createSelector(
    (state: IAppState) => getUiConfigBuckets(state),
    (uiConfig): IFilterBarConfig => {
        const filtersUiConfig = uiConfig?.["filters"] as
            | { accepts?: readonly FilterBarAcceptedType[]; itemsLimit?: number }
            | undefined;

        return filtersUiConfig
            ? {
                  acceptedTypes: filtersUiConfig.accepts || [],
                  itemsLimit: filtersUiConfig.itemsLimit || 0,
              }
            : {
                  acceptedTypes: [],
                  itemsLimit: 0,
              };
    },
);

export const getAcceptedTypes = createSelector(getConfig, (filterConfig) => filterConfig.acceptedTypes);

export const getItemsLimit = createSelector(getConfig, (filterConfig) => filterConfig.itemsLimit);

export const getFirstDateFilter = (state: IAppState): IDateFilter =>
    findFirstDateFilter(getFilterBarState(state));

export const getDateFilter = (state: IAppState, localIdentifier: string): IDateFilter =>
    findDateFilter(getFilterBarState(state), localIdentifier);

export const getDateFilterIndex = (state: IAppState, localIdentifier: string): number =>
    findDateFilterIndex(getFilterBarState(state), localIdentifier);

export const getDateFilters = (state: IAppState): ReadonlyArray<IDateFilter> =>
    getFilterItems(state).filter(FilterBar.isDateFilter);

export const getAttributeFilter = (state: IAppState, localIdentifier: string): IAttributeFilter =>
    findAttributeFilter(getFilterBarState(state), localIdentifier);

export const getAttributeFilterConfig = (state: IAppState, localIdentifier: string): IAttributeFilterConfig =>
    getAttributeFilterConfigs(state)[localIdentifier];

export const getMeasureValueFilters = (state: IAppState): ReadonlyArray<IMeasureValueFilter> =>
    findMeasureValueFilters(getFilterBarState(state));

export const getMeasureValueFilter = (state: IAppState, localIdentifier: string): IMeasureValueFilter =>
    findMeasureValueFilter(getFilterBarState(state), localIdentifier);

export const getFilterForMeasure = (state: IAppState, localIdentifier: string): IMeasureValueFilter =>
    findMeasureValueFilterForMeasure(getFilterBarState(state), localIdentifier);

export const getRankingFilter = (state: IAppState): IRankingFilter =>
    findRankingFilter(getFilterBarState(state));

export const hasRankingFilterWithCustomGranularity = (state: IAppState): boolean => {
    const rankingFilter = getRankingFilter(state);
    return !!rankingFilter && !!rankingFilter.attributes?.length;
};

export const dateFilterExists = (state: IAppState) => dateFilterExistsIn(getFilterBarState(state));

export const hasMeasureValueFilter = (state: IAppState): boolean =>
    getFilterItems(state).some(FilterBar.isMeasureValueFilter);

export const hasActiveMeasureValueFilter = (state: IAppState): boolean =>
    getFilterItems(state).some(
        (filter) => FilterBar.isMeasureValueFilter(filter) && (filter.conditions?.length ?? 0) > 0,
    );

export const hasRankingFilter = (state: IAppState): boolean =>
    getFilterItems(state).some(FilterBar.isRankingFilter);

export const getAttributeFilterById = (state: IAppState, identifier: string): IAttributeFilter =>
    getFilterItems(state)
        .filter(FilterBar.isAttributeFilter)
        .find((filter) => filter.cacheItemIdentifier === identifier);

export const getMigratedAdditionalFilters = (state: IAppState): string[] =>
    getFilterBarState(state).migratedAdditionalFilters;

export const isFilterBarDropdownOpen = (state: IAppState): boolean =>
    getFilterBarState(state).filterBarDropdownOpen;

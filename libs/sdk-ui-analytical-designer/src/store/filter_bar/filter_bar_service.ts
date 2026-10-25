// (C) 2019-2026 GoodData Corporation

import { type IAttributeFilterConfigs, type ObjRef } from "@gooddata/sdk-model";
import { type OverTimeComparisonType } from "@gooddata/sdk-ui";
import { type IFilters } from "@gooddata/sdk-ui-ext/internal";

import { getDateDatasetRefsWithGranularities } from "../../selectors/date_dataset_with_granularities_selector.js";
import { getDateDatasetsMetaItems } from "../date_datasets_meta/date_datasets_meta_selectors.js";
import { type IRefPointFiltersBucket } from "../reference_point/reference_point_state.js";
import { type IAppState } from "../types.js";

import {
    addFilter,
    convertFromExtendedRefPointFilters,
    createAttributeFilter,
    createDateFilter,
    createDateFilterIfDoesntExist,
    createDefaultRankingFilter,
    createFilter,
    createMeasureValueFilter,
    findMatchingBucketMeasureLocalIdentifier,
    flattenDateDatasetAttributes,
    migrateAdditionalDateFilters,
    normalizeFilterBar,
    removeFilters,
    removeMeasureValueFilters,
    resetAdditionalDateFilters,
    setFilterItems,
    setParameterItems,
    storeAttributeFilterConfigs,
    storeFilter,
    updateAttributeFilter,
    updateDateFilter,
    updateFilters,
    updateMeasureValueFilter,
    updateRankingFilter,
} from "./filter_bar_helpers.js";
import { getFilterBarState } from "./filter_bar_selector.js";
import { type IFilterBarState } from "./filter_bar_state.js";
import {
    type EmptyDateValuesFilterMode,
    type IAttributeElement,
    type IDateFilterConfig,
    type IFilter,
    type IMeasureValueFilter,
    type IRankingFilter,
    type TextModeFilterData,
} from "./filter_bar_types.js";
import { type IParameterFilter } from "./parameter_filter_types.js";

/**
 * Whole-root WRITE ADAPTERS over the filter-bar domain.
 *
 * The operations themselves are narrow pure helpers over `IFilterBarState`
 * (filter_bar_helpers.ts); every entry point below is the same three lines — read the domain value,
 * call the helper, write the value back. What keeps them alive is
 * `services/buckets_service.ts`'s removal chain plus the test fixtures built on these entry points.
 *
 * The PURE members of the facade (the filter factories, the extended-reference-point converter,
 * `migrateAdditionalDateFilters`, `findMatchingBucketMeasureLocalIdentifier`) are re-exported from
 * the helpers verbatim. A NEW call site should import the helper directly.
 */

const writeFilterBar = (state: IAppState, filterBar: IFilterBarState): IAppState =>
    state.data.filterBar === filterBar ? state : { ...state, data: { ...state.data, filterBar } };

/**
 * Writes the filter bar WITH the ranking-filters-last normalization — the entry point every `items`
 * writer goes through.
 */
export const setFilterBarState = (state: IAppState, filterBarState: IFilterBarState): IAppState =>
    writeFilterBar(state, normalizeFilterBar(filterBarState));

export const FilterBarService = {
    setFilterBarState,

    addFilter: (state: IAppState, newFilter: IFilter): IAppState =>
        writeFilterBar(state, addFilter(getFilterBarState(state), newFilter)),

    storeFilter: (state: IAppState, updatedFilter: IFilter): IAppState =>
        writeFilterBar(state, storeFilter(getFilterBarState(state), updatedFilter)),

    // `configs` is optional because an insight carries the key only when it HAS configs (open-report)
    storeAttributeFilterConfigs: (
        state: IAppState,
        configs: IAttributeFilterConfigs | undefined,
    ): IAppState => writeFilterBar(state, storeAttributeFilterConfigs(getFilterBarState(state), configs)),

    updateDateFilter: (
        state: IAppState,
        payload: {
            localIdentifier: string;
            filterConfig?: IDateFilterConfig;
            overTimeComparisonType?: OverTimeComparisonType;
            dateDatasetRef?: ObjRef;
            emptyDateValuesFilter?: EmptyDateValuesFilterMode;
        },
    ): IAppState => writeFilterBar(state, updateDateFilter(getFilterBarState(state), payload)),

    updateAttributeFilter: (
        state: IAppState,
        filterLocalIdentifier: string,
        selectedElements: ReadonlyArray<IAttributeElement>,
        totalElementsCount: number,
        isInverted: boolean,
        displayFormRef?: ObjRef,
        textModeFilter?: TextModeFilterData,
    ): IAppState =>
        writeFilterBar(
            state,
            updateAttributeFilter(
                getFilterBarState(state),
                filterLocalIdentifier,
                selectedElements,
                totalElementsCount,
                isInverted,
                displayFormRef,
                textModeFilter,
            ),
        ),

    /** Answers the updated FILTER, not a new state — the caller stores it (`bucket_filters_sagas`). */
    updateMeasureValueFilter: (state: IAppState, filter: IMeasureValueFilter): IMeasureValueFilter =>
        updateMeasureValueFilter(getFilterBarState(state), filter),

    /** Answers the updated FILTER, not a new state — see `updateMeasureValueFilter`. */
    updateRankingFilter: (state: IAppState, filter: IRankingFilter): IRankingFilter =>
        updateRankingFilter(getFilterBarState(state), filter),

    createFilter,
    createDateFilter,
    createAttributeFilter,
    createMeasureValueFilter,
    createDefaultRankingFilter,

    setFilterItems: (state: IAppState, filterItems: ReadonlyArray<IFilter>): IAppState =>
        writeFilterBar(state, setFilterItems(getFilterBarState(state), filterItems)),

    setParameterItems: (state: IAppState, parameterItems: ReadonlyArray<IParameterFilter>): IAppState =>
        writeFilterBar(state, setParameterItems(getFilterBarState(state), parameterItems)),

    convertFromExtendedRefPointFilters: (
        extendedRefPointFilters: IFilters | IRefPointFiltersBucket,
    ): ReadonlyArray<IFilter> => convertFromExtendedRefPointFilters(extendedRefPointFilters),

    createDateFilterIfDoesntExist: (state: IAppState, dateDatasetRef: ObjRef): IAppState =>
        writeFilterBar(state, createDateFilterIfDoesntExist(getFilterBarState(state), dateDatasetRef)),

    removeFilters: (state: IAppState, localIdentifiers: ReadonlyArray<string>): IAppState =>
        writeFilterBar(state, removeFilters(getFilterBarState(state), localIdentifiers)),

    removeMeasureValueFilters: (state: IAppState): IAppState =>
        writeFilterBar(state, removeMeasureValueFilters(getFilterBarState(state))),

    /**
     * The date-dataset attributes come from the date-datasets META items here — the same source the
     * `getAdditionalDateAttributeFilters` selector uses, and deliberately NOT the granularity list
     * `resetAdditionalDateFilters` resolves below (two domains answer "which filters are additional
     * date filters", and only the helpers' explicit argument makes that visible).
     */
    updateFilters: (state: IAppState, updatedAdditionalDateFilters: IFilter[]): IAppState =>
        writeFilterBar(
            state,
            updateFilters(
                getFilterBarState(state),
                updatedAdditionalDateFilters,
                flattenDateDatasetAttributes(getDateDatasetsMetaItems(state)),
            ),
        ),

    resetAdditionalDateFilters: (state: IAppState, newDateDatasetRef: ObjRef): IAppState =>
        writeFilterBar(
            state,
            resetAdditionalDateFilters(
                getFilterBarState(state),
                newDateDatasetRef,
                getDateDatasetRefsWithGranularities(state),
            ),
        ),

    migrateAdditionalDateFilters,
    findMatchingBucketMeasureLocalIdentifier,
};

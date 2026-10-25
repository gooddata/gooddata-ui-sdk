// (C) 2019-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import {
    type AttributeFilterItem,
    type DateFilterItem,
    type FilterItem,
    type IRankingFilter as IRankingFilterEmbed,
} from "@gooddata/sdk-embedding";
import { filterConverters } from "@gooddata/sdk-embedding/internal";
import { type IAttributeFilterConfig, areObjRefsEqual, localIdRef } from "@gooddata/sdk-model";

import { optionToMeasureDateFilterInterval } from "../../components/buckets/measureDateFilterOption.js";
import { ALL_TIME } from "../../constants/presets.js";
import { findAttributeCacheItemByRef } from "../../models/item_cache_lookup.js";
import { postFilterContextChanged } from "../../postMessageApi/outgoing/control_filtering_events.js";
import { availableCommandsSelector } from "../../postMessageApi/state/selectors/post_message_context_selector.js";
import { getItemCache } from "../../selectors/item_cache_selector.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { DateDatasetsService } from "../../services/date_datasets_service.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";
import { getBucketsState } from "../buckets/buckets_selectors.js";
import { findBucketItemInBuckets } from "../buckets/buckets_write_helpers.js";
import { setMigratedAdditionalFilters } from "../filter_bar/filter_bar_actions.js";
import {
    updateMeasureValueFilter as updateMeasureValueFilterInBar,
    updateRankingFilter as updateRankingFilterInBar,
} from "../filter_bar/filter_bar_helpers.js";
import {
    getAttributeFilter,
    getAttributeFilterConfig,
    getFilterBarState,
    getFirstDateFilter,
} from "../filter_bar/filter_bar_selector.js";
import { type IAttributeElement, type IRankingFilter } from "../filter_bar/filter_bar_types.js";
import {
    type IAddParameterFiltersUiAction,
    type IUpdateParameterFilterAction,
    ParameterFilterActionTypeKeys,
    addParameterFiltersToState,
    storeUpdateParameterFilter,
} from "../filter_bar/parameter_filter_actions.js";
import { parameterFilterFromMetadata } from "../filter_bar/parameter_filter_service.js";
import { type IAppState } from "../types.js";

import {
    type IUpdateAttributeFilterActionPayload,
    type IUpdateDateFilterActionPayload,
    dateFilterClosed as dateFilterClosedAction,
    setBucketItemAddMetricFilter as setBucketItemAddMetricFilterAction,
    setBucketItemAddMetricFilters as setBucketItemAddMetricFiltersAction,
    setBucketItemApplyMetricDateFilter as setBucketItemApplyMetricDateFilterAction,
    setBucketItemRemoveMetricFilter as setBucketItemRemoveMetricFilterAction,
    setBucketItemUpdateMetricFilter as setBucketItemUpdateMetricFilterAction,
    setBucketItemUpdateMetricFilterDisplayForm as setBucketItemUpdateMetricFilterDisplayFormAction,
    storeSetBucketItemAddMetricFilter,
    storeSetBucketItemAddMetricFilters,
    storeSetBucketItemApplyMetricDateFilter,
    storeSetBucketItemRemoveMetricFilter,
    storeSetBucketItemUpdateMetricFilter,
    storeSetBucketItemUpdateMetricFilterDisplayForm,
    storeUpdateAttributeFilter,
    storeUpdateAttributeFilterDisplayForm,
    storeUpdateDateFilter,
    storeUpdateMeasureValueFilter,
    storeUpdateRankingFilter,
    updateAttributeFilter as updateAttributeFilterAction,
    updateAttributeFilterDisplayForm as updateAttributeFilterDisplayFormAction,
    updateMeasureValueFilter as updateMeasureValueFilterAction,
    updateRankingFilter as updateRankingFilterAction,
} from "./bucket_filters_actions.js";

export function* postFilterContextChangedWithAvailableCommands(filter: FilterItem): SagaIterator {
    const state: IAppState = yield select();
    const availableCommands: ReturnType<typeof availableCommandsSelector> = availableCommandsSelector(state);

    yield call(postFilterContextChanged, availableCommands, filter);
}

export function* updateAttributeFilter(action: ReturnType<typeof updateAttributeFilterAction>): SagaIterator {
    const appState: IAppState = yield select();
    const isEmbedded: ReturnType<typeof getIsEmbedded> = yield select(getIsEmbedded);
    if (isEmbedded) {
        const { filterLocalIdentifier, displayFormRef } = action.payload;
        const attributeFilter = getAttributeFilter(appState, filterLocalIdentifier);
        const { cacheItemIdentifier } = attributeFilter;
        const attributeFilterConfig = getAttributeFilterConfig(appState, filterLocalIdentifier);
        const itemCached = getItemCache(appState);
        const displayForms =
            findAttributeCacheItemByRef(itemCached, cacheItemIdentifier, attributeFilter.displayFormRef)
                ?.displayForms ?? [];
        const matchingDf = displayForms.find((df) => areObjRefsEqual(displayFormRef, df.ref));
        const changedFilter = mapAttributeFilterToExternalAttributeFilter(
            {
                ...action.payload,
                dfUri: matchingDf?.uri,
                dfIdentifier: matchingDf?.id,
            },
            attributeFilterConfig,
        );
        yield call(postFilterContextChangedWithAvailableCommands, changedFilter);
    }
    yield put(storeUpdateAttributeFilter(action.payload));
}

export function* updateAttributeFilterDisplayForm(
    action: ReturnType<typeof updateAttributeFilterDisplayFormAction>,
): SagaIterator {
    yield put(storeUpdateAttributeFilterDisplayForm(action.payload));

    const appState: IAppState = yield select();
    const { filterLocalIdentifier } = action.payload;
    const filter = getAttributeFilter(appState, filterLocalIdentifier);
    if (action.payload.primaryDfRef && !areObjRefsEqual(filter.displayFormRef, action.payload.primaryDfRef)) {
        // filter was migrated by AF Component to the primary label
        yield put(
            updateAttributeFilterAction({
                filterLocalIdentifier: action.payload.filterLocalIdentifier,
                selectedElements: action.payload.selectedElements,
                displayFormRef: action.payload.primaryDfRef,
                isInverted: action.payload.selectedElements.length ? filter.filterConfig?.isInverted : true,
                totalElementsCount: filter.filterConfig?.totalElementsCount,
            }),
        );
    }
}

export function* updateDateFilter(payload: IUpdateDateFilterActionPayload): SagaIterator {
    const isEmbedded: ReturnType<typeof getIsEmbedded> = yield select(getIsEmbedded);
    if (isEmbedded) {
        const changedFilter = mapDateFilterIdToExternalDateFilter(payload);
        yield call(postFilterContextChangedWithAvailableCommands, changedFilter);
    }
    const state: IAppState = yield select();
    const isAvailable = DateDatasetsService.getDateDatasetFromAvailablesByRef(state, payload.dateDatasetRef);
    if (isAvailable) {
        yield put(storeUpdateDateFilter(payload));
    } else {
        const currentDateFilter: ReturnType<typeof getFirstDateFilter> = yield select(getFirstDateFilter);
        if (currentDateFilter) {
            yield put(
                storeUpdateDateFilter({
                    ...payload,
                    dateDatasetRef: currentDateFilter.dateDatasetRef,
                }),
            );
        }
    }
}

export function* updateMeasureValueFilter({
    payload: { filter },
}: ReturnType<typeof updateMeasureValueFilterAction>): SagaIterator {
    // value-level — the last two FilterBarService entries this family used answered
    // the FILTER, not a state, so the helper call replaces the adapter one for one
    const filterBar: ReturnType<typeof getFilterBarState> = yield select(getFilterBarState);
    const updatedFilter = updateMeasureValueFilterInBar(filterBar, filter);
    // NOTE: the measure value filter does NOT support catalog-item granularity over the embed external API.
    // Its dimensionality (bucket or catalog) has no external representation, so nothing is broadcast to embed
    // hosts here (unlike the ranking filter, which still posts its bucket attributes; see
    // mapRankingFilterToExternalRankingFilter). Catalog granularity stays internal for both filters.
    yield put(storeUpdateMeasureValueFilter(updatedFilter));
}

export function* updateRankingFilter({
    payload: { filter },
}: ReturnType<typeof updateRankingFilterAction>): SagaIterator {
    const filterBar: ReturnType<typeof getFilterBarState> = yield select(getFilterBarState);
    const updatedFilter = updateRankingFilterInBar(filterBar, filter);
    const isEmbedded: ReturnType<typeof getIsEmbedded> = yield select(getIsEmbedded);
    if (isEmbedded) {
        const changedFilter = mapRankingFilterToExternalRankingFilter(filter);
        yield call(postFilterContextChangedWithAvailableCommands, changedFilter);
    }
    yield put(storeUpdateRankingFilter(updatedFilter));
}

export function* updateParameterFilter({ payload: { filter } }: IUpdateParameterFilterAction): SagaIterator {
    yield put(storeUpdateParameterFilter(filter));
}

export function* addParameterFilters({ payload: { items } }: IAddParameterFiltersUiAction): SagaIterator {
    const filters = items.map(parameterFilterFromMetadata);
    yield put(addParameterFiltersToState(filters));
}

export function* setBucketItemAddMetricFilter(
    action: ReturnType<typeof setBucketItemAddMetricFilterAction>,
): SagaIterator {
    const { attribute, item, selectedDateDatasetIdentifier } = action.payload;
    yield put(storeSetBucketItemAddMetricFilter(item, attribute, selectedDateDatasetIdentifier));
}

export function* setBucketItemAddMetricFilters(
    action: ReturnType<typeof setBucketItemAddMetricFiltersAction>,
): SagaIterator {
    const { attributes, item } = action.payload;
    yield put(storeSetBucketItemAddMetricFilters(item, attributes));
}

export function* setBucketItemRemoveMetricFilter(
    action: ReturnType<typeof setBucketItemRemoveMetricFilterAction>,
): SagaIterator {
    const { filter, item, removeAdditionalDateFilters } = action.payload;
    yield put(storeSetBucketItemRemoveMetricFilter(item, filter, removeAdditionalDateFilters));
}

export function* setBucketItemUpdateMetricFilter(
    action: ReturnType<typeof setBucketItemUpdateMetricFilterAction>,
): SagaIterator {
    const { changes, filter, isModified, item } = action.payload;
    yield put(storeSetBucketItemUpdateMetricFilter(item, filter, changes, isModified));
}

export function* setBucketItemApplyMetricDateFilter(
    action: ReturnType<typeof setBucketItemApplyMetricDateFilterAction>,
): SagaIterator {
    const { item, dateFilterOption, ...payload } = action.payload;
    // the picker speaks in date filter options; the store keeps the metric filter's stored interval
    yield put(
        storeSetBucketItemApplyMetricDateFilter(item, {
            ...payload,
            interval: optionToMeasureDateFilterInterval(dateFilterOption),
        }),
    );
}

export function* setBucketItemUpdateMetricFilterDisplayForm({
    payload,
}: ReturnType<typeof setBucketItemUpdateMetricFilterDisplayFormAction>): SagaIterator {
    yield put(storeSetBucketItemUpdateMetricFilterDisplayForm(payload));

    // the put above is a plain filter-bar case (a synchronous write) and the reads below
    // target the BUCKETS, which it never touches — no take() needed, unlike the operation triggers
    const { filterLocalIdentifier, itemLocalIdentifier } = payload;
    const buckets: ReturnType<typeof getBucketsState> = yield select(getBucketsState);
    const bucketItem = findBucketItemInBuckets(buckets, itemLocalIdentifier);
    const bucketItemFilter = (bucketItem?.filters ?? []).find(
        (filter: IBucketItemMetricFilter) => filter.localIdentifier === filterLocalIdentifier,
    );

    // the filter guard is load-bearing: without it a stale payload dispatches an update with
    // `filter: undefined`, which patches nothing but writes a junk `modified[undefined]` marker
    if (
        bucketItemFilter &&
        payload.primaryDfRef &&
        !areObjRefsEqual(bucketItemFilter.displayFormRef, payload.primaryDfRef)
    ) {
        // filter was migrated by AF Component to the primary label
        const changes = {
            displayFormRef: payload.primaryDfRef,
            selectedElements: payload.selectedElements,
            ...(payload.selectedElements.length === 0 ? { isInverted: true } : {}),
        };

        yield put(storeSetBucketItemUpdateMetricFilter(bucketItem, bucketItemFilter, changes, true));
    }
}

export function mapAttributeFilterToExternalAttributeFilter(
    attributeFilter: IUpdateAttributeFilterActionPayload,
    attributeFilterConfig?: IAttributeFilterConfig,
): AttributeFilterItem {
    const { isInverted, selectedElements, dfUri, dfIdentifier, textModeFilter } = attributeFilter;

    if (textModeFilter?.mode === "arbitrary") {
        return {
            arbitraryAttributeFilter: {
                displayForm: { identifier: dfIdentifier },
                values: textModeFilter.values,
                negativeSelection: textModeFilter.negativeSelection ?? false,
            },
        };
    }

    if (textModeFilter?.mode === "match") {
        return {
            matchAttributeFilter: {
                displayForm: { identifier: dfIdentifier },
                operator: textModeFilter.operator,
                literal: textModeFilter.literal,
                caseSensitive: textModeFilter.caseSensitive,
                negativeSelection: textModeFilter.negativeSelection,
            },
        };
    }

    if (isInverted) {
        return {
            negativeAttributeFilter: {
                displayForm: {
                    uri: dfUri,
                },
                notIn: selectedElements.map((item: IAttributeElement) => item.uri),
            },
            ...(attributeFilterConfig?.displayAsLabel
                ? { displayAsLabel: attributeFilterConfig.displayAsLabel }
                : {}),
        };
    }
    return {
        positiveAttributeFilter: {
            displayForm: {
                uri: dfUri,
            },
            in: selectedElements.map((item: IAttributeElement) => item.uri),
        },
        ...(attributeFilterConfig?.displayAsLabel
            ? { displayAsLabel: attributeFilterConfig.displayAsLabel }
            : {}),
    };
}

export function mapDateFilterIdToExternalDateFilter({
    dateDatasetRef,
    filterConfig: { type, name, interval, granularity, boundedFilter },
    localIdentifier,
}: IUpdateDateFilterActionPayload): DateFilterItem {
    if (name === ALL_TIME) {
        return {
            relativeDateFilter: {
                dataSet: dateDatasetRef,
                granularity: filterConverters.ALL_TIME_GRANULARITY,
                from: 0,
                to: 0,
            },
            localIdentifier,
        };
    }

    if (type === "absolute") {
        const [from, to] = interval as [string, string];
        return {
            absoluteDateFilter: {
                dataSet: dateDatasetRef,
                from,
                to,
            },
            localIdentifier,
        };
    }

    const [from, to] = interval as [number, number];
    return {
        relativeDateFilter: {
            dataSet: dateDatasetRef,
            granularity,
            from,
            to,
            ...(boundedFilter ? { boundedFilter } : {}),
        },
        localIdentifier,
    };
}

export function mapRankingFilterToExternalRankingFilter({
    measureLocalIdentifier,
    attributes,
    value,
    operator,
    strictLimitOfRows,
}: IRankingFilter): IRankingFilterEmbed {
    // NOTE: the embed external API does NOT support catalog-item granularity. It can only represent bucket
    // attributes (local id strings); catalog "out of" attributes (ObjRef) have no external representation and
    // are omitted here. This matches the measure value filter, whose catalog dimensionality is likewise not
    // exposed to embed hosts (see updateMeasureValueFilter).
    const localAttributeIds =
        attributes?.filter((attribute): attribute is string => typeof attribute === "string") ?? [];
    const attributesProp = localAttributeIds.length ? { attributes: localAttributeIds.map(localIdRef) } : {};
    const strictLimitOfRowsProp = strictLimitOfRows === undefined ? {} : { strictLimitOfRows };
    return {
        rankingFilter: {
            measure: { localIdentifier: measureLocalIdentifier },
            ...attributesProp,
            operator,
            value,
            ...strictLimitOfRowsProp,
        },
    };
}

export function* dateFilterClosed(): SagaIterator {
    yield put(setMigratedAdditionalFilters([]));
}

export function* watchBucketFilters(): SagaIterator {
    yield takeEvery(updateAttributeFilterAction.match, updateAttributeFilter);
    yield takeEvery(updateMeasureValueFilterAction.match, updateMeasureValueFilter);
    yield takeEvery(updateRankingFilterAction.match, updateRankingFilter);
    yield takeEvery(ParameterFilterActionTypeKeys.UI_ADD_PARAMETER_FILTERS, addParameterFilters);
    yield takeEvery(ParameterFilterActionTypeKeys.UI_UPDATE_PARAMETER_FILTER, updateParameterFilter);
    yield takeEvery(updateAttributeFilterDisplayFormAction.match, updateAttributeFilterDisplayForm);
    yield takeEvery(setBucketItemAddMetricFilterAction.match, setBucketItemAddMetricFilter);
    yield takeEvery(setBucketItemAddMetricFiltersAction.match, setBucketItemAddMetricFilters);
    yield takeEvery(setBucketItemRemoveMetricFilterAction.match, setBucketItemRemoveMetricFilter);
    yield takeEvery(setBucketItemUpdateMetricFilterAction.match, setBucketItemUpdateMetricFilter);
    yield takeEvery(
        setBucketItemUpdateMetricFilterDisplayFormAction.match,
        setBucketItemUpdateMetricFilterDisplayForm,
    );
    yield takeEvery(setBucketItemApplyMetricDateFilterAction.match, setBucketItemApplyMetricDateFilter);
    yield takeEvery(dateFilterClosedAction.match, dateFilterClosed);
}

// (C) 2020-2026 GoodData Corporation

import { call, put, select, takeEvery } from "redux-saga/effects";

import {
    type IChangeBucketItemDisplayFormAction,
    type IChangeBucketItemDisplayShowAllValues,
    type ISelectVisualizationTypeAction,
    type ISetBucketItemAggregationAction,
    type ISetBucketItemIsThresholdMeasureAction,
    type ISetBucketItemShowInPercentAction,
    storeBucketItemDisplayForm,
    storeBucketItemEnableThresholdMeasure,
    storeBucketItemShowAllValues,
    storeSetBucketItemIsTotalMeasure,
    storeSetBucketItemShowInPercent,
} from "../actions/buckets_actions.js";
import { type IDropCatalogItemAction } from "../actions/dnd_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { APPROXIMATE_COUNT_AGGREGATION } from "../models/aggregation_function.js";
import {
    logApproximateCountUsed,
    logChooseVisualizationType,
    logFactOrAttributeAdded,
} from "../services/telemetry/tracking_events.js";
import { type IAppState } from "../store/types.js";

function* setBucketItemShowInPercent({
    payload: { localIdentifier, value },
}: ISetBucketItemShowInPercentAction) {
    yield put(storeSetBucketItemShowInPercent(localIdentifier, value));
}

function* setBucketItemIsTotalMeasure({
    payload: { localIdentifier, value },
}: ISetBucketItemShowInPercentAction) {
    yield put(storeSetBucketItemIsTotalMeasure(localIdentifier, value));
}

function* setBucketItemIsThresholdMeasure({
    payload: { localIdentifier, value },
}: ISetBucketItemIsThresholdMeasureAction) {
    yield put(storeBucketItemEnableThresholdMeasure(localIdentifier, value));
}

function* setBucketItemDisplayForm({
    payload: { localIdentifier, displayForm },
}: IChangeBucketItemDisplayFormAction) {
    yield put(storeBucketItemDisplayForm(localIdentifier, displayForm));
}

function* setBucketItemShowAllValues({
    payload: { localIdentifier, showAllValues },
}: IChangeBucketItemDisplayShowAllValues) {
    yield put(storeBucketItemShowAllValues(localIdentifier, showAllValues));
}

function* logAggregationChange({ payload: { value } }: ISetBucketItemAggregationAction) {
    if (value === APPROXIMATE_COUNT_AGGREGATION) {
        const state: IAppState = yield select();
        yield call(logApproximateCountUsed, { state });
    }
}

function* logVisualizationType({ payload }: ISelectVisualizationTypeAction) {
    const visualisationType = payload?.visualizationClass?.title;
    const state: IAppState = yield select();
    yield call(logChooseVisualizationType, { state, value: visualisationType });
}

function* logAddFactOrAttribute({ payload: { catalogItem } }: IDropCatalogItemAction) {
    const catalogItemType = catalogItem.type;

    const state: IAppState = yield select();
    yield call(logFactOrAttributeAdded, { state, value: catalogItemType });
}

export function* watchBuckets() {
    yield takeEvery(ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT, setBucketItemShowInPercent);
    yield takeEvery(ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_IS_TOTAL_MEASURE, setBucketItemIsTotalMeasure);
    yield takeEvery(
        ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_IS_THRESHOLD_MEASURE,
        setBucketItemIsThresholdMeasure,
    );
    yield takeEvery(ActionTypeKeys.UI_BUCKETS_CHANGE_BUCKET_ITEM_DISPLAY_FORM, setBucketItemDisplayForm);
    yield takeEvery(ActionTypeKeys.UI_BUCKETS_CHANGE_BUCKET_ITEM_SHOW_ALL_VALUES, setBucketItemShowAllValues);
    yield takeEvery(ActionTypeKeys.BUCKETS_SET_BUCKET_ITEM_AGGREGATION, logAggregationChange);
    yield takeEvery(ActionTypeKeys.BUCKETS_SELECT_VISUALIZATION_TYPE, logVisualizationType);
    yield takeEvery(ActionTypeKeys.BUCKETS_DND_ITEM_INSERT, logAddFactOrAttribute);
}

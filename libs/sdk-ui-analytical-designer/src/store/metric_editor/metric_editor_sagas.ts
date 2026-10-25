// (C) 2020-2026 GoodData Corporation

import { isEmpty, isEqual, omit } from "lodash-es";
import { defineMessages } from "react-intl";
import { call, put, select, take, takeEvery } from "redux-saga/effects";

import { type IWorkspaceCatalog } from "@gooddata/sdk-backend-spi";
import { isCatalogMeasure } from "@gooddata/sdk-model";

import { removeBucketItemsByLocalIds } from "../../actions/buckets_actions.js";
import { createLeaveAnywayButtonClickedAction } from "../../actions/confirm_unsaved_changes_actions.js";
import { addMessage } from "../../actions/messages_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { metricsChanged } from "../../postMessageApi/outgoing/metrics_changed_events.js";
import { fetchCatalog } from "../../sagas/catalog/catalog_saga.js";
import { CatalogUiActions } from "../../sagas/catalog/catalog_ui_actions.js";
import { getMeasures } from "../../services/buckets_service.js";
import {
    logClickOnCreateMetric,
    logCreateOrEditMetric,
    logDeleteMetric,
    logMetricCreated,
} from "../../services/telemetry/tracking_events.js";
import { type IRawBucketItems } from "../../typings/buckets.js";
import { getCatalogItemByRef } from "../catalog/catalog_selector.js";
import { setLoadingGroups, setLoadingItems } from "../catalog/catalog_store_actions.js";
import { type IAppState } from "../types.js";

import {
    type IMetricEditorMetricDeletedAction,
    type IMetricEditorMetricSaveAction,
    type IMetricEditorOpenAction,
    MetricEditorActionTypeKeys,
    metricEditorCloseTabs,
    metricEditorFocusMetric,
    metricEditorOpenTabWithMetric,
} from "./metric_editor_actions.js";
import { getUnsavedChangesData, isMetricEditorMetricOpened } from "./metric_editor_selector.js";
import { createTabIdentifier } from "./metric_editor_services.js";

export const HIDE_SUCCESS_MESSAGE_AFTER = 2500;
export const HIDE_ERROR_MESSAGE_AFTER = 2500;

const metricEditorMessages = defineMessages({
    deleteMetric: { id: "messages.deleteMetric" },
    deleteMetricFailed: { id: "messages.deleteMetricFailed" },
    saveMetric: { id: "messages.saveMetric" },
    metricSaveError: { id: "messages.metricSaveError" },
});

enum CatalogItemType {
    metric = "measure",
    fact = "fact",
    dateDataset = "dateDataset",
    attribute = "attribute",
}

export function* watchMetricEditor() {
    yield takeEvery(MetricEditorActionTypeKeys.METRIC_EDITOR_OPEN, focusOrOpenMetricTab);
    yield takeEvery(MetricEditorActionTypeKeys.METRIC_EDITOR_METRIC_DELETED, handleMetricDeleted);
    yield takeEvery(MetricEditorActionTypeKeys.METRIC_EDITOR_METRIC_DELETE_ERROR, handleMetricDeleteFailed);
    yield takeEvery(MetricEditorActionTypeKeys.METRIC_EDITOR_METRIC_SAVED, handleMetricSave);
    yield takeEvery(MetricEditorActionTypeKeys.METRIC_EDITOR_METRIC_SAVE_ERROR, handleMetricSaveError);
    yield takeEvery(
        MetricEditorActionTypeKeys.METRIC_EDITOR_UNSAVED_CHANGES_CANCEL,
        handleUnsavedDialogCancel,
    );
    yield takeEvery(MetricEditorActionTypeKeys.METRIC_EDITOR_OPEN_NEW, logCreateMetric);
}

function* logCreateMetric() {
    const state: IAppState = yield select();

    yield call(logClickOnCreateMetric, { state });
}

function* focusOrOpenMetricTab(action: IMetricEditorOpenAction) {
    const isMetricOpened: ReturnType<typeof isMetricEditorMetricOpened> = yield select(
        isMetricEditorMetricOpened,
        action.payload,
    );

    if (isMetricOpened) {
        yield put(metricEditorFocusMetric(action.payload));
    } else {
        const metric: ReturnType<ReturnType<typeof getCatalogItemByRef>> = yield select(
            getCatalogItemByRef(action.payload),
        );
        if (!metric || !isCatalogMeasure(metric)) {
            throw new Error(`Metric #${action.payload} is missing in catalog`);
        }

        yield put(metricEditorOpenTabWithMetric(metric.measure));
    }
}

function* handleMetricDeleted(action: IMetricEditorMetricDeletedAction) {
    const state: IAppState = yield select();

    yield call(logDeleteMetric, { state });
    yield put(
        addMessage({
            type: "success",
            translationKey: metricEditorMessages.deleteMetric.id,
            durationInMs: HIDE_SUCCESS_MESSAGE_AFTER,
        }),
    );

    const tabIdentifier = createTabIdentifier(action.payload.ref);
    yield put(metricEditorCloseTabs([tabIdentifier]));

    yield call(removeMetricFromBucketWithRefresh);

    yield put(CatalogUiActions.requestCatalogRefresh(true));
    yield call(metricsChanged);
}

function* handleMetricDeleteFailed() {
    yield put(
        addMessage({
            type: "error",
            translationKey: metricEditorMessages.deleteMetricFailed.id,
        }),
    );
}

function* handleUnsavedDialogCancel() {
    const data: ReturnType<typeof getUnsavedChangesData> = yield select(getUnsavedChangesData);
    yield put(createLeaveAnywayButtonClickedAction(data));
}

function* handleMetricSave(action: IMetricEditorMetricSaveAction) {
    const state: IAppState = yield select();

    const { metric, info, mode } = action.payload;
    const oldMetricId = info.previousMetric.id;
    const metricIdChanged = !isEmpty(oldMetricId) && metric.id !== oldMetricId;
    yield call(logCreateOrEditMetric, { state, mode });

    if (!isEqual(omit(metric, ["uri"]), omit(info.previousMetric, ["uri"]))) {
        yield put(
            addMessage({
                type: "success",
                translationKey: metricEditorMessages.saveMetric.id,
                durationInMs: HIDE_SUCCESS_MESSAGE_AFTER,
            }),
        );
        yield call(logMetricCreated, { state });
    }

    if (metricIdChanged) {
        const metricsInBucket: ReturnType<typeof getMetricsInBucket> = yield select(getMetricsInBucket);
        const metricsIdsInBucket = metricsInBucket.map((metric) => metric.attribute);

        if (metricsIdsInBucket.includes(oldMetricId)) {
            yield call(removeMetricFromBucketWithRefresh);
        }
    }

    yield put(CatalogUiActions.requestCatalogRefresh());
    yield call(metricsChanged);
}

function* removeMetricFromBucketWithRefresh() {
    // set catalog loading as removing metric from bucket takes time
    // and catalog will eventually be reloaded in any case
    yield put(setLoadingItems(true));
    yield put(setLoadingGroups(true));
    yield call(removeMetricFromBucket);
}

function* handleMetricSaveError() {
    yield put(
        addMessage({
            type: "error",
            translationKey: metricEditorMessages.metricSaveError.id,
            durationInMs: HIDE_ERROR_MESSAGE_AFTER,
        }),
    );
}

export function* removeMetricFromBucket() {
    const workspaceCatalog: IWorkspaceCatalog = yield call(fetchCatalog);

    const validItems = workspaceCatalog
        .allItems()
        .map((catalogItem) => {
            switch (catalogItem.type) {
                case CatalogItemType.metric:
                    return `${CatalogItemType.metric}/${catalogItem.measure.id}`;

                case CatalogItemType.attribute:
                    return `${CatalogItemType.attribute}/${catalogItem.attribute.id}`;

                case CatalogItemType.fact:
                    return `${CatalogItemType.fact}/${catalogItem.fact.id}`;

                case CatalogItemType.dateDataset:
                    return `${CatalogItemType.dateDataset}/${catalogItem.dataSet.id}`;
                default:
                    return undefined;
            }
        })
        .filter((item): item is string => item !== undefined);

    const metricsInBucket: ReturnType<typeof getMetricsInBucket> = yield select(getMetricsInBucket);

    const invalidBucketItems = metricsInBucket.filter((bucketMetric) => {
        const aggregation = bucketMetric.aggregation;
        const isAttribute = aggregation === "count" || aggregation === "approximate_count";
        const type = aggregation
            ? isAttribute
                ? CatalogItemType.attribute
                : CatalogItemType.fact
            : CatalogItemType.metric;

        return !validItems.includes(`${type}/${bucketMetric.attribute}`);
    });

    const localIds = invalidBucketItems.map((bucketMetric) => {
        return bucketMetric.localIdentifier;
    });

    if (!isEmpty(localIds)) {
        yield put(removeBucketItemsByLocalIds(localIds));
        // waiting for removal from the bucket to be finished
        yield take(ActionTypeKeys.UI_EXTENDED_REFERENCE_POINT_CHANGED);
    }
}

// RAW bucket items (`getMeasures` reads the buckets subtree), not decorated ones: both consumers
// read `.attribute` as the item's IDENTIFIER STRING, which is what a raw item carries, while a
// decorated item's `attribute` is the itemCache ENTRY.
function getMetricsInBucket(state: IAppState): IRawBucketItems {
    return getMeasures(state) as IRawBucketItems;
}

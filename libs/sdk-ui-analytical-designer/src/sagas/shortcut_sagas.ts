// (C) 2007-2026 GoodData Corporation

import { type SagaReturnType, all, call, fork, put, select, take, takeEvery } from "redux-saga/effects";

import { type IMeasure, idRef, insightAttributes, insightMeasures, newMeasure } from "@gooddata/sdk-model";

import { selectVisualizationType } from "../actions/buckets_actions.js";
import { dropCatalogItem } from "../actions/dnd_actions.js";
import {
    type applyAttributeShortcut as applyAttributeShortcutCreator,
    applyMetricOverTimeShortcut,
    type dropCatalogItem as dropCatalogItemCreator,
    shortcutDateDatasetsError,
    shortcutDateDatasetsUpdated,
    shortcutSetDroppedItem,
} from "../actions/shortcuts_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { ATTRIBUTE, FACT, METRIC } from "../constants/bucket.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import { getInsightWithBucketsViaMd } from "../selectors/insight_selectors.js";
import { getDatasetIdentifier, getTagsConfiguration } from "../selectors/route_selector.js";
import { getDroppedCatalogItem } from "../selectors/shortcuts_selector.js";
import {
    getTableVisualizationClass,
    getVisualizationClasses,
    isTableSelected,
} from "../services/visualization_class_service.js";
import { getDraggedCatalogItem } from "../store/drag_and_drop/dnd_selectors.js";
import { haveDateDatasetsBeenLoaded } from "../store/shortcuts/shortcut_date_datasets_selectors.js";
import { type ICatalogEntry } from "../typings/state_objects.js";
import { type ILoadDateDatasetsOptions, loadDateDatasets } from "../utils/api.js";

function* shortcutDropped({ payload: { catalogItem } }: ReturnType<typeof dropCatalogItemCreator>) {
    const isLoaded: ReturnType<typeof haveDateDatasetsBeenLoaded> = yield select(haveDateDatasetsBeenLoaded);
    if (isLoaded) {
        yield put(applyMetricOverTimeShortcut(catalogItem));
    } else {
        yield put(shortcutSetDroppedItem(catalogItem));
    }
}

function* watchShortcutDropped() {
    yield takeEvery(ActionTypeKeys.SHORTCUT_DROPPED_ON_METRIC_OVER_TIME, shortcutDropped);
}

function getAddedMeasure(catalogItem: ICatalogEntry): IMeasure {
    const ref = catalogItem.ref;
    const itemType = catalogItem.type;
    switch (itemType) {
        case METRIC:
            return newMeasure(ref);
        case FACT:
            return newMeasure(ref, (m) => m.aggregation("sum"));
        case ATTRIBUTE:
            return newMeasure(ref, (m) => m.aggregation("count"));
        default:
            return null;
    }
}

export function* fetchDateDatasets() {
    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
    const dataSetIdentifier: ReturnType<typeof getDatasetIdentifier> = yield select(getDatasetIdentifier);
    const tagsConfiguration: ReturnType<typeof getTagsConfiguration> = yield select(getTagsConfiguration);

    const insight: ReturnType<typeof getInsightWithBucketsViaMd> = yield select(getInsightWithBucketsViaMd);
    const draggedCatalogItem: ReturnType<typeof getDraggedCatalogItem> = yield select(getDraggedCatalogItem);
    const addedMeasure = getAddedMeasure(draggedCatalogItem);

    const options: ILoadDateDatasetsOptions = {
        items: [...insightMeasures(insight), ...insightAttributes(insight), addedMeasure],
        dataSetIdentifier: dataSetIdentifier && idRef(dataSetIdentifier),
        excludeObjectsWithTags: tagsConfiguration.excludeObjectsWithTags,
        includeObjectsWithTags: tagsConfiguration.includeObjectsWithTags,
    };

    try {
        const dateDatasets: SagaReturnType<typeof loadDateDatasets> = yield call(
            loadDateDatasets,
            projectId,
            options,
        );
        yield put(shortcutDateDatasetsUpdated(dateDatasets));

        const droppedMeasure: ReturnType<typeof getDroppedCatalogItem> = yield select(getDroppedCatalogItem);
        if (droppedMeasure) {
            yield put(applyMetricOverTimeShortcut(droppedMeasure));
        }
    } catch (err) {
        yield put(shortcutDateDatasetsError(err as Error));
    }
}

function* applyAttributeShortcut(action: ReturnType<typeof applyAttributeShortcutCreator>) {
    const tableIsSelected: ReturnType<typeof isTableSelected> = yield select(isTableSelected);

    if (!tableIsSelected) {
        const visualizationClasses: ReturnType<typeof getVisualizationClasses> =
            yield select(getVisualizationClasses);
        const tableVisualizationClass = getTableVisualizationClass(visualizationClasses);

        yield put(selectVisualizationType(tableVisualizationClass));

        yield take(ActionTypeKeys.EXTENDED_REFERENCE_POINT_CHANGED);
    }

    yield put(dropCatalogItem(ATTRIBUTE, action.payload.item));
}

function* watchShortcutDateDatasets() {
    yield takeEvery(ActionTypeKeys.SHORTCUT_DATE_DATASETS_UPDATE, fetchDateDatasets);
}

function* watchAttributeShortcut() {
    yield takeEvery(ActionTypeKeys.SHORTCUT_APPLY_ATTRIBUTE, applyAttributeShortcut);
}

export function* watchShortcuts() {
    yield all([fork(watchShortcutDropped), fork(watchShortcutDateDatasets), fork(watchAttributeShortcut)]);
}

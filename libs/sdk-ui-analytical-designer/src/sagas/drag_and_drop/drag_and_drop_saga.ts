// (C) 2020-2026 GoodData Corporation

import { put, takeEvery } from "redux-saga/effects";

import { ActionTypeKeys } from "../../constants/actions.js";

import { endDragBucketItem, endDragCatalogItem, endDragFilterItem } from "./drag_and_drop_actions.js";

function* resetDraggedItems() {
    yield put(endDragBucketItem());
    yield put(endDragFilterItem());
    yield put(endDragCatalogItem());
}

export function* dragAndDropWatcher() {
    yield takeEvery(ActionTypeKeys.UNDO_ACTION, resetDraggedItems);
    yield takeEvery(ActionTypeKeys.REDO_ACTION, resetDraggedItems);
}

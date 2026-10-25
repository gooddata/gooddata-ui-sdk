// (C) 2019-2026 GoodData Corporation

import { put, select, takeEvery } from "redux-saga/effects";

import {
    storeConfigurationPanelCollapsed,
    storeConfigurationPanelCollapsedByDragging,
} from "../../actions/buckets_actions.js";
import { DndUiActionTypeKeys } from "../../sagas/drag_and_drop/drag_and_drop_actions.js";
import {
    isConfigurationPanelCollapsed,
    isConfigurationPanelCollapsedByDragging,
} from "../../store/configuration_panel/configuration_panel_selectors.js";

function* handleCatalogItemDragBegin() {
    const isCollapsed: ReturnType<typeof isConfigurationPanelCollapsed> = yield select(
        isConfigurationPanelCollapsed,
    );
    if (!isCollapsed) {
        yield put(storeConfigurationPanelCollapsed(true));
        yield put(storeConfigurationPanelCollapsedByDragging(true));
    }
}

function* handleCatalogItemDragFailed() {
    const isCollapsedByDragging: ReturnType<typeof isConfigurationPanelCollapsedByDragging> = yield select(
        isConfigurationPanelCollapsedByDragging,
    );
    if (isCollapsedByDragging) {
        yield put(storeConfigurationPanelCollapsed(false));
        yield put(storeConfigurationPanelCollapsedByDragging(false));
    }
}

export function* watchDraggedCatalogItems() {
    yield takeEvery(DndUiActionTypeKeys.UI_DND_CATALOG_ITEM_DRAG_BEGIN, handleCatalogItemDragBegin);
    yield takeEvery(DndUiActionTypeKeys.UI_DND_CATALOG_ITEM_DRAG_FAILED, handleCatalogItemDragFailed);
}

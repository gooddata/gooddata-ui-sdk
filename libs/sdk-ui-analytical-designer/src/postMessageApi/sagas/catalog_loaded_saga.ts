// (C) 2026 GoodData Corporation

import { call, select, takeEvery } from "redux-saga/effects";

import { catalogLoadSucceeded } from "../../sagas/catalog/catalog_saga_actions.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { catalogLoaded } from "../outgoing/catalog_loaded_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

export function* notifyCatalogLoaded() {
    const isEmbedded: ReturnType<typeof getIsEmbedded> = yield select(getIsEmbedded);
    if (!isEmbedded) {
        return;
    }
    const availableCommands: ReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    yield call(catalogLoaded, availableCommands);
}

export function* watchCatalogLoaded() {
    yield takeEvery(catalogLoadSucceeded.type, notifyCatalogLoaded);
}

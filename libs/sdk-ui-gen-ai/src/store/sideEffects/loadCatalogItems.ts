// (C) 2024-2026 GoodData Corporation

import type { PayloadAction } from "@reduxjs/toolkit";
import { call, getContext, put, select } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { catalogItemsStateSelector } from "../chatWindow/chatWindowSelectors.js";
import { setCatalogItemsActions, setCatalogItemsLoadingAction } from "../chatWindow/chatWindowSlice.js";
import { type OptionsDispatcher } from "../options.js";
import type { RootState } from "../types.js";

/**
 * Load catalog items palette from the backend.
 * @internal
 */
export function* loadCatalogItems({ payload: { isOpen } }: PayloadAction<{ isOpen: boolean }>) {
    if (!isOpen) {
        return;
    }

    yield call(loadCatalogItemsInternal);
}

/**
 * Load catalog items palette from the backend.
 * @internal
 */
export function* loadCatalogItemsInternal() {
    const options: OptionsDispatcher = yield getContext("optionsDispatcher");

    const state: RootState["chatWindow"]["catalogItemsState"] = yield select(catalogItemsStateSelector);
    if (state === "loaded" || state === "loading") {
        return;
    }

    try {
        yield put(setCatalogItemsLoadingAction());

        const catalogItems = options.getCatalogItems();

        if (catalogItems) {
            // If catalog items are already provided, just set it to the store
            yield put(setCatalogItemsActions(catalogItems));
            return;
        }

        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");

        const catalogService = backend.workspace(workspace).catalog().withPageSize(1000).load;
        const catalogServiceCall = catalogService.bind(catalogService);

        const results: Awaited<ReturnType<typeof catalogServiceCall>> = yield call(catalogServiceCall);
        const catalogItemsList = results.allItems();

        options.setCatalogItems(catalogItemsList);
        yield put(setCatalogItemsActions(catalogItemsList));
    } catch (e) {
        options.setCatalogItems(undefined);
        console.error("Failed to load catalog items", e);
        yield put(setCatalogItemsActions(undefined));
    }
}

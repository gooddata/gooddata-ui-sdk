// (C) 2024-2026 GoodData Corporation

import { call, getContext, put } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { setCatalogItemsActions } from "../chatWindow/chatWindowSlice.js";
import { type OptionsDispatcher } from "../options.js";

/**
 * Load catalog items palette from the backend.
 * @internal
 */
export function* loadCatalogItems() {
    const options: OptionsDispatcher = yield getContext("optionsDispatcher");

    try {
        const catalogItems = options.getCatalogItems();

        if (catalogItems) {
            // If catalog items are already provided, just set it to the store
            yield put(setCatalogItemsActions(catalogItems));
            return;
        }

        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");

        const catalogService = backend.workspace(workspace).catalog().load;
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

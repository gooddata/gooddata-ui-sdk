// (C) 2026 GoodData Corporation

import { call, getContext, put, select } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { type ContextDashboardsState } from "../../types.js";
import { contextDashboardsSelector } from "../chatWindow/chatWindowSelectors.js";
import {
    contextDashboardsLoadFailedAction,
    contextDashboardsLoadingAction,
    contextDashboardsPageLoadedAction,
    setContextDashboardsAction,
} from "../chatWindow/chatWindowSlice.js";
import { type OptionsDispatcher } from "../options.js";

const PAGE_SIZE = 100;

/**
 * Load the first page of dashboards for the context chooser. Skips when already loaded.
 * @internal
 */
export function* initContextDashboards() {
    const state: ContextDashboardsState = yield select(contextDashboardsSelector);

    if (state.isLoading || state.loadedPages > 0) {
        return;
    }

    yield call(loadContextDashboardsPage, 0);
}

/**
 * Load the next page of dashboards for the context chooser.
 * @internal
 */
export function* loadContextDashboardsNextPage() {
    const state: ContextDashboardsState = yield select(contextDashboardsSelector);

    if (state.isLoading || !state.hasNextPage) {
        return;
    }

    yield call(loadContextDashboardsPage, state.loadedPages);
}

function* loadContextDashboardsPage(page: number) {
    const options: OptionsDispatcher = yield getContext("optionsDispatcher");
    const dashboards = options.getDashboards();

    if (dashboards) {
        yield put(setContextDashboardsAction({ items: dashboards }));
        return;
    }

    yield put(contextDashboardsLoadingAction());

    try {
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");

        const query = backend
            .workspace(workspace)
            .dashboards()
            .getDashboardsQuery()
            .withPage(page)
            .withSize(PAGE_SIZE)
            .withSorting(["title,asc"]);
        const queryCall = query.query.bind(query);

        const result: Awaited<ReturnType<typeof queryCall>> = yield call(queryCall);

        yield put(
            contextDashboardsPageLoadedAction({
                items: result.items,
                hasNextPage: result.offset + result.items.length < result.totalCount,
            }),
        );
    } catch (e) {
        console.error("Failed to load dashboards for the context chooser", e);
        yield put(contextDashboardsLoadFailedAction());
    }
}

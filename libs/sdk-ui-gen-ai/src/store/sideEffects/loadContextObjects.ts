// (C) 2026 GoodData Corporation

import { call, cancelled, getContext, put, select } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { insightRef, insightTitle } from "@gooddata/sdk-model";

import { type ContextObjectKind, type ContextObjectsState, type IGenAIContextListItem } from "../../types.js";
import { toContextListItem } from "../../utils.js";
import { contextObjectsSelector } from "../chatWindow/chatWindowSelectors.js";
import {
    contextObjectsLoadFailedAction,
    contextObjectsLoadingAction,
    contextObjectsPageLoadedAction,
    type loadContextObjectsNextPageAction,
    setContextObjectsAction,
} from "../chatWindow/chatWindowSlice.js";
import { type OptionsDispatcher } from "../options.js";

const PAGE_SIZE = 100;

type ContextObjectsPage = {
    items: IGenAIContextListItem[];
    hasNextPage: boolean;
};

/**
 * Load the first page of the dashboards offered by the context chooser. Skips it when already
 * loaded. Only the dashboards - the visualizations follow them in the list.
 * @internal
 */
export function* initContextObjects() {
    yield call(initContextObjectList, "dashboard");
}

/**
 * Load the next page of one of the object lists offered by the context chooser. Each kind is
 * paged on its own, so a load in flight for one kind does not block the other.
 * @internal
 */
export function* loadContextObjectsNextPage({
    payload: { kind },
}: ReturnType<typeof loadContextObjectsNextPageAction>) {
    const state: ContextObjectsState = yield select(contextObjectsSelector);
    const list = state[kind];

    if (list.isLoading || !list.hasNextPage) {
        return;
    }

    yield call(loadContextObjectsPage, kind, list.loadedPages);
}

function* initContextObjectList(kind: ContextObjectKind) {
    const state: ContextObjectsState = yield select(contextObjectsSelector);
    const list = state[kind];

    if (list.isLoading || list.loadedPages > 0) {
        return;
    }

    yield call(loadContextObjectsPage, kind, 0);
}

function* loadContextObjectsPage(kind: ContextObjectKind, page: number) {
    const externalItems: IGenAIContextListItem[] | undefined = yield call(getExternalItems, kind);

    if (externalItems) {
        yield put(setContextObjectsAction({ kind, items: externalItems }));
        return;
    }

    yield put(contextObjectsLoadingAction({ kind }));

    try {
        const loaded: ContextObjectsPage = yield call(
            kind === "dashboard" ? queryDashboardsPage : queryVisualizationsPage,
            page,
        );

        yield put(contextObjectsPageLoadedAction({ kind, ...loaded }));
    } catch (e) {
        console.error(`Failed to load ${kind}s for the context chooser`, e);
        yield put(contextObjectsLoadFailedAction({ kind }));
    } finally {
        const wasCancelled: boolean = yield cancelled();

        if (wasCancelled) {
            yield put(contextObjectsLoadFailedAction({ kind }));
        }
    }
}

function* getExternalItems(kind: ContextObjectKind) {
    const options: OptionsDispatcher = yield getContext("optionsDispatcher");

    if (kind === "dashboard") {
        return options.getDashboards()?.map((dashboard) => toContextListItem(dashboard.ref, dashboard.title));
    }

    return options
        .getVisualizations()
        ?.map((insight) => toContextListItem(insightRef(insight), insightTitle(insight)));
}

function* queryDashboardsPage(page: number) {
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

    return {
        items: result.items.map((dashboard) => toContextListItem(dashboard.ref, dashboard.title)),
        hasNextPage: hasNextPage(result),
    } satisfies ContextObjectsPage;
}

function* queryVisualizationsPage(page: number) {
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");

    const query = backend
        .workspace(workspace)
        .insights()
        .getInsightsQuery()
        .withPage(page)
        .withSize(PAGE_SIZE)
        .withSorting(["title,asc"]);
    const queryCall = query.query.bind(query);

    const result: Awaited<ReturnType<typeof queryCall>> = yield call(queryCall);

    return {
        items: result.items.map((insight) => toContextListItem(insightRef(insight), insightTitle(insight))),
        hasNextPage: hasNextPage(result),
    } satisfies ContextObjectsPage;
}

function hasNextPage(result: { items: unknown[]; offset: number; totalCount: number }): boolean {
    return result.offset + result.items.length < result.totalCount;
}

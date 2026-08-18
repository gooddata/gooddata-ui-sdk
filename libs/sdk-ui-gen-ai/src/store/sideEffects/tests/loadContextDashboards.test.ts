// (C) 2026 GoodData Corporation

import { runSaga } from "redux-saga";
import { describe, expect, it, vi } from "vitest";

import { type IListedDashboard, type ObjRef, idRef } from "@gooddata/sdk-model";

import { type ContextDashboardsState } from "../../../types.js";
import {
    chatWindowSliceName,
    contextDashboardsLoadFailedAction,
    contextDashboardsLoadingAction,
    contextDashboardsPageLoadedAction,
    setContextDashboardsAction,
} from "../../chatWindow/chatWindowSlice.js";
import { initContextDashboards, loadContextDashboardsNextPage } from "../loadContextDashboards.js";

const emptyState: ContextDashboardsState = {
    items: [],
    loadedPages: 0,
    hasNextPage: true,
    isLoading: false,
};

function listedDashboard(id: string, ref: ObjRef = idRef(id, "analyticalDashboard")): IListedDashboard {
    return {
        ref,
        identifier: id,
        uri: `/${id}`,
        title: `Dashboard ${id}`,
        description: "",
        created: "2026-01-01 00:00:00",
        updated: "2026-01-01 00:00:00",
        availability: "full",
        shareStatus: "public",
    };
}

function dashboardsQuery(result: { items: IListedDashboard[]; offset: number; totalCount: number }) {
    const asked = { page: -1, size: -1, sorting: [] as string[] };
    const query: any = {
        withPage: (page: number) => ((asked.page = page), query),
        withSize: (size: number) => ((asked.size = size), query),
        withSorting: (sorting: string[]) => ((asked.sorting = sorting), query),
        query: () => Promise.resolve(result),
    };

    return { asked, query };
}

async function run(
    saga: () => Generator,
    {
        contextDashboards = emptyState,
        externalDashboards,
        query,
    }: {
        contextDashboards?: ContextDashboardsState;
        externalDashboards?: IListedDashboard[];
        query?: any;
    } = {},
) {
    const dispatched: unknown[] = [];

    await runSaga(
        {
            dispatch: (action: unknown) => dispatched.push(action),
            getState: () => ({ [chatWindowSliceName]: { contextDashboards } }),
            context: {
                optionsDispatcher: { getDashboards: () => externalDashboards },
                backend: { workspace: () => ({ dashboards: () => ({ getDashboardsQuery: () => query }) }) },
                workspace: "ws",
            },
        },
        saga as any,
    ).toPromise();

    return dispatched;
}

describe("initContextDashboards", () => {
    it("loads the first page when nothing is loaded yet", async () => {
        const { asked, query } = dashboardsQuery({
            items: [listedDashboard("a")],
            offset: 0,
            totalCount: 1,
        });

        const dispatched = await run(initContextDashboards, { query });

        expect(asked).toEqual({ page: 0, size: 100, sorting: ["title,asc"] });
        expect(dispatched).toEqual([
            contextDashboardsLoadingAction(),
            contextDashboardsPageLoadedAction({ items: [listedDashboard("a")], hasNextPage: false }),
        ]);
    });

    it("does nothing when the list is already loaded", async () => {
        const dispatched = await run(initContextDashboards, {
            contextDashboards: { ...emptyState, loadedPages: 1 },
        });

        expect(dispatched).toEqual([]);
    });

    it("does nothing while a load is in flight", async () => {
        const dispatched = await run(initContextDashboards, {
            contextDashboards: { ...emptyState, isLoading: true },
        });

        expect(dispatched).toEqual([]);
    });

    it("takes an externally supplied list as complete and never queries the backend", async () => {
        const dispatched = await run(initContextDashboards, {
            externalDashboards: [listedDashboard("a"), listedDashboard("b")],
        });

        expect(dispatched).toEqual([
            setContextDashboardsAction({ items: [listedDashboard("a"), listedDashboard("b")] }),
        ]);
    });

    it("reports a next page while the backend has more dashboards", async () => {
        const { query } = dashboardsQuery({
            items: [listedDashboard("a"), listedDashboard("b")],
            offset: 0,
            totalCount: 5,
        });

        const dispatched = await run(initContextDashboards, { query });

        expect(dispatched.at(-1)).toEqual(
            contextDashboardsPageLoadedAction({
                items: [listedDashboard("a"), listedDashboard("b")],
                hasNextPage: true,
            }),
        );
    });

    it("stops paging when the query throws", async () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const query = {
            withPage: () => query,
            withSize: () => query,
            withSorting: () => query,
            query: () => Promise.reject(new Error("boom")),
        };

        const dispatched = await run(initContextDashboards, { query });

        expect(dispatched).toEqual([contextDashboardsLoadingAction(), contextDashboardsLoadFailedAction()]);
        errorSpy.mockRestore();
    });
});

describe("loadContextDashboardsNextPage", () => {
    it("asks for the page following the ones already loaded", async () => {
        const { asked, query } = dashboardsQuery({
            items: [listedDashboard("c")],
            offset: 200,
            totalCount: 201,
        });

        await run(loadContextDashboardsNextPage, {
            contextDashboards: { ...emptyState, loadedPages: 2 },
            query,
        });

        expect(asked.page).toBe(2);
    });

    it("does nothing once the backend has run out of dashboards", async () => {
        const dispatched = await run(loadContextDashboardsNextPage, {
            contextDashboards: { ...emptyState, loadedPages: 1, hasNextPage: false },
        });

        expect(dispatched).toEqual([]);
    });

    it("does nothing while a load is in flight", async () => {
        const dispatched = await run(loadContextDashboardsNextPage, {
            contextDashboards: { ...emptyState, loadedPages: 1, isLoading: true },
        });

        expect(dispatched).toEqual([]);
    });
});

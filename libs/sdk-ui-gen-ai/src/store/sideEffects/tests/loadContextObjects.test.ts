// (C) 2026 GoodData Corporation

import { runSaga } from "redux-saga";
import { describe, expect, it, vi } from "vitest";

import { type IInsight, type IListedDashboard, type ObjRef, idRef } from "@gooddata/sdk-model";

import { type ContextObjectKind, type ContextObjectListState } from "../../../types.js";
import {
    chatWindowSliceName,
    contextObjectsLoadFailedAction,
    contextObjectsLoadingAction,
    contextObjectsPageLoadedAction,
    loadContextObjectsNextPageAction,
    setContextObjectsAction,
} from "../../chatWindow/chatWindowSlice.js";
import {
    initContextObjects,
    loadContextObjectsNextPage,
    reloadContextObjects,
} from "../loadContextObjects.js";

const emptyState: ContextObjectListState = {
    items: [],
    loadedPages: 0,
    hasNextPage: true,
    isLoading: false,
    isExternal: false,
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

function insight(id: string): IInsight {
    return {
        insight: {
            identifier: id,
            uri: `/${id}`,
            ref: idRef(id, "insight"),
            title: `Insight ${id}`,
            visualizationUrl: "local:table",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
        },
    };
}

function pagedQuery(result: { items: unknown[]; offset: number; totalCount: number }) {
    const asked = {
        page: -1,
        size: -1,
        sorting: [] as string[],
        filter: undefined as { title?: string } | undefined,
    };
    const query: any = {
        withPage: (page: number) => ((asked.page = page), query),
        withSize: (size: number) => ((asked.size = size), query),
        withSorting: (sorting: string[]) => ((asked.sorting = sorting), query),
        withFilter: (filter: { title?: string }) => ((asked.filter = filter), query),
        query: () => Promise.resolve(result),
    };

    return { asked, query };
}

const emptyPage = pagedQuery({ items: [], offset: 0, totalCount: 0 }).query;

async function run(
    saga: () => Generator,
    {
        dashboards = emptyState,
        visualizations = emptyState,
        externalDashboards,
        externalVisualizations,
        search = "",
        dashboardsQuery = emptyPage,
        insightsQuery = emptyPage,
    }: {
        dashboards?: ContextObjectListState;
        visualizations?: ContextObjectListState;
        externalDashboards?: IListedDashboard[];
        externalVisualizations?: IInsight[];
        search?: string;
        dashboardsQuery?: any;
        insightsQuery?: any;
    } = {},
) {
    const dispatched: unknown[] = [];
    const lists: Record<ContextObjectKind, ContextObjectListState> = {
        dashboard: { ...dashboards },
        visualization: { ...visualizations },
    };

    await runSaga(
        {
            dispatch: (action: any) => {
                dispatched.push(action);

                // Keep what the sagas select in step with the pages they load, as the reducer does.
                if (action.type === contextObjectsPageLoadedAction.type) {
                    const list = lists[action.payload.kind as ContextObjectKind];

                    list.loadedPages += 1;
                    list.hasNextPage = action.payload.hasNextPage;
                }
            },
            getState: () => ({
                [chatWindowSliceName]: {
                    contextObjects: lists,
                    contextObjectsSearch: search,
                },
            }),
            context: {
                optionsDispatcher: {
                    getDashboards: () => externalDashboards,
                    getVisualizations: () => externalVisualizations,
                },
                backend: {
                    workspace: () => ({
                        dashboards: () => ({ getDashboardsQuery: () => dashboardsQuery }),
                        insights: () => ({ getInsightsQuery: () => insightsQuery }),
                    }),
                },
                workspace: "ws",
            },
        },
        saga as any,
    ).toPromise();

    return dispatched;
}

const nextPage = (kind: ContextObjectKind) => () =>
    loadContextObjectsNextPage(loadContextObjectsNextPageAction({ kind }));

describe("initContextObjects", () => {
    it("loads the first page of the dashboards when nothing is loaded yet", async () => {
        const dashboards = pagedQuery({ items: [listedDashboard("a")], offset: 0, totalCount: 1 });

        const dispatched = await run(initContextObjects, { dashboardsQuery: dashboards.query });

        expect(dashboards.asked).toEqual({
            page: 0,
            size: 100,
            sorting: ["title,asc"],
            filter: undefined,
        });
        expect(dispatched).toContainEqual(
            contextObjectsPageLoadedAction({
                kind: "dashboard",
                items: [{ id: "a", ref: idRef("a", "analyticalDashboard"), title: "Dashboard a" }],
                hasNextPage: false,
            }),
        );
    });

    it("leaves the visualizations alone until the dashboards run out", async () => {
        const insights = pagedQuery({ items: [insight("v1")], offset: 0, totalCount: 1 });

        const dispatched = await run(initContextObjects, { insightsQuery: insights.query });

        expect(insights.asked.page).toBe(-1);
        expect(dispatched.every((action: any) => action.payload.kind === "dashboard")).toBe(true);
    });

    it("does nothing when the dashboards are already loaded", async () => {
        const dispatched = await run(initContextObjects, {
            dashboards: { ...emptyState, loadedPages: 1 },
        });

        expect(dispatched).toEqual([]);
    });

    it("does nothing while a load is in flight", async () => {
        const dispatched = await run(initContextObjects, {
            dashboards: { ...emptyState, isLoading: true },
        });

        expect(dispatched).toEqual([]);
    });

    it("takes an externally supplied list as complete and never queries for dashboards", async () => {
        const dashboards = pagedQuery({ items: [listedDashboard("never")], offset: 0, totalCount: 1 });

        const dispatched = await run(initContextObjects, {
            externalDashboards: [listedDashboard("a"), listedDashboard("b")],
            dashboardsQuery: dashboards.query,
        });

        expect(dashboards.asked.page).toBe(-1);
        expect(dispatched).toContainEqual(
            setContextObjectsAction({
                kind: "dashboard",
                items: [
                    { id: "a", ref: idRef("a", "analyticalDashboard"), title: "Dashboard a" },
                    { id: "b", ref: idRef("b", "analyticalDashboard"), title: "Dashboard b" },
                ],
            }),
        );
    });

    it("still queries the backend for dashboards when visualizations come from outside", async () => {
        const dashboards = pagedQuery({ items: [listedDashboard("a")], offset: 0, totalCount: 1 });

        await run(initContextObjects, {
            externalVisualizations: [insight("v1")],
            dashboardsQuery: dashboards.query,
        });

        expect(dashboards.asked.page).toBe(0);
    });

    it("reports a next page while the backend has more objects", async () => {
        const dashboards = pagedQuery({
            items: [listedDashboard("a"), listedDashboard("b")],
            offset: 0,
            totalCount: 5,
        });

        const dispatched = await run(initContextObjects, { dashboardsQuery: dashboards.query });

        expect(dispatched).toContainEqual(
            contextObjectsPageLoadedAction({
                kind: "dashboard",
                items: [
                    { id: "a", ref: idRef("a", "analyticalDashboard"), title: "Dashboard a" },
                    { id: "b", ref: idRef("b", "analyticalDashboard"), title: "Dashboard b" },
                ],
                hasNextPage: true,
            }),
        );
    });

    const failingQuery = () => {
        const query: any = {
            withPage: () => query,
            withSize: () => query,
            withSorting: () => query,
            query: () => Promise.reject(new Error("boom")),
        };

        return query;
    };

    it("stops paging when the query throws", async () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const dispatched = await run(initContextObjects, { dashboardsQuery: failingQuery() });

        expect(dispatched).toEqual([
            contextObjectsLoadingAction({ kind: "dashboard" }),
            contextObjectsLoadFailedAction({ kind: "dashboard" }),
        ]);
        errorSpy.mockRestore();
    });

    it("keeps the dashboards when the visualization page throws", async () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const dispatched = await run(nextPage("visualization"), {
            dashboards: { ...emptyState, loadedPages: 1, hasNextPage: false },
            insightsQuery: failingQuery(),
        });

        expect(dispatched).toEqual([
            contextObjectsLoadingAction({ kind: "visualization" }),
            contextObjectsLoadFailedAction({ kind: "visualization" }),
        ]);
        errorSpy.mockRestore();
    });

    it("clears loading when init is cancelled mid-load", async () => {
        let resolveDashboardQuery: (value: unknown) => void = () => {};
        const dashboardPending = new Promise((resolve) => {
            resolveDashboardQuery = resolve;
        });
        const dashboardsQuery: any = {
            withPage: () => dashboardsQuery,
            withSize: () => dashboardsQuery,
            withSorting: () => dashboardsQuery,
            query: () => dashboardPending,
        };
        const dispatched: unknown[] = [];

        const task = runSaga(
            {
                dispatch: (action: unknown) => dispatched.push(action),
                getState: () => ({
                    [chatWindowSliceName]: {
                        contextObjects: { dashboard: emptyState, visualization: emptyState },
                        contextObjectsSearch: "",
                    },
                }),
                context: {
                    optionsDispatcher: { getDashboards: () => undefined },
                    backend: {
                        workspace: () => ({
                            dashboards: () => ({ getDashboardsQuery: () => dashboardsQuery }),
                            insights: () => ({ getInsightsQuery: () => emptyPage }),
                        }),
                    },
                    workspace: "ws",
                },
            },
            initContextObjects as any,
        );

        await Promise.resolve();
        expect(dispatched).toContainEqual(contextObjectsLoadingAction({ kind: "dashboard" }));

        task.cancel();
        await task.toPromise().catch(() => {});

        expect(dispatched).toContainEqual(contextObjectsLoadFailedAction({ kind: "dashboard" }));
        resolveDashboardQuery({ items: [], offset: 0, totalCount: 0 });
    });
});

describe("searching", () => {
    it("asks the backend for the searched title", async () => {
        const dashboards = pagedQuery({ items: [listedDashboard("a")], offset: 0, totalCount: 1 });

        await run(initContextObjects, { search: "revenue", dashboardsQuery: dashboards.query });

        expect(dashboards.asked.filter).toEqual({ title: "revenue" });
    });

    it("keeps the search on the pages that follow", async () => {
        const insights = pagedQuery({ items: [insight("v1")], offset: 100, totalCount: 300 });

        await run(nextPage("visualization"), {
            visualizations: { ...emptyState, loadedPages: 1 },
            search: "revenue",
            insightsQuery: insights.query,
        });

        expect(insights.asked).toMatchObject({ page: 1, filter: { title: "revenue" } });
    });

    it("does not filter on whitespace alone", async () => {
        const dashboards = pagedQuery({ items: [listedDashboard("a")], offset: 0, totalCount: 1 });

        await run(initContextObjects, { search: "   ", dashboardsQuery: dashboards.query });

        expect(dashboards.asked.filter).toBeUndefined();
    });

    it("starts both lists over when the search changed", async () => {
        const dashboards = pagedQuery({ items: [listedDashboard("a")], offset: 0, totalCount: 1 });
        const insights = pagedQuery({ items: [insight("v1")], offset: 0, totalCount: 1 });

        const dispatched = await run(reloadContextObjects, {
            search: "revenue",
            dashboardsQuery: dashboards.query,
            insightsQuery: insights.query,
        });

        expect(dashboards.asked).toMatchObject({ page: 0, filter: { title: "revenue" } });
        expect(insights.asked).toMatchObject({ page: 0, filter: { title: "revenue" } });
        expect(dispatched).toContainEqual(
            contextObjectsPageLoadedAction({
                kind: "visualization",
                items: [
                    {
                        id: "v1",
                        ref: idRef("v1", "insight"),
                        title: "Insight v1",
                        visualizationUrl: "local:table",
                    },
                ],
                hasNextPage: false,
            }),
        );
        expect(dispatched).toContainEqual(
            contextObjectsPageLoadedAction({
                kind: "dashboard",
                items: [{ id: "a", ref: idRef("a", "analyticalDashboard"), title: "Dashboard a" }],
                hasNextPage: false,
            }),
        );
    });

    it("holds the visualizations back while the searched dashboards have more pages", async () => {
        const dashboards = pagedQuery({ items: [listedDashboard("a")], offset: 0, totalCount: 5 });
        const insights = pagedQuery({ items: [insight("v1")], offset: 0, totalCount: 1 });

        await run(reloadContextObjects, {
            search: "revenue",
            dashboardsQuery: dashboards.query,
            insightsQuery: insights.query,
        });

        expect(insights.asked.page).toBe(-1);
    });
});

describe("loadContextObjectsNextPage", () => {
    it("asks for the first page of the visualizations once the dashboards are exhausted", async () => {
        const insights = pagedQuery({ items: [insight("v1")], offset: 0, totalCount: 1 });

        const dispatched = await run(nextPage("visualization"), {
            dashboards: { ...emptyState, loadedPages: 2, hasNextPage: false },
            insightsQuery: insights.query,
        });

        expect(insights.asked).toEqual({ page: 0, size: 100, sorting: ["title,asc"], filter: undefined });
        expect(dispatched).toContainEqual(
            contextObjectsPageLoadedAction({
                kind: "visualization",
                items: [
                    {
                        id: "v1",
                        ref: idRef("v1", "insight"),
                        title: "Insight v1",
                        visualizationUrl: "local:table",
                    },
                ],
                hasNextPage: false,
            }),
        );
    });

    it("takes an externally supplied list as complete and never queries for visualizations", async () => {
        const insights = pagedQuery({ items: [insight("never")], offset: 0, totalCount: 1 });

        const dispatched = await run(nextPage("visualization"), {
            externalVisualizations: [insight("v1"), insight("v2")],
            insightsQuery: insights.query,
        });

        expect(insights.asked.page).toBe(-1);
        expect(dispatched).toContainEqual(
            setContextObjectsAction({
                kind: "visualization",
                items: [
                    {
                        id: "v1",
                        ref: idRef("v1", "insight"),
                        title: "Insight v1",
                        visualizationUrl: "local:table",
                    },
                    {
                        id: "v2",
                        ref: idRef("v2", "insight"),
                        title: "Insight v2",
                        visualizationUrl: "local:table",
                    },
                ],
            }),
        );
    });

    it("asks for the page following the ones already loaded", async () => {
        const insights = pagedQuery({ items: [insight("v3")], offset: 200, totalCount: 201 });

        await run(nextPage("visualization"), {
            visualizations: { ...emptyState, loadedPages: 2 },
            insightsQuery: insights.query,
        });

        expect(insights.asked.page).toBe(2);
    });

    it("pages only the kind it was asked for", async () => {
        const dashboards = pagedQuery({ items: [listedDashboard("c")], offset: 100, totalCount: 101 });

        await run(nextPage("visualization"), {
            visualizations: { ...emptyState, loadedPages: 1 },
            dashboardsQuery: dashboards.query,
        });

        expect(dashboards.asked.page).toBe(-1);
    });

    it("does nothing once the backend has run out of objects", async () => {
        const dispatched = await run(nextPage("dashboard"), {
            dashboards: { ...emptyState, loadedPages: 1, hasNextPage: false },
        });

        expect(dispatched).toEqual([]);
    });

    it("does nothing while a load is in flight", async () => {
        const dispatched = await run(nextPage("dashboard"), {
            dashboards: { ...emptyState, loadedPages: 1, isLoading: true },
        });

        expect(dispatched).toEqual([]);
    });
});

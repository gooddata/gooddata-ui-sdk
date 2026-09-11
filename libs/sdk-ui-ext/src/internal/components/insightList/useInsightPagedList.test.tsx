// (C) 2026 GoodData Corporation

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IAnalyticalBackend, type IFilterBaseOptions } from "@gooddata/sdk-backend-spi";
import { type IInsight, uriRef } from "@gooddata/sdk-model";

import { type ITabsIds, useInsightPagedList } from "./useInsightPagedList.js";

const tabsIds: ITabsIds = { my: "my", all: "all" };

const AUTHOR = "author-login";
const TOTAL_INSIGHTS = 160;
const PAGE_SIZE = 50;

function insight(index: number): IInsight {
    return {
        insight: {
            identifier: `insight-${index}`,
            uri: `/insight/${index}`,
            ref: uriRef(`/insight/${index}`),
            title: `Insight ${index}`,
            visualizationUrl: "local:table",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
        },
    } as IInsight;
}

const allInsights = Array.from({ length: TOTAL_INSIGHTS }, (_, index) => insight(index));

interface IInsightsQueryStub {
    withSize: () => IInsightsQueryStub;
    withPage: (page: number) => IInsightsQueryStub;
    withSorting: () => IInsightsQueryStub;
    withInclude: () => IInsightsQueryStub;
    withFilter: (filter: IFilterBaseOptions) => IInsightsQueryStub;
    query: () => Promise<{ items: IInsight[]; totalCount: number }>;
}

interface IQueryCall {
    page: number;
    createdBy: string[] | undefined;
}

/**
 * A workspace the current user authored nothing in: a query filtered by createdBy comes back empty,
 * every other query pages through all the insights.
 */
function createBackend() {
    const calls: IQueryCall[] = [];

    const getInsightsQuery = (): IInsightsQueryStub => {
        let page = 0;
        let filter: IFilterBaseOptions | undefined;

        const query: IInsightsQueryStub = {
            withSize: () => query,
            withPage: (nextPage: number) => {
                page = nextPage;
                return query;
            },
            withSorting: () => query,
            withInclude: () => query,
            withFilter: (nextFilter: IFilterBaseOptions) => {
                filter = nextFilter;
                return query;
            },
            query: () => {
                calls.push({ page, createdBy: filter?.createdBy });
                if (filter?.createdBy?.length) {
                    return Promise.resolve({ items: [], totalCount: 0 });
                }
                return Promise.resolve({
                    items: allInsights.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
                    totalCount: TOTAL_INSIGHTS,
                });
            },
        };

        return query;
    };

    const backend = {
        workspace: () => ({ insights: () => ({ getInsightsQuery }) }),
    } as unknown as IAnalyticalBackend;

    return { backend, calls };
}

describe("useInsightPagedList", () => {
    describe("with an author filter owned by the caller", () => {
        function renderPagedList(createdByFilter: string[] | undefined) {
            const { backend, calls } = createBackend();

            const { result, rerender } = renderHook(
                (props: { createdByFilter: string[] | undefined }) =>
                    useInsightPagedList({
                        backend,
                        workspaceId: "workspace",
                        author: AUTHOR,
                        tabsIds,
                        createdByFilter: props.createdByFilter,
                        includeAuthorInfo: true,
                    }),
                { initialProps: { createdByFilter } },
            );

            return { result, rerender, calls };
        }

        it("reports an empty result instead of widening the query behind the filter", async () => {
            const { result, calls } = renderPagedList([AUTHOR]);

            act(() => {
                result.current.loadInitialItems();
            });

            await waitFor(() => expect(result.current.initialLoadCompleted).toBe(true));
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            expect(result.current.items).toEqual([]);
            expect(result.current.totalItemsCount).toBe(0);
            expect(result.current.hasNextPage).toBe(false);
            expect(calls).toEqual([{ page: 0, createdBy: [AUTHOR] }]);
        });

        it("pages on once the caller drops the filter", async () => {
            const { result, rerender, calls } = renderPagedList([AUTHOR]);

            act(() => {
                result.current.loadInitialItems();
            });
            await waitFor(() => expect(result.current.initialLoadCompleted).toBe(true));

            rerender({ createdByFilter: undefined });
            act(() => {
                result.current.resetItems();
            });
            await waitFor(() => expect(result.current.items).toHaveLength(PAGE_SIZE));

            act(() => {
                result.current.loadNextPage();
            });
            await waitFor(() => expect(result.current.items).toHaveLength(2 * PAGE_SIZE));

            expect(result.current.totalItemsCount).toBe(TOTAL_INSIGHTS);
            expect(result.current.hasNextPage).toBe(true);
            expect(calls).toEqual([
                { page: 0, createdBy: [AUTHOR] },
                { page: 0, createdBy: undefined },
                { page: 1, createdBy: undefined },
            ]);
        });
    });

    it("leaves a caller-supplied author filter alone even without includeAuthorInfo", async () => {
        const { backend, calls } = createBackend();

        const { result } = renderHook(() =>
            useInsightPagedList({
                backend,
                workspaceId: "workspace",
                author: AUTHOR,
                tabsIds,
                createdByFilter: [AUTHOR],
            }),
        );

        act(() => {
            result.current.loadInitialItems();
        });

        await waitFor(() => expect(result.current.initialLoadCompleted).toBe(true));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.items).toEqual([]);
        expect(result.current.totalItemsCount).toBe(0);
        expect(calls).toEqual([{ page: 0, createdBy: [AUTHOR] }]);
    });

    it("switches a tabbed list to all authors when the user has none of their own", async () => {
        const { backend, calls } = createBackend();

        const { result } = renderHook(() =>
            useInsightPagedList({
                backend,
                workspaceId: "workspace",
                author: AUTHOR,
                tabsIds,
            }),
        );

        act(() => {
            result.current.loadInitialItems();
        });

        await waitFor(() => expect(result.current.items).toHaveLength(PAGE_SIZE));

        expect(result.current.selectedTabId).toBe(tabsIds.all);
        expect(result.current.totalItemsCount).toBe(TOTAL_INSIGHTS);
        expect(calls).toEqual([
            { page: 0, createdBy: [AUTHOR] },
            { page: 0, createdBy: undefined },
        ]);
    });
});

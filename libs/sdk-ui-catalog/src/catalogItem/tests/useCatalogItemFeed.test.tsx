// (C) 2026 GoodData Corporation

import { act, renderHook, waitFor } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import type { AsyncStatus } from "../../async/types.js";
import * as filterCtx from "../../filter/FilterContext.js";
import { ObjectTypes } from "../../objectType/constants.js";
import type { ObjectType } from "../../objectType/types.js";
import * as permissionCtx from "../../permission/PermissionsContext.js";
import * as searchCtx from "../../search/FullTextSearchContext.js";
import * as query from "../query.js";
import type { ICatalogItemFeedOptions, ICatalogItemQueryOptions } from "../types.js";
import { useCatalogItemFeed } from "../useCatalogItemFeed.js";

// vi.mock calls are hoisted by vitest before imports, so placement is purely stylistic.
vi.mock("../query.js", () => ({
    getDashboardsQuery: vi.fn(),
    getInsightsQuery: vi.fn(),
    getMetricsQuery: vi.fn(),
    getParametersQuery: vi.fn(),
    getAttributesQuery: vi.fn(),
    getFactsQuery: vi.fn(),
    getDateDatasetsQuery: vi.fn(),
}));

vi.mock("../converter.js", () => ({
    convertEntityToCatalogItem: vi.fn((entity: unknown) => entity),
}));

vi.mock("../../filter/FilterContext.js", () => ({
    useFilterState: vi.fn(),
    useQualityFilter: vi.fn(),
}));

vi.mock("../../search/FullTextSearchContext.js", () => ({
    useFullTextSearchState: vi.fn(),
}));

vi.mock("../../permission/PermissionsContext.js", () => ({
    useFeatureFlags: vi.fn(),
}));

type TestItem = {
    identifier: string;
    type: ObjectType;
    title: string;
};

type TestPage = {
    items: TestItem[];
    offset: number;
    limit: number;
    totalCount: number;
    next: Mock;
};

function makeItem(identifier: string, type: ObjectType): TestItem {
    return { identifier, type, title: identifier };
}

// Build a linked chain of pages where each page.next() returns the next in-chain page.
function chainPages(pages: Array<{ items: TestItem[]; offset: number; totalCount: number }>): TestPage {
    const asResult = (index: number): TestPage => {
        const pageSpec = pages[index];
        if (!pageSpec) {
            throw new Error("next() called beyond the configured page chain");
        }
        return {
            items: pageSpec.items,
            offset: pageSpec.offset,
            limit: pageSpec.items.length,
            totalCount: pageSpec.totalCount,
            next: vi.fn(async () => asResult(index + 1)),
        };
    };
    return asResult(0);
}

function emptyPage(): TestPage {
    return chainPages([{ items: [], offset: 0, totalCount: 0 }]);
}

type FilterState = ReturnType<typeof filterCtx.useFilterState>;

let filterState: FilterState;
let qualityFilter: ReturnType<typeof filterCtx.useQualityFilter>;
let searchState: { searchTerm: string };
let flags: ReturnType<typeof permissionCtx.useFeatureFlags>;
let pageProviders: Partial<Record<ObjectType, () => TestPage>>;

function defaultFilterState(): FilterState {
    return {
        types: [],
        origin: "ALL",
        createdBy: { values: [], isInverted: true },
        tags: { values: [], isInverted: true },
        qualityCodes: { values: [], isInverted: true },
        isHidden: undefined,
        certification: undefined,
        isModified: false,
    };
}

function setPageProvider(type: ObjectType, provider: () => TestPage) {
    pageProviders[type] = provider;
}

const backend = {} as IAnalyticalBackend;

const defaultOptions: ICatalogItemFeedOptions = {
    backend,
    workspace: "ws",
    pageSize: 10,
};

function renderFeed(options: Partial<ICatalogItemFeedOptions> = {}) {
    return renderHook((props: ICatalogItemFeedOptions) => useCatalogItemFeed(props), {
        initialProps: { ...defaultOptions, ...options } as ICatalogItemFeedOptions,
    });
}

async function waitForStatus(result: { current: { status: AsyncStatus } }, expected: AsyncStatus) {
    await waitFor(() => {
        expect(result.current.status).toBe(expected);
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    filterState = defaultFilterState();
    qualityFilter = undefined;
    searchState = { searchTerm: "" };
    flags = { enableParameters: false };
    pageProviders = {};

    vi.mocked(filterCtx.useFilterState).mockImplementation(() => filterState);
    vi.mocked(filterCtx.useQualityFilter).mockImplementation(() => qualityFilter);
    vi.mocked(searchCtx.useFullTextSearchState).mockImplementation(() => searchState);
    vi.mocked(permissionCtx.useFeatureFlags).mockImplementation(() => flags);

    const mountProvider = (type: ObjectType) => ({
        query: () => Promise.resolve(pageProviders[type]?.() ?? emptyPage()),
    });

    const queryMocks: Array<[keyof typeof query, ObjectType]> = [
        ["getDashboardsQuery", ObjectTypes.DASHBOARD],
        ["getInsightsQuery", ObjectTypes.VISUALIZATION],
        ["getMetricsQuery", ObjectTypes.METRIC],
        ["getParametersQuery", ObjectTypes.PARAMETER],
        ["getAttributesQuery", ObjectTypes.ATTRIBUTE],
        ["getFactsQuery", ObjectTypes.FACT],
        ["getDateDatasetsQuery", ObjectTypes.DATASET],
    ];
    for (const [fnName, type] of queryMocks) {
        vi.mocked(query[fnName]).mockImplementation((() => mountProvider(type)) as never);
    }
});

describe("useCatalogItemFeed – endpoint selection", () => {
    it("with empty types and parameters gate off, selects all endpoints except parameters", async () => {
        const { result } = renderFeed();
        await waitForStatus(result, "success");

        expect(vi.mocked(query.getDashboardsQuery)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(query.getInsightsQuery)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(query.getMetricsQuery)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(query.getAttributesQuery)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(query.getFactsQuery)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(query.getDateDatasetsQuery)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(query.getParametersQuery)).not.toHaveBeenCalled();
    });

    it("with a types subset, only selected endpoints are called", async () => {
        filterState = { ...filterState, types: [ObjectTypes.DASHBOARD, ObjectTypes.METRIC] };

        const { result } = renderFeed();
        await waitForStatus(result, "success");

        expect(vi.mocked(query.getDashboardsQuery)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(query.getMetricsQuery)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(query.getInsightsQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getAttributesQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getFactsQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getDateDatasetsQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getParametersQuery)).not.toHaveBeenCalled();
    });

    it("short-circuits to no endpoints when options.id is an empty array", async () => {
        const { result } = renderFeed({ id: [] });
        await waitForStatus(result, "success");

        expect(vi.mocked(query.getDashboardsQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getInsightsQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getMetricsQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getAttributesQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getFactsQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getDateDatasetsQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getParametersQuery)).not.toHaveBeenCalled();

        expect(result.current.items).toEqual([]);
        expect(result.current.totalCount).toBe(0);
        expect(result.current.hasNext).toBe(false);
    });

    it("includes parameters endpoint when the parameters gate is enabled", async () => {
        flags = { enableParameters: true };

        const { result } = renderFeed();
        await waitForStatus(result, "success");

        expect(vi.mocked(query.getParametersQuery)).toHaveBeenCalledTimes(1);
    });

    it("skips parameters endpoint when types includes PARAMETER but gate is off", async () => {
        filterState = {
            ...filterState,
            types: [ObjectTypes.PARAMETER],
        };

        const { result } = renderFeed();
        await waitForStatus(result, "success");

        expect(vi.mocked(query.getParametersQuery)).not.toHaveBeenCalled();
    });

    it("suppresses attribute/fact/dataset endpoints when createdBy values are set (not inverted)", async () => {
        filterState = {
            ...filterState,
            createdBy: { values: ["user-1"], isInverted: false },
        };

        const { result } = renderFeed();
        await waitForStatus(result, "success");

        expect(vi.mocked(query.getDashboardsQuery)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(query.getInsightsQuery)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(query.getMetricsQuery)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(query.getAttributesQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getFactsQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getDateDatasetsQuery)).not.toHaveBeenCalled();

        const opts = vi.mocked(query.getDashboardsQuery).mock.calls[0][0] as ICatalogItemQueryOptions;
        expect(opts.createdBy).toEqual(["user-1"]);
        expect(opts.excludeCreatedBy).toBeUndefined();
    });

    it("suppresses attribute/fact/dataset endpoints when createdBy values are set (inverted)", async () => {
        filterState = {
            ...filterState,
            createdBy: { values: ["user-1"], isInverted: true },
        };

        const { result } = renderFeed();
        await waitForStatus(result, "success");

        expect(vi.mocked(query.getAttributesQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getFactsQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getDateDatasetsQuery)).not.toHaveBeenCalled();

        const opts = vi.mocked(query.getDashboardsQuery).mock.calls[0][0] as ICatalogItemQueryOptions;
        expect(opts.createdBy).toBeUndefined();
        expect(opts.excludeCreatedBy).toEqual(["user-1"]);
    });

    it("suppresses attribute/fact/dataset endpoints when certification filter is on", async () => {
        filterState = { ...filterState, certification: true };

        const { result } = renderFeed();
        await waitForStatus(result, "success");

        expect(vi.mocked(query.getAttributesQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getFactsQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getDateDatasetsQuery)).not.toHaveBeenCalled();
        expect(vi.mocked(query.getDashboardsQuery)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(query.getInsightsQuery)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(query.getMetricsQuery)).toHaveBeenCalledTimes(1);
    });
});

describe("useCatalogItemFeed – quality filter branches", () => {
    it("non-inverted quality filter merges ids into queryOptions.id together with options.id", async () => {
        qualityFilter = { values: ["q1", "q2"], isInverted: false };

        const { result } = renderFeed({ id: ["a"] });
        await waitForStatus(result, "success");

        const opts = vi.mocked(query.getDashboardsQuery).mock.calls[0][0] as ICatalogItemQueryOptions;
        expect(opts.id).toEqual(expect.arrayContaining(["q1", "q2", "a"]));
        expect(opts.id).toHaveLength(3);
        expect(opts.excludeId).toBeUndefined();
    });

    it("inverted quality filter populates excludeId and leaves includeId as options.id", async () => {
        qualityFilter = { values: ["q1"], isInverted: true };

        const { result } = renderFeed({ id: ["a"] });
        await waitForStatus(result, "success");

        const opts = vi.mocked(query.getDashboardsQuery).mock.calls[0][0] as ICatalogItemQueryOptions;
        expect(opts.id).toEqual(["a"]);
        expect(opts.excludeId).toEqual(["q1"]);
    });
});

describe("useCatalogItemFeed – first-load sequencing", () => {
    it("ends in success with populated items and totalCount derived from endpoint totals", async () => {
        filterState = { ...filterState, types: [ObjectTypes.DASHBOARD, ObjectTypes.METRIC] };
        setPageProvider(ObjectTypes.DASHBOARD, () =>
            chainPages([{ items: [makeItem("d1", ObjectTypes.DASHBOARD)], offset: 0, totalCount: 1 }]),
        );
        setPageProvider(ObjectTypes.METRIC, () =>
            chainPages([
                {
                    items: [makeItem("m1", ObjectTypes.METRIC), makeItem("m2", ObjectTypes.METRIC)],
                    offset: 0,
                    totalCount: 3,
                },
            ]),
        );

        const { result } = renderFeed();
        await waitForStatus(result, "success");

        expect(result.current.items.map((i) => i.identifier)).toEqual(["d1", "m1", "m2"]);
        expect(result.current.totalCount).toBe(4);
        expect(result.current.totalCountByType[ObjectTypes.DASHBOARD]).toBe(1);
        expect(result.current.totalCountByType[ObjectTypes.METRIC]).toBe(3);
        expect(result.current.hasNext).toBe(true);
    });

    it("currentEndpoint lands on the first endpoint that still has more pages", async () => {
        filterState = {
            ...filterState,
            types: [ObjectTypes.DASHBOARD, ObjectTypes.METRIC, ObjectTypes.FACT],
        };
        setPageProvider(ObjectTypes.DASHBOARD, () =>
            chainPages([
                {
                    items: [makeItem("d1", ObjectTypes.DASHBOARD), makeItem("d2", ObjectTypes.DASHBOARD)],
                    offset: 0,
                    totalCount: 2,
                },
            ]),
        );
        setPageProvider(ObjectTypes.METRIC, () =>
            chainPages([{ items: [makeItem("m1", ObjectTypes.METRIC)], offset: 0, totalCount: 3 }]),
        );
        // Third endpoint is also partial; items must NOT include f1 because currentEndpoint
        // should stop at the first unfinished endpoint (metrics), not advance past it.
        setPageProvider(ObjectTypes.FACT, () =>
            chainPages([{ items: [makeItem("f1", ObjectTypes.FACT)], offset: 0, totalCount: 5 }]),
        );

        const { result } = renderFeed();
        await waitForStatus(result, "success");

        expect(result.current.items.map((i) => i.identifier)).toEqual(["d1", "d2", "m1"]);
        expect(result.current.hasNext).toBe(true);
    });

    it("renders status=error and empty items when an endpoint query rejects", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        filterState = { ...filterState, types: [ObjectTypes.DASHBOARD] };
        vi.mocked(query.getDashboardsQuery).mockImplementation((() => ({
            query: () => Promise.reject(new Error("boom")),
        })) as never);

        const { result } = renderFeed();
        await waitForStatus(result, "error");

        expect(result.current.items).toEqual([]);
        expect(result.current.error?.message).toBe("boom");
        consoleSpy.mockRestore();
    });
});

describe("useCatalogItemFeed – next() pagination", () => {
    it("loads the next page within a single endpoint and appends items in order", async () => {
        filterState = { ...filterState, types: [ObjectTypes.METRIC] };
        setPageProvider(ObjectTypes.METRIC, () =>
            chainPages([
                {
                    items: [makeItem("m1", ObjectTypes.METRIC), makeItem("m2", ObjectTypes.METRIC)],
                    offset: 0,
                    totalCount: 4,
                },
                {
                    items: [makeItem("m3", ObjectTypes.METRIC), makeItem("m4", ObjectTypes.METRIC)],
                    offset: 2,
                    totalCount: 4,
                },
            ]),
        );

        const { result } = renderFeed();
        await waitForStatus(result, "success");
        expect(result.current.items.map((i) => i.identifier)).toEqual(["m1", "m2"]);

        await act(async () => {
            await result.current.next();
        });

        expect(result.current.items.map((i) => i.identifier)).toEqual(["m1", "m2", "m3", "m4"]);
        expect(result.current.hasNext).toBe(false);
    });

    it("advances across endpoint boundaries when the current endpoint is exhausted", async () => {
        filterState = {
            ...filterState,
            types: [ObjectTypes.DASHBOARD, ObjectTypes.METRIC, ObjectTypes.FACT],
        };
        setPageProvider(ObjectTypes.DASHBOARD, () =>
            chainPages([
                {
                    items: [makeItem("d1", ObjectTypes.DASHBOARD), makeItem("d2", ObjectTypes.DASHBOARD)],
                    offset: 0,
                    totalCount: 2,
                },
            ]),
        );
        setPageProvider(ObjectTypes.METRIC, () =>
            chainPages([
                { items: [makeItem("m1", ObjectTypes.METRIC)], offset: 0, totalCount: 2 },
                { items: [makeItem("m2", ObjectTypes.METRIC)], offset: 1, totalCount: 2 },
            ]),
        );
        setPageProvider(ObjectTypes.FACT, () =>
            chainPages([
                { items: [makeItem("f1", ObjectTypes.FACT)], offset: 0, totalCount: 3 },
                {
                    items: [makeItem("f2", ObjectTypes.FACT), makeItem("f3", ObjectTypes.FACT)],
                    offset: 1,
                    totalCount: 3,
                },
            ]),
        );

        const { result } = renderFeed();
        await waitForStatus(result, "success");
        // First-load: dashboards complete, first page of metrics loaded, first page of facts NOT yet.
        expect(result.current.items.map((i) => i.identifier)).toEqual(["d1", "d2", "m1"]);

        // First next() finishes metrics.
        await act(async () => {
            await result.current.next();
        });
        expect(result.current.items.map((i) => i.identifier)).toEqual(["d1", "d2", "m1", "m2"]);

        // Second next() crosses into facts and finishes it.
        await act(async () => {
            await result.current.next();
        });
        expect(result.current.items.map((i) => i.identifier)).toEqual([
            "d1",
            "d2",
            "m1",
            "m2",
            "f1",
            "f2",
            "f3",
        ]);
        expect(result.current.hasNext).toBe(false);
    });
});

describe("useCatalogItemFeed – reset on filter change", () => {
    it("clears items and resets status to loading before the next first-load resolves", async () => {
        filterState = { ...filterState, types: [ObjectTypes.DASHBOARD] };
        setPageProvider(ObjectTypes.DASHBOARD, () =>
            chainPages([{ items: [makeItem("d1", ObjectTypes.DASHBOARD)], offset: 0, totalCount: 1 }]),
        );

        const { result, rerender } = renderFeed();
        await waitForStatus(result, "success");
        expect(result.current.items).toHaveLength(1);

        // Swap filters to METRIC only; the reset layout-effect should clear items synchronously.
        filterState = { ...filterState, types: [ObjectTypes.METRIC] };
        setPageProvider(ObjectTypes.METRIC, () =>
            chainPages([{ items: [makeItem("m1", ObjectTypes.METRIC)], offset: 0, totalCount: 1 }]),
        );

        act(() => {
            rerender({ ...defaultOptions });
        });

        expect(result.current.status).toBe("loading");
        expect(result.current.items).toEqual([]);

        await waitForStatus(result, "success");
        expect(result.current.items.map((i) => i.identifier)).toEqual(["m1"]);
    });
});

describe("useCatalogItemFeed – refetchObjectType", () => {
    it("preserves depth: refetch reloads at least as many items as were previously loaded", async () => {
        filterState = { ...filterState, types: [ObjectTypes.METRIC] };
        setPageProvider(ObjectTypes.METRIC, () =>
            chainPages([
                {
                    items: [makeItem("m1", ObjectTypes.METRIC), makeItem("m2", ObjectTypes.METRIC)],
                    offset: 0,
                    totalCount: 4,
                },
                {
                    items: [makeItem("m3", ObjectTypes.METRIC), makeItem("m4", ObjectTypes.METRIC)],
                    offset: 2,
                    totalCount: 4,
                },
            ]),
        );

        const { result } = renderFeed();
        await waitForStatus(result, "success");

        // Load a second page so we've visited depth=4 items on the metrics endpoint.
        await act(async () => {
            await result.current.next();
        });
        expect(result.current.items).toHaveLength(4);

        // Swap the page source to fresh data and call refetchObjectType.
        setPageProvider(ObjectTypes.METRIC, () =>
            chainPages([
                {
                    items: [makeItem("mA", ObjectTypes.METRIC), makeItem("mB", ObjectTypes.METRIC)],
                    offset: 0,
                    totalCount: 4,
                },
                {
                    items: [makeItem("mC", ObjectTypes.METRIC), makeItem("mD", ObjectTypes.METRIC)],
                    offset: 2,
                    totalCount: 4,
                },
            ]),
        );

        await act(async () => {
            await result.current.refetchObjectType(ObjectTypes.METRIC);
        });

        expect(result.current.items.map((i) => i.identifier)).toEqual(["mA", "mB", "mC", "mD"]);
        expect(result.current.totalCountByType[ObjectTypes.METRIC]).toBe(4);
    });

    it("is a no-op for a type not present in the current endpoint set", async () => {
        filterState = { ...filterState, types: [ObjectTypes.METRIC] };
        setPageProvider(ObjectTypes.METRIC, () =>
            chainPages([{ items: [makeItem("m1", ObjectTypes.METRIC)], offset: 0, totalCount: 1 }]),
        );

        const { result } = renderFeed();
        await waitForStatus(result, "success");

        await act(async () => {
            await result.current.refetchObjectType(ObjectTypes.DASHBOARD);
        });

        expect(result.current.items.map((i) => i.identifier)).toEqual(["m1"]);
        expect(vi.mocked(query.getDashboardsQuery)).not.toHaveBeenCalled();
    });
});

describe("useCatalogItemFeed – updateItem / removeItem", () => {
    it("updateItem replaces the matching item in the visible list", async () => {
        filterState = { ...filterState, types: [ObjectTypes.METRIC] };
        setPageProvider(ObjectTypes.METRIC, () =>
            chainPages([
                {
                    items: [makeItem("m1", ObjectTypes.METRIC), makeItem("m2", ObjectTypes.METRIC)],
                    offset: 0,
                    totalCount: 2,
                },
            ]),
        );

        const { result } = renderFeed();
        await waitForStatus(result, "success");

        act(() => {
            result.current.updateItem({
                identifier: "m1",
                type: ObjectTypes.METRIC,
                title: "renamed",
                description: "",
                tags: [],
                createdBy: "",
                updatedBy: "",
                createdAt: null,
                updatedAt: null,
                isLocked: false,
                isEditable: true,
            });
        });

        const updated = result.current.items.find((i) => i.identifier === "m1");
        expect(updated?.title).toBe("renamed");
    });

    it("removeItem removes the item and decrements the matching totalCount entry", async () => {
        filterState = { ...filterState, types: [ObjectTypes.METRIC] };
        setPageProvider(ObjectTypes.METRIC, () =>
            chainPages([
                {
                    items: [makeItem("m1", ObjectTypes.METRIC), makeItem("m2", ObjectTypes.METRIC)],
                    offset: 0,
                    totalCount: 2,
                },
            ]),
        );

        const { result } = renderFeed();
        await waitForStatus(result, "success");
        expect(result.current.totalCountByType[ObjectTypes.METRIC]).toBe(2);

        act(() => {
            result.current.removeItem({ identifier: "m1", type: ObjectTypes.METRIC });
        });

        expect(result.current.items.map((i) => i.identifier)).toEqual(["m2"]);
        expect(result.current.totalCountByType[ObjectTypes.METRIC]).toBe(1);
        expect(result.current.totalCount).toBe(1);
    });
});

// (C) 2026 GoodData Corporation

import { type PropsWithChildren, useMemo } from "react";

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    type ISemanticQualityIssue,
    type SemanticQualityIssueCode,
    SemanticQualityIssueCodeValues,
} from "@gooddata/sdk-model";
import { createTightWaitFor } from "@gooddata/util";

import type { AsyncStatus } from "../async/types.js";
import type { IFilterState } from "../filter/FilterContext.js";
import { TestFilterProvider } from "../filter/TestFilterProvider.js";
import { ObjectTypes } from "../objectType/constants.js";
import type { ObjectType } from "../objectType/types.js";
import { TestPermissionsProvider, defaultPermissionsResult } from "../permission/TestPermissionsProvider.js";
import { TestQualityProvider } from "../quality/TestQualityProvider.js";

import {
    type ICatalogBackendStub,
    type IStubPage,
    catalogEntity,
    chainPages,
    createCatalogBackendStub,
} from "./catalogBackend.test.utils.js";
import type { ICatalogItemFeedOptions } from "./types.js";
import { useCatalogItemFeed } from "./useCatalogItemFeed.js";

/**
 * The feed reaches the backend through `catalogItem/query.js` and reads its inputs from the filter,
 * search, permissions and quality contexts. Both are injected here — a stub backend and the test
 * providers — rather than replaced with `vi.mock`: those modules are loaded unmocked by the
 * component tests, and a module mock cannot be applied to a module graph they already evaluated,
 * which is what a non-isolated run does.
 *
 * The search context is left at its default (`searchTerm: ""`), which is all these cases need.
 */

interface IFeedContext {
    flags: Record<string, boolean>;
    filter: Partial<IFilterState>;
    issues: ISemanticQualityIssue[] | undefined;
}

interface IFeedSetup {
    flags?: Record<string, boolean>;
    filter?: Partial<IFilterState>;
    issues?: ISemanticQualityIssue[];
    options?: Partial<ICatalogItemFeedOptions>;
    /** Runs before the first render, so the first-load effect sees the configured pages. */
    prepare?: (stub: ICatalogBackendStub) => void;
}

interface IItemPageSpec {
    items: string[];
    offset: number;
    totalCount: number;
}

/** A page source for `type`, rebuilt per query so every call walks a fresh chain. */
function pagesOf(type: ObjectType, specs: IItemPageSpec[]): () => Promise<IStubPage> {
    return () =>
        Promise.resolve(
            chainPages(
                specs.map(({ items, offset, totalCount }) => ({
                    items: items.map((id) => catalogEntity(type, id)),
                    offset,
                    totalCount,
                })),
            ),
        );
}

function qualityIssue(code: SemanticQualityIssueCode, identifiers: string[]): ISemanticQualityIssue {
    return {
        code,
        severity: "INFO",
        objects: identifiers.map((identifier) => ({ identifier })),
    } as unknown as ISemanticQualityIssue;
}

/** The filter payload the given type's endpoint sent to the backend on its first query. */
function sentFilter(stub: ICatalogBackendStub, type: ObjectType) {
    return stub.builders[type].withFilter.mock.calls[0][0] as {
        id?: string[];
        excludeId?: string[];
        createdBy?: string[];
        excludeCreatedBy?: string[];
    };
}

function renderFeed(setup: IFeedSetup = {}) {
    const stub = createCatalogBackendStub();
    setup.prepare?.(stub);

    const holder: { current: IFeedContext } = {
        current: {
            flags: setup.flags ?? { enableParameters: false },
            filter: setup.filter ?? {},
            issues: setup.issues,
        },
    };

    function Wrapper({ children }: PropsWithChildren) {
        const { flags, filter, issues } = holder.current;
        // Re-derived only when the test swaps `holder.current`; a fresh value per render would
        // re-derive the endpoints and re-query forever.
        const permissions = useMemo(
            () => ({
                ...defaultPermissionsResult,
                settings: flags as unknown as IUserWorkspaceSettings,
            }),
            [flags],
        );

        return (
            <TestPermissionsProvider result={permissions}>
                <TestQualityProvider issues={issues}>
                    <TestFilterProvider state={filter}>{children}</TestFilterProvider>
                </TestQualityProvider>
            </TestPermissionsProvider>
        );
    }

    const initialProps: ICatalogItemFeedOptions = {
        backend: stub.backend,
        workspace: "ws",
        pageSize: 10,
        ...setup.options,
    };

    const view = renderHook((props: ICatalogItemFeedOptions) => useCatalogItemFeed(props), {
        initialProps,
        wrapper: Wrapper,
    });

    /** Swaps the mounted filters/flags and re-renders, the way a filter change in the UI would. */
    function setContext(next: Partial<IFeedContext>) {
        holder.current = { ...holder.current, ...next };
        act(() => {
            view.rerender({ ...initialProps });
        });
    }

    return { ...view, stub, setContext };
}

/**
 * `renderHook` mounts a component that renders nothing, so `waitFor`'s MutationObserver never
 * fires and it falls back to polling. At the default interval every wait costs a full tick even
 * though the stub backend settles within a few microtasks — hence the tight poll.
 */
const settle = createTightWaitFor(waitFor);

async function waitForStatus(result: { current: { status: AsyncStatus } }, expected: AsyncStatus) {
    await settle(() => {
        expect(result.current.status).toBe(expected);
    });
}

describe("useCatalogItemFeed – metric permissions", () => {
    it("asks the metrics endpoint for object-level permissions behind the flag", async () => {
        const { result, stub } = renderFeed({
            flags: { enableParameters: false, enableMetricPermissions: true },
        });
        await waitForStatus(result, "success");

        // the detail panel reuses the listed item, so its permissions have to arrive with the list
        expect(stub.builders[ObjectTypes.METRIC].withMetaInclude).toHaveBeenCalledWith(["permissions"]);
    });

    it("does not ask for them with the flag off, leaving the query as it was before", async () => {
        const { result, stub } = renderFeed();
        await waitForStatus(result, "success");

        expect(stub.builders[ObjectTypes.METRIC].withMetaInclude).not.toHaveBeenCalled();
    });
});

describe("useCatalogItemFeed – endpoint selection", () => {
    it("with empty types and parameters gate off, selects all endpoints except parameters", async () => {
        const { result, stub } = renderFeed();
        await waitForStatus(result, "success");

        expect(stub.queries[ObjectTypes.DASHBOARD]).toHaveBeenCalledTimes(1);
        expect(stub.queries[ObjectTypes.VISUALIZATION]).toHaveBeenCalledTimes(1);
        expect(stub.queries[ObjectTypes.METRIC]).toHaveBeenCalledTimes(1);
        expect(stub.queries[ObjectTypes.ATTRIBUTE]).toHaveBeenCalledTimes(1);
        expect(stub.queries[ObjectTypes.FACT]).toHaveBeenCalledTimes(1);
        expect(stub.queries[ObjectTypes.DATASET]).toHaveBeenCalledTimes(1);
        expect(stub.queries[ObjectTypes.PARAMETER]).not.toHaveBeenCalled();
    });

    it("with a types subset, only selected endpoints are called", async () => {
        const { result, stub } = renderFeed({
            filter: { types: [ObjectTypes.DASHBOARD, ObjectTypes.METRIC] },
        });
        await waitForStatus(result, "success");

        expect(stub.queries[ObjectTypes.DASHBOARD]).toHaveBeenCalledTimes(1);
        expect(stub.queries[ObjectTypes.METRIC]).toHaveBeenCalledTimes(1);
        expect(stub.queries[ObjectTypes.VISUALIZATION]).not.toHaveBeenCalled();
        expect(stub.queries[ObjectTypes.ATTRIBUTE]).not.toHaveBeenCalled();
        expect(stub.queries[ObjectTypes.FACT]).not.toHaveBeenCalled();
        expect(stub.queries[ObjectTypes.DATASET]).not.toHaveBeenCalled();
        expect(stub.queries[ObjectTypes.PARAMETER]).not.toHaveBeenCalled();
    });

    it("short-circuits to no endpoints when options.id is an empty array", async () => {
        const { result, stub } = renderFeed({ options: { id: [] } });
        await waitForStatus(result, "success");

        for (const type of Object.values(ObjectTypes)) {
            expect(stub.queries[type]).not.toHaveBeenCalled();
        }

        expect(result.current.items).toEqual([]);
        expect(result.current.totalCount).toBe(0);
        expect(result.current.hasNext).toBe(false);
    });

    it("includes parameters endpoint when the parameters gate is enabled", async () => {
        const { result, stub } = renderFeed({ flags: { enableParameters: true } });
        await waitForStatus(result, "success");

        expect(stub.queries[ObjectTypes.PARAMETER]).toHaveBeenCalledTimes(1);
    });

    it("skips parameters endpoint when types includes PARAMETER but gate is off", async () => {
        const { result, stub } = renderFeed({ filter: { types: [ObjectTypes.PARAMETER] } });
        await waitForStatus(result, "success");

        expect(stub.queries[ObjectTypes.PARAMETER]).not.toHaveBeenCalled();
    });

    it("suppresses attribute/fact/dataset endpoints when createdBy values are set (not inverted)", async () => {
        const { result, stub } = renderFeed({
            filter: { createdBy: { values: ["user-1"], isInverted: false } },
        });
        await waitForStatus(result, "success");

        expect(stub.queries[ObjectTypes.DASHBOARD]).toHaveBeenCalledTimes(1);
        expect(stub.queries[ObjectTypes.VISUALIZATION]).toHaveBeenCalledTimes(1);
        expect(stub.queries[ObjectTypes.METRIC]).toHaveBeenCalledTimes(1);
        expect(stub.queries[ObjectTypes.ATTRIBUTE]).not.toHaveBeenCalled();
        expect(stub.queries[ObjectTypes.FACT]).not.toHaveBeenCalled();
        expect(stub.queries[ObjectTypes.DATASET]).not.toHaveBeenCalled();

        const filter = sentFilter(stub, ObjectTypes.DASHBOARD);
        expect(filter.createdBy).toEqual(["user-1"]);
        expect(filter.excludeCreatedBy).toBeUndefined();
    });

    it("suppresses attribute/fact/dataset endpoints when createdBy values are set (inverted)", async () => {
        const { result, stub } = renderFeed({
            filter: { createdBy: { values: ["user-1"], isInverted: true } },
        });
        await waitForStatus(result, "success");

        expect(stub.queries[ObjectTypes.ATTRIBUTE]).not.toHaveBeenCalled();
        expect(stub.queries[ObjectTypes.FACT]).not.toHaveBeenCalled();
        expect(stub.queries[ObjectTypes.DATASET]).not.toHaveBeenCalled();

        const filter = sentFilter(stub, ObjectTypes.DASHBOARD);
        expect(filter.createdBy).toBeUndefined();
        expect(filter.excludeCreatedBy).toEqual(["user-1"]);
    });

    it("suppresses attribute/fact/dataset endpoints when certification filter is on", async () => {
        const { result, stub } = renderFeed({ filter: { certification: true } });
        await waitForStatus(result, "success");

        expect(stub.queries[ObjectTypes.ATTRIBUTE]).not.toHaveBeenCalled();
        expect(stub.queries[ObjectTypes.FACT]).not.toHaveBeenCalled();
        expect(stub.queries[ObjectTypes.DATASET]).not.toHaveBeenCalled();
        expect(stub.queries[ObjectTypes.DASHBOARD]).toHaveBeenCalledTimes(1);
        expect(stub.queries[ObjectTypes.VISUALIZATION]).toHaveBeenCalledTimes(1);
        expect(stub.queries[ObjectTypes.METRIC]).toHaveBeenCalledTimes(1);
    });
});

describe("useCatalogItemFeed – quality filter branches", () => {
    it("non-inverted quality filter merges ids into queryOptions.id together with options.id", async () => {
        const { result, stub } = renderFeed({
            filter: {
                qualityCodes: { values: [SemanticQualityIssueCodeValues.SIMILAR_TITLE], isInverted: false },
            },
            issues: [qualityIssue(SemanticQualityIssueCodeValues.SIMILAR_TITLE, ["q1", "q2"])],
            options: { id: ["a"] },
        });
        await waitForStatus(result, "success");

        const filter = sentFilter(stub, ObjectTypes.DASHBOARD);
        expect(filter.id).toEqual(expect.arrayContaining(["q1", "q2", "a"]));
        expect(filter.id).toHaveLength(3);
        expect(filter.excludeId).toBeUndefined();
    });

    it("inverted quality filter populates excludeId and leaves includeId as options.id", async () => {
        const { result, stub } = renderFeed({
            filter: {
                qualityCodes: { values: [SemanticQualityIssueCodeValues.SIMILAR_TITLE], isInverted: true },
            },
            // Inverted means "objects whose issues are *not* of the selected code", so only the
            // identically-titled object's id is excluded.
            issues: [
                qualityIssue(SemanticQualityIssueCodeValues.SIMILAR_TITLE, ["kept"]),
                qualityIssue(SemanticQualityIssueCodeValues.IDENTICAL_TITLE, ["q1"]),
            ],
            options: { id: ["a"] },
        });
        await waitForStatus(result, "success");

        const filter = sentFilter(stub, ObjectTypes.DASHBOARD);
        expect(filter.id).toEqual(["a"]);
        expect(filter.excludeId).toEqual(["q1"]);
    });
});

describe("useCatalogItemFeed – first-load sequencing", () => {
    it("ends in success with populated items and totalCount derived from endpoint totals", async () => {
        const { result } = renderFeed({
            filter: { types: [ObjectTypes.DASHBOARD, ObjectTypes.METRIC] },
            prepare: (stub) => {
                stub.setPages(
                    ObjectTypes.DASHBOARD,
                    pagesOf(ObjectTypes.DASHBOARD, [{ items: ["d1"], offset: 0, totalCount: 1 }]),
                );
                stub.setPages(
                    ObjectTypes.METRIC,
                    pagesOf(ObjectTypes.METRIC, [{ items: ["m1", "m2"], offset: 0, totalCount: 3 }]),
                );
            },
        });
        await waitForStatus(result, "success");

        expect(result.current.items.map((i) => i.identifier)).toEqual(["d1", "m1", "m2"]);
        expect(result.current.totalCount).toBe(4);
        expect(result.current.totalCountByType[ObjectTypes.DASHBOARD]).toBe(1);
        expect(result.current.totalCountByType[ObjectTypes.METRIC]).toBe(3);
        expect(result.current.hasNext).toBe(true);
    });

    it("currentEndpoint lands on the first endpoint that still has more pages", async () => {
        const { result } = renderFeed({
            filter: { types: [ObjectTypes.DASHBOARD, ObjectTypes.METRIC, ObjectTypes.FACT] },
            prepare: (stub) => {
                stub.setPages(
                    ObjectTypes.DASHBOARD,
                    pagesOf(ObjectTypes.DASHBOARD, [{ items: ["d1", "d2"], offset: 0, totalCount: 2 }]),
                );
                stub.setPages(
                    ObjectTypes.METRIC,
                    pagesOf(ObjectTypes.METRIC, [{ items: ["m1"], offset: 0, totalCount: 3 }]),
                );
                // Third endpoint is also partial; items must NOT include f1 because currentEndpoint
                // should stop at the first unfinished endpoint (metrics), not advance past it.
                stub.setPages(
                    ObjectTypes.FACT,
                    pagesOf(ObjectTypes.FACT, [{ items: ["f1"], offset: 0, totalCount: 5 }]),
                );
            },
        });
        await waitForStatus(result, "success");

        expect(result.current.items.map((i) => i.identifier)).toEqual(["d1", "d2", "m1"]);
        expect(result.current.hasNext).toBe(true);
    });

    it("renders status=error and empty items when an endpoint query rejects", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const { result } = renderFeed({
            filter: { types: [ObjectTypes.DASHBOARD] },
            prepare: (stub) => stub.setPages(ObjectTypes.DASHBOARD, () => Promise.reject(new Error("boom"))),
        });
        await waitForStatus(result, "error");

        expect(result.current.items).toEqual([]);
        expect(result.current.error?.message).toBe("boom");
        consoleSpy.mockRestore();
    });
});

describe("useCatalogItemFeed – next() pagination", () => {
    it("loads the next page within a single endpoint and appends items in order", async () => {
        const { result } = renderFeed({
            filter: { types: [ObjectTypes.METRIC] },
            prepare: (stub) =>
                stub.setPages(
                    ObjectTypes.METRIC,
                    pagesOf(ObjectTypes.METRIC, [
                        { items: ["m1", "m2"], offset: 0, totalCount: 4 },
                        { items: ["m3", "m4"], offset: 2, totalCount: 4 },
                    ]),
                ),
        });
        await waitForStatus(result, "success");
        expect(result.current.items.map((i) => i.identifier)).toEqual(["m1", "m2"]);

        await act(async () => {
            await result.current.next();
        });

        expect(result.current.items.map((i) => i.identifier)).toEqual(["m1", "m2", "m3", "m4"]);
        expect(result.current.hasNext).toBe(false);
    });

    it("advances across endpoint boundaries when the current endpoint is exhausted", async () => {
        const { result } = renderFeed({
            filter: { types: [ObjectTypes.DASHBOARD, ObjectTypes.METRIC, ObjectTypes.FACT] },
            prepare: (stub) => {
                stub.setPages(
                    ObjectTypes.DASHBOARD,
                    pagesOf(ObjectTypes.DASHBOARD, [{ items: ["d1", "d2"], offset: 0, totalCount: 2 }]),
                );
                stub.setPages(
                    ObjectTypes.METRIC,
                    pagesOf(ObjectTypes.METRIC, [
                        { items: ["m1"], offset: 0, totalCount: 2 },
                        { items: ["m2"], offset: 1, totalCount: 2 },
                    ]),
                );
                stub.setPages(
                    ObjectTypes.FACT,
                    pagesOf(ObjectTypes.FACT, [
                        { items: ["f1"], offset: 0, totalCount: 3 },
                        { items: ["f2", "f3"], offset: 1, totalCount: 3 },
                    ]),
                );
            },
        });
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
        const { result, stub, setContext } = renderFeed({
            filter: { types: [ObjectTypes.DASHBOARD] },
            prepare: (s) =>
                s.setPages(
                    ObjectTypes.DASHBOARD,
                    pagesOf(ObjectTypes.DASHBOARD, [{ items: ["d1"], offset: 0, totalCount: 1 }]),
                ),
        });
        await waitForStatus(result, "success");
        expect(result.current.items).toHaveLength(1);

        // Swap filters to METRIC only; the reset layout-effect should clear items synchronously.
        stub.setPages(
            ObjectTypes.METRIC,
            pagesOf(ObjectTypes.METRIC, [{ items: ["m1"], offset: 0, totalCount: 1 }]),
        );
        setContext({ filter: { types: [ObjectTypes.METRIC] } });

        expect(result.current.status).toBe("loading");
        expect(result.current.items).toEqual([]);

        await waitForStatus(result, "success");
        expect(result.current.items.map((i) => i.identifier)).toEqual(["m1"]);
    });
});

describe("useCatalogItemFeed – refetchObjectType", () => {
    it("preserves depth: refetch reloads at least as many items as were previously loaded", async () => {
        const { result, stub } = renderFeed({
            filter: { types: [ObjectTypes.METRIC] },
            prepare: (s) =>
                s.setPages(
                    ObjectTypes.METRIC,
                    pagesOf(ObjectTypes.METRIC, [
                        { items: ["m1", "m2"], offset: 0, totalCount: 4 },
                        { items: ["m3", "m4"], offset: 2, totalCount: 4 },
                    ]),
                ),
        });
        await waitForStatus(result, "success");

        // Load a second page so we've visited depth=4 items on the metrics endpoint.
        await act(async () => {
            await result.current.next();
        });
        expect(result.current.items).toHaveLength(4);

        // Swap the page source to fresh data and call refetchObjectType.
        stub.setPages(
            ObjectTypes.METRIC,
            pagesOf(ObjectTypes.METRIC, [
                { items: ["mA", "mB"], offset: 0, totalCount: 4 },
                { items: ["mC", "mD"], offset: 2, totalCount: 4 },
            ]),
        );

        await act(async () => {
            await result.current.refetchObjectType(ObjectTypes.METRIC);
        });

        expect(result.current.items.map((i) => i.identifier)).toEqual(["mA", "mB", "mC", "mD"]);
        expect(result.current.totalCountByType[ObjectTypes.METRIC]).toBe(4);
    });

    it("is a no-op for a type not present in the current endpoint set", async () => {
        const { result, stub } = renderFeed({
            filter: { types: [ObjectTypes.METRIC] },
            prepare: (s) =>
                s.setPages(
                    ObjectTypes.METRIC,
                    pagesOf(ObjectTypes.METRIC, [{ items: ["m1"], offset: 0, totalCount: 1 }]),
                ),
        });
        await waitForStatus(result, "success");

        await act(async () => {
            await result.current.refetchObjectType(ObjectTypes.DASHBOARD);
        });

        expect(result.current.items.map((i) => i.identifier)).toEqual(["m1"]);
        expect(stub.queries[ObjectTypes.DASHBOARD]).not.toHaveBeenCalled();
    });
});

describe("useCatalogItemFeed – updateItem / removeItem", () => {
    it("updateItem replaces the matching item in the visible list", async () => {
        const { result } = renderFeed({
            filter: { types: [ObjectTypes.METRIC] },
            prepare: (s) =>
                s.setPages(
                    ObjectTypes.METRIC,
                    pagesOf(ObjectTypes.METRIC, [{ items: ["m1", "m2"], offset: 0, totalCount: 2 }]),
                ),
        });
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
        const { result } = renderFeed({
            filter: { types: [ObjectTypes.METRIC] },
            prepare: (s) =>
                s.setPages(
                    ObjectTypes.METRIC,
                    pagesOf(ObjectTypes.METRIC, [{ items: ["m1", "m2"], offset: 0, totalCount: 2 }]),
                ),
        });
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

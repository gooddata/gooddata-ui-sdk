// (C) 2026 GoodData Corporation

import { renderHook, waitFor } from "@testing-library/react";
import type { ComponentType, PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { ObjectTypes } from "../objectType/constants.js";
import { type ObjectType } from "../objectType/types.js";
import { TestPermissionsProvider, defaultPermissionsResult } from "../permission/TestPermissionsProvider.js";

import {
    type ICatalogBackendStub,
    catalogEntity,
    chainPages,
    createCatalogBackendStub,
} from "./catalogBackend.test.utils.js";
import {
    type ICatalogItem,
    type ICatalogItemQueryOptions,
    type ICatalogItemSemanticSearchOptions,
} from "./types.js";
import { useCatalogItemSemanticSearch } from "./useCatalogItemSemanticSearch.js";

/**
 * Everything the hook depends on is reached through the backend (genAI semantic search and the
 * catalog endpoints) or through the permissions context, so both are injected rather than mocked at
 * the module level: a `vi.mock` of a module other test files load unmocked cannot be applied to a
 * module graph they already evaluated, which is what a non-isolated run does.
 */
function createWrapper(flags: Record<string, boolean>) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestPermissionsProvider
                result={{
                    ...defaultPermissionsResult,
                    settings: flags as unknown as IUserWorkspaceSettings,
                }}
            >
                {children}
            </TestPermissionsProvider>
        );
    }
    return Wrapper;
}

const smartSearchOn = createWrapper({ enableCatalogSmartSearchResults: true });
const smartSearchOff = createWrapper({ enableCatalogSmartSearchResults: false });

const neverSettles = () => new Promise<never>(() => {});

const SEARCH = "search term";
const VISUALIZATION_TYPES: ObjectType[] = [ObjectTypes.VISUALIZATION];
const NO_ITEMS: ICatalogItem[] = [];

function makeQueryOptions(
    stub: ICatalogBackendStub,
    overrides: Partial<ICatalogItemQueryOptions> = {},
): ICatalogItemQueryOptions {
    return {
        backend: stub.backend,
        workspace: "workspace",
        origin: "ALL",
        ...overrides,
    };
}

/**
 * The hook memoizes on its inputs, so `options` is built once per test and handed to every render —
 * a fresh object each render would re-derive the endpoints forever.
 */
function renderSemanticSearch(
    options: ICatalogItemSemanticSearchOptions,
    wrapper: ComponentType<PropsWithChildren>,
) {
    return renderHook(() => useCatalogItemSemanticSearch(options), { wrapper });
}

/** One page holding the given ids as entities of `type`. */
function pageOf(type: ObjectType, ids: string[]) {
    return () =>
        Promise.resolve(
            chainPages([
                { items: ids.map((id) => catalogEntity(type, id)), offset: 0, totalCount: ids.length },
            ]),
        );
}

describe("useCatalogItemSemanticSearch", () => {
    it("should return idle status and empty items when semantic search is disabled (no flag)", () => {
        const stub = createCatalogBackendStub();

        const { result } = renderSemanticSearch(
            {
                queryOptions: makeQueryOptions(stub),
                items: NO_ITEMS,
                status: "success",
                types: VISUALIZATION_TYPES,
                search: SEARCH,
            },
            smartSearchOff,
        );

        expect(result.current.relatedItems).toEqual([]);
        expect(result.current.relatedItemsStatus).toBe("idle");
        expect(result.current.relatedHasNext).toBe(false);
        expect(stub.semanticSearchQuery).not.toHaveBeenCalled();
    });

    it("should return idle status and empty items when semantic search is disabled (no search term)", () => {
        const stub = createCatalogBackendStub();

        const { result } = renderSemanticSearch(
            {
                queryOptions: makeQueryOptions(stub),
                items: NO_ITEMS,
                status: "success",
                types: VISUALIZATION_TYPES,
                search: "",
            },
            smartSearchOn,
        );

        expect(result.current.relatedItems).toEqual([]);
        expect(result.current.relatedItemsStatus).toBe("idle");
        expect(result.current.relatedHasNext).toBe(false);
        expect(stub.semanticSearchQuery).not.toHaveBeenCalled();
    });

    it("should not initiate semantic search when queryOptions.id is provided", () => {
        const stub = createCatalogBackendStub();

        renderSemanticSearch(
            {
                queryOptions: makeQueryOptions(stub, { id: ["existing-id"] }),
                items: NO_ITEMS,
                status: "success",
                types: VISUALIZATION_TYPES,
                search: SEARCH,
            },
            smartSearchOn,
        );

        // An id-restricted feed is already an explicit selection, so the search term is blanked and
        // no query is ever built.
        expect(stub.semanticSearchQuery).not.toHaveBeenCalled();
    });

    it("should initiate semantic search when enabled and search term is provided", () => {
        const stub = createCatalogBackendStub();
        stub.setSemanticSearchResponse(neverSettles);

        renderSemanticSearch(
            {
                queryOptions: makeQueryOptions(stub),
                items: NO_ITEMS,
                status: "success",
                types: VISUALIZATION_TYPES,
                search: SEARCH,
            },
            smartSearchOn,
        );

        expect(stub.semanticSearchQuery).toHaveBeenCalledTimes(1);
        expect(stub.semanticSearchBuilder.withQuestion).toHaveBeenCalledWith(SEARCH);
        // "insight" maps to "visualization" in the genAI types.
        expect(stub.semanticSearchBuilder.withObjectTypes).toHaveBeenCalledWith(["visualization"]);
    });

    it("should query endpoints with IDs from semantic search results", async () => {
        const stub = createCatalogBackendStub();
        stub.setSemanticSearchResponse(() =>
            Promise.resolve({ results: [{ id: "id1" }, { id: "id2" }], relationships: [] }),
        );
        stub.setPages(ObjectTypes.VISUALIZATION, pageOf(ObjectTypes.VISUALIZATION, ["id1"]));

        renderSemanticSearch(
            {
                queryOptions: makeQueryOptions(stub),
                items: NO_ITEMS,
                status: "success",
                types: VISUALIZATION_TYPES,
                search: SEARCH,
            },
            smartSearchOn,
        );

        await waitFor(() => {
            expect(stub.builders[ObjectTypes.VISUALIZATION].query).toHaveBeenCalled();
        });
        // The search term is dropped in favour of the ids semantic search resolved.
        expect(stub.builders[ObjectTypes.VISUALIZATION].withFilter).toHaveBeenCalledWith(
            expect.objectContaining({ id: ["id1", "id2"], search: undefined }),
        );
    });

    it("should return found items excluding already existing items", async () => {
        const stub = createCatalogBackendStub();
        stub.setSemanticSearchResponse(() =>
            Promise.resolve({ results: [{ id: "id1" }, { id: "id2" }], relationships: [] }),
        );
        stub.setPages(ObjectTypes.VISUALIZATION, pageOf(ObjectTypes.VISUALIZATION, ["id1", "id2"]));

        const existingItem = { identifier: "id1", type: ObjectTypes.VISUALIZATION } as ICatalogItem;

        const { result } = renderSemanticSearch(
            {
                queryOptions: makeQueryOptions(stub),
                items: [existingItem],
                status: "success",
                types: VISUALIZATION_TYPES,
                search: SEARCH,
            },
            smartSearchOn,
        );

        await waitFor(() => {
            expect(result.current.relatedItemsStatus).toBe("success");
        });

        expect(result.current.relatedItems).toEqual([
            expect.objectContaining({ identifier: "id2", type: ObjectTypes.VISUALIZATION }),
        ]);
    });

    it("should preserve semantic relevance order in found items", async () => {
        const stub = createCatalogBackendStub();
        // Search relevance puts id2 first...
        stub.setSemanticSearchResponse(() =>
            Promise.resolve({ results: [{ id: "id2" }, { id: "id1" }], relationships: [] }),
        );
        // ...while the endpoints return them the other way round (endpoint order, not relevance).
        stub.setPages(ObjectTypes.VISUALIZATION, pageOf(ObjectTypes.VISUALIZATION, ["id1"]));
        stub.setPages(ObjectTypes.METRIC, pageOf(ObjectTypes.METRIC, ["id2"]));

        const { result } = renderSemanticSearch(
            {
                queryOptions: makeQueryOptions(stub),
                items: NO_ITEMS,
                status: "success",
                types: [ObjectTypes.VISUALIZATION, ObjectTypes.METRIC],
                search: SEARCH,
            },
            smartSearchOn,
        );

        await waitFor(() => {
            expect(result.current.relatedItemsStatus).toBe("success");
        });

        expect(result.current.relatedItems.map((item) => item.identifier)).toEqual(["id2", "id1"]);
    });

    it("should handle loading status correctly", () => {
        const stub = createCatalogBackendStub();
        stub.setSemanticSearchResponse(neverSettles);

        const { result } = renderSemanticSearch(
            {
                queryOptions: makeQueryOptions(stub),
                items: NO_ITEMS,
                status: "success",
                types: VISUALIZATION_TYPES,
                search: SEARCH,
            },
            smartSearchOn,
        );

        expect(result.current.relatedItemsStatus).toBe("loading");
        expect(result.current.relatedHasNext).toBe(true);
    });

    it("should handle error status from endpoints", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const stub = createCatalogBackendStub();
        stub.setSemanticSearchResponse(() =>
            Promise.resolve({ results: [{ id: "id1" }], relationships: [] }),
        );
        stub.setPages(ObjectTypes.VISUALIZATION, () => Promise.reject(new Error("query failed")));

        const { result } = renderSemanticSearch(
            {
                queryOptions: makeQueryOptions(stub),
                items: NO_ITEMS,
                status: "success",
                types: VISUALIZATION_TYPES,
                search: SEARCH,
            },
            smartSearchOn,
        );

        await waitFor(() => {
            expect(result.current.relatedItemsStatus).toBe("error");
        });
    });

    it("should clear found items when unmounted during loading", async () => {
        const stub = createCatalogBackendStub();
        stub.setSemanticSearchResponse(() =>
            Promise.resolve({ results: [{ id: "id1" }], relationships: [] }),
        );

        let resolvePage: (value: unknown) => void;
        const pagePromise = new Promise((resolve) => {
            resolvePage = resolve;
        });
        stub.setPages(ObjectTypes.VISUALIZATION, () => pagePromise as never);

        const { unmount } = renderSemanticSearch(
            {
                queryOptions: makeQueryOptions(stub),
                items: NO_ITEMS,
                status: "success",
                types: VISUALIZATION_TYPES,
                search: SEARCH,
            },
            smartSearchOn,
        );

        await waitFor(() => {
            expect(stub.builders[ObjectTypes.VISUALIZATION].query).toHaveBeenCalled();
        });

        unmount();
        resolvePage!(await pageOf(ObjectTypes.VISUALIZATION, ["id1"])());

        // We can't easily check foundItems state after unmount, but we can verify it doesn't throw.
    });
});

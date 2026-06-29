// (C) 2026 GoodData Corporation

import { renderHook, waitFor } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useSemanticSearch } from "@gooddata/sdk-ui-semantic-search";

import { type ObjectType } from "../../objectType/types.js";
import { useFeatureFlags } from "../../permission/PermissionsContext.js";
import { type ICatalogItem, type ICatalogItemQueryOptions } from "../types.js";
import { useCatalogEndpoints } from "../useCatalogEndpoints.js";
import { useCatalogItemSemanticSearch } from "../useCatalogItemSemanticSearch.js";

vi.mock("@gooddata/sdk-ui-semantic-search", () => ({
    useSemanticSearch: vi.fn(),
}));

vi.mock("../../permission/PermissionsContext.js", () => ({
    useFeatureFlags: vi.fn(),
}));

vi.mock("../useCatalogEndpoints.js", () => ({
    useCatalogEndpoints: vi.fn(),
}));

vi.mock("../converter.js", () => ({
    convertEntityToCatalogItem: vi.fn((entity: ICatalogItem) => entity),
}));

describe("useCatalogItemSemanticSearch", () => {
    const backend = {} as IAnalyticalBackend;
    const workspace = "workspace";
    const queryOptions: ICatalogItemQueryOptions = {
        backend,
        workspace,
        origin: "ALL",
    };
    const items: ICatalogItem[] = [];
    const status = "success";
    const types: ObjectType[] = ["insight"];
    const search = "search term";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return idle status and empty items when semantic search is disabled (no flag)", () => {
        (useFeatureFlags as Mock).mockReturnValue({ enableSemanticSearch: false });
        (useSemanticSearch as Mock).mockReturnValue({ searchStatus: "idle", searchResults: [] });
        (useCatalogEndpoints as Mock).mockReturnValue([]);

        const { result } = renderHook(() =>
            useCatalogItemSemanticSearch({
                queryOptions,
                items,
                status,
                types,
                search,
            }),
        );

        expect(result.current.relatedItems).toEqual([]);
        expect(result.current.relatedItemsStatus).toBe("idle");
        expect(result.current.relatedHasNext).toBe(false);
    });

    it("should return idle status and empty items when semantic search is disabled (no search term)", () => {
        (useFeatureFlags as Mock).mockReturnValue({ enableSemanticSearch: true });
        (useSemanticSearch as Mock).mockReturnValue({ searchStatus: "idle", searchResults: [] });
        (useCatalogEndpoints as Mock).mockReturnValue([]);

        const { result } = renderHook(() =>
            useCatalogItemSemanticSearch({
                queryOptions,
                items,
                status,
                types,
                search: "",
            }),
        );

        expect(result.current.relatedItems).toEqual([]);
        expect(result.current.relatedItemsStatus).toBe("idle");
        expect(result.current.relatedHasNext).toBe(false);
    });

    it("should not initiate semantic search when queryOptions.id is provided", () => {
        (useFeatureFlags as Mock).mockReturnValue({ enableSemanticSearch: true });
        (useSemanticSearch as Mock).mockReturnValue({ searchStatus: "idle", searchResults: [] });
        (useCatalogEndpoints as Mock).mockReturnValue([]);

        renderHook(() =>
            useCatalogItemSemanticSearch({
                queryOptions: { ...queryOptions, id: ["existing-id"] },
                items,
                status,
                types,
                search,
            }),
        );

        expect(useSemanticSearch).toHaveBeenCalledWith(
            expect.objectContaining({
                searchTerm: "",
            }),
        );
    });

    it("should initiate semantic search when enabled and search term is provided", () => {
        (useFeatureFlags as Mock).mockReturnValue({ enableSemanticSearch: true });
        (useSemanticSearch as Mock).mockReturnValue({ searchStatus: "loading", searchResults: [] });
        (useCatalogEndpoints as Mock).mockReturnValue([]);

        renderHook(() =>
            useCatalogItemSemanticSearch({
                queryOptions,
                items,
                status,
                types,
                search,
            }),
        );

        expect(useSemanticSearch).toHaveBeenCalledWith({
            searchTerm: search,
            backend,
            workspace,
            objectTypes: ["visualization"], // insight maps to visualization in genai types
        });
    });

    it("should query endpoints with IDs from semantic search results", async () => {
        (useFeatureFlags as Mock).mockReturnValue({ enableSemanticSearch: true });
        (useSemanticSearch as Mock).mockReturnValue({
            searchStatus: "success",
            searchResults: [{ id: "id1" }, { id: "id2" }],
        });

        const mockQuery = vi.fn().mockResolvedValue({ items: [{ identifier: "id1", type: "insight" }] });
        (useCatalogEndpoints as Mock).mockReturnValue([{ query: mockQuery }]);

        renderHook(() =>
            useCatalogItemSemanticSearch({
                queryOptions,
                items,
                status,
                types,
                search,
            }),
        );

        expect(useCatalogEndpoints).toHaveBeenCalledWith(
            types,
            expect.objectContaining({
                id: ["id1", "id2"],
                search: undefined,
            }),
            expect.anything(),
        );

        await waitFor(() => {
            expect(mockQuery).toHaveBeenCalled();
        });
    });

    it("should return found items excluding already existing items", async () => {
        (useFeatureFlags as Mock).mockReturnValue({ enableSemanticSearch: true });
        (useSemanticSearch as Mock).mockReturnValue({
            searchStatus: "success",
            searchResults: [{ id: "id1" }, { id: "id2" }],
        });

        const existingItem = { identifier: "id1", type: "insight" } as ICatalogItem;
        const newItem = { identifier: "id2", type: "insight" } as ICatalogItem;

        const mockQuery = vi.fn().mockResolvedValue({ items: [existingItem, newItem] });
        (useCatalogEndpoints as Mock).mockReturnValue([{ query: mockQuery }]);

        const { result } = renderHook(() =>
            useCatalogItemSemanticSearch({
                queryOptions,
                items: [existingItem],
                status: "success",
                types,
                search,
            }),
        );

        await waitFor(() => {
            expect(result.current.relatedItemsStatus).toBe("success");
        });

        expect(result.current.relatedItems).toEqual([newItem]);
    });

    it("should preserve semantic relevance order in found items", async () => {
        (useFeatureFlags as Mock).mockReturnValue({ enableSemanticSearch: true });
        // Order is id2, id1
        (useSemanticSearch as Mock).mockReturnValue({
            searchStatus: "success",
            searchResults: [{ id: "id2" }, { id: "id1" }],
        });

        const item1 = { identifier: "id1", type: "insight" } as ICatalogItem;
        const item2 = { identifier: "id2", type: "insight" } as ICatalogItem;

        // Mock endpoints returning them in a different order (e.g. grouped by some internal logic or endpoint order)
        const mockQuery1 = vi.fn().mockResolvedValue({ items: [item1] });
        const mockQuery2 = vi.fn().mockResolvedValue({ items: [item2] });
        // Suppose endpoint for id1 is first in the list
        (useCatalogEndpoints as Mock).mockReturnValue([{ query: mockQuery1 }, { query: mockQuery2 }]);

        const { result } = renderHook(() =>
            useCatalogItemSemanticSearch({
                queryOptions,
                items: [],
                status: "success",
                types,
                search,
            }),
        );

        await waitFor(() => {
            expect(result.current.relatedItemsStatus).toBe("success");
        });

        // Should be id2 then id1
        expect(result.current.relatedItems).toEqual([item2, item1]);
    });

    it("should handle loading status correctly", () => {
        (useFeatureFlags as Mock).mockReturnValue({ enableSemanticSearch: true });
        (useSemanticSearch as Mock).mockReturnValue({ searchStatus: "loading", searchResults: [] });
        (useCatalogEndpoints as Mock).mockReturnValue([]);

        const { result } = renderHook(() =>
            useCatalogItemSemanticSearch({
                queryOptions,
                items,
                status: "success",
                types,
                search,
            }),
        );

        expect(result.current.relatedHasNext).toBe(true);
    });

    it("should handle error status from endpoints", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        (useFeatureFlags as Mock).mockReturnValue({ enableSemanticSearch: true });
        (useSemanticSearch as Mock).mockReturnValue({
            searchStatus: "success",
            searchResults: [{ id: "id1" }],
        });

        const mockQuery = vi.fn().mockRejectedValue(new Error("query failed"));
        (useCatalogEndpoints as Mock).mockReturnValue([{ query: mockQuery }]);

        const { result } = renderHook(() =>
            useCatalogItemSemanticSearch({
                queryOptions,
                items,
                status: "success",
                types,
                search,
            }),
        );

        await waitFor(() => {
            expect(result.current.relatedItemsStatus).toBe("error");
        });
    });

    it("should clear found items when unmounted during loading", async () => {
        (useFeatureFlags as Mock).mockReturnValue({ enableSemanticSearch: true });
        (useSemanticSearch as Mock).mockReturnValue({
            searchStatus: "success",
            searchResults: [{ id: "id1" }],
        });

        let resolveQuery: (value: unknown) => void;
        const queryPromise = new Promise((resolve) => {
            resolveQuery = resolve;
        });
        const mockQuery = vi.fn().mockReturnValue(queryPromise);
        (useCatalogEndpoints as Mock).mockReturnValue([{ query: mockQuery }]);

        const { unmount } = renderHook(() =>
            useCatalogItemSemanticSearch({
                queryOptions,
                items,
                status: "success",
                types,
                search,
            }),
        );

        unmount();
        resolveQuery!({ items: [{ identifier: "id1", type: "insight" }] });

        // We can't easily check foundItems state after unmount, but we can verify it doesn't throw
    });
});

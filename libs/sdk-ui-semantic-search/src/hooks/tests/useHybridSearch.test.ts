// (C) 2024-2026 GoodData Corporation

import { type ReactNode, createElement } from "react";

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type ISemanticSearchResultItem, idRef, isIdentifierRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { type SearchItem, type SearchItemGroup } from "../search/types.js";
import { useHybridSearch } from "../useHybridSearch.js";
import { useSemanticSearch } from "../useSemanticSearch.js";

// Mock useSemanticSearch to control semantic search results
vi.mock("../useSemanticSearch.js", () => ({
    useSemanticSearch: vi.fn(),
}));

describe("useHybridSearch hook", () => {
    const backend = dummyBackend();
    const workspace = "test-workspace";

    const items: SearchItem[] = [
        { ref: idRef("item1"), title: "Metric 1", description: "First metric" },
        { ref: idRef("item2"), title: "Metric 2", description: "Second metric" },
        { ref: idRef("item3"), title: "Attribute 1", description: "First attribute" },
    ];

    const itemGroups: SearchItemGroup<SearchItem>[] = [
        { title: "Group 1", items: [items[0], items[1]] },
        { title: "Group 2", items: [items[2]] },
    ];

    const itemBuilder = (item: ISemanticSearchResultItem) => {
        return items.find((i) => isIdentifierRef(i.ref) && i.ref.identifier === item.id);
    };

    const wrapper = ({ children }: { children: ReactNode }) => {
        return createElement(
            BackendProvider,
            { backend },
            createElement(WorkspaceProvider, { workspace }, children),
        );
    };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.mocked(useSemanticSearch).mockReturnValue({
            searchStatus: "idle",
            searchError: "",
            searchMessage: "",
            searchResults: [],
            relationships: [],
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe("keyword search (local search)", () => {
        it("should return all items when query is empty", () => {
            const { result } = renderHook(
                () =>
                    useHybridSearch({
                        itemBuilder,
                    }),
                { wrapper },
            );

            const searchResult = result.current.search({ items });

            expect(searchResult.searchItems).toEqual(items);
            expect(result.current.searchState.state).toBe("idle");
        });

        it("should return matching items for a query", async () => {
            const { result } = renderHook(
                () =>
                    useHybridSearch({
                        itemBuilder,
                    }),
                { wrapper },
            );

            await act(async () => {
                result.current.onSearchQueryChange("Metric");
            });

            // Need to advance timers because of debounce in useHybridSearch
            await act(async () => {
                vi.advanceTimersByTime(150);
            });

            const searchResult = result.current.search({ items });

            expect(searchResult.searchItems).toEqual([items[0], items[1]]);
            expect(result.current.searchState.debouncedQuery).toBe("Metric");
            expect(result.current.searchState.state).toBe("completed");
        });

        it("should be case insensitive", async () => {
            const { result } = renderHook(
                () =>
                    useHybridSearch({
                        itemBuilder,
                    }),
                { wrapper },
            );

            await act(async () => {
                result.current.onSearchQueryChange("mEtRiC");
                vi.advanceTimersByTime(150);
            });

            const searchResult = result.current.search({ items });
            expect(searchResult.searchItems).toEqual([items[0], items[1]]);
        });

        it("should return matching item groups", async () => {
            const { result } = renderHook(
                () =>
                    useHybridSearch({
                        itemBuilder,
                    }),
                { wrapper },
            );

            await act(async () => {
                result.current.onSearchQueryChange("Group 1");
                vi.advanceTimersByTime(150);
            });

            const searchResult = result.current.search({ items, itemGroups });
            expect(searchResult.searchItemGroups).toEqual([itemGroups[0]]);
        });

        it("should return matching keywords", async () => {
            const { result } = renderHook(
                () =>
                    useHybridSearch({
                        itemBuilder,
                    }),
                { wrapper },
            );

            await act(async () => {
                result.current.onSearchQueryChange("key");
                vi.advanceTimersByTime(150);
            });

            const searchResult = result.current.search({ items, keywords: ["keyword1", "other"] });
            expect(searchResult.searchKeywords).toEqual(["keyword1"]);
        });

        it("should handle 'searching' state during debounce", async () => {
            const { result } = renderHook(
                () =>
                    useHybridSearch({
                        itemBuilder,
                        debounceMs: 500,
                    }),
                { wrapper },
            );

            await act(async () => {
                result.current.onSearchQueryChange("test");
            });

            expect(result.current.searchState.state).toBe("searching");
            expect(result.current.searchState.query).toBe("test");
            expect(result.current.searchState.debouncedQuery).toBe("");

            await act(async () => {
                vi.advanceTimersByTime(500);
            });

            expect(result.current.searchState.state).toBe("completed");
            expect(result.current.searchState.debouncedQuery).toBe("test");
        });
    });

    describe("semantic search integration", () => {
        it("should update semanticSearchState from useSemanticSearch", () => {
            vi.mocked(useSemanticSearch).mockReturnValue({
                searchStatus: "loading",
                searchError: "some error",
                searchMessage: "searching...",
                searchResults: [],
                relationships: [],
            });

            const { result } = renderHook(
                () =>
                    useHybridSearch({
                        itemBuilder,
                    }),
                { wrapper },
            );

            expect(result.current.semanticSearchState).toEqual({
                state: "loading",
                error: "some error",
                message: "searching...",
            });
        });

        it("should return related items from semantic search", async () => {
            const semanticResults = [
                { id: "item1", type: "metric", title: "Semantic Metric 1" },
                { id: "item4", type: "metric", title: "Semantic Metric 4" }, // Not in local items
            ];

            vi.mocked(useSemanticSearch).mockReturnValue({
                searchStatus: "success",
                searchError: "",
                searchMessage: "",
                searchResults: semanticResults as ISemanticSearchResultItem[],
                relationships: [],
            });

            const { result } = renderHook(
                () =>
                    useHybridSearch({
                        itemBuilder: (_item, { ref }) => {
                            // Return the item if it exists in our local items
                            return items.find(
                                (i) =>
                                    isIdentifierRef(i.ref) &&
                                    isIdentifierRef(ref) &&
                                    i.ref.identifier === ref.identifier,
                            );
                        },
                    }),
                { wrapper },
            );

            await act(async () => {
                result.current.onSearchQueryChange("something");
                vi.advanceTimersByTime(150);
            });

            const searchResult = result.current.search({ items });

            expect(searchResult.searchRelatedItems).toEqual([items[0]]);
        });

        it("should filter out already matched items from related items", async () => {
            const semanticResults = [{ id: "item1", type: "metric", title: "Metric 1" }];

            vi.mocked(useSemanticSearch).mockReturnValue({
                searchStatus: "success",
                searchError: "",
                searchMessage: "",
                searchResults: semanticResults as ISemanticSearchResultItem[],
                relationships: [],
            });

            const { result } = renderHook(
                () =>
                    useHybridSearch({
                        itemBuilder: (_item, { ref }) => {
                            return items.find(
                                (i) =>
                                    isIdentifierRef(i.ref) &&
                                    isIdentifierRef(ref) &&
                                    i.ref.identifier === ref.identifier,
                            );
                        },
                    }),
                { wrapper },
            );

            await act(async () => {
                result.current.onSearchQueryChange("Metric 1");
                vi.advanceTimersByTime(150);
            });

            const searchResult = result.current.search({ items });

            // "Metric 1" matches items[0] locally.
            expect(searchResult.searchItems).toEqual([items[0]]);
            // Since it's already in searchItems (and thus searchAllItems), it should NOT be in searchRelatedItems
            expect(searchResult.searchRelatedItems).toEqual([]);
        });

        it("should not perform semantic search if allowSematicSearch is false", async () => {
            const { result } = renderHook(
                () =>
                    useHybridSearch({
                        itemBuilder,
                        allowSematicSearch: false,
                    }),
                { wrapper },
            );

            await act(async () => {
                result.current.onSearchQueryChange("test");
                vi.advanceTimersByTime(150);
            });

            expect(useSemanticSearch).toHaveBeenCalledWith(
                expect.objectContaining({
                    searchTerm: "",
                }),
            );
        });
    });
});

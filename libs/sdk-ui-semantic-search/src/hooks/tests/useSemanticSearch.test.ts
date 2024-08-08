// (C) 2024 GoodData Corporation

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { useSemanticSearch } from "../useSemanticSearch.js";

const backend = dummyBackend();

describe("useSemanticSearch hook", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should return correct results", async () => {
        const { result } = renderHook(() =>
            useSemanticSearch({
                backend,
                workspace: "test",
                searchTerm: "test",
            }),
        );

        expect(result.current).toEqual({
            searchStatus: "loading",
            searchResults: [],
            searchError: "",
            relationships: [],
        });

        await act(() => vi.advanceTimersByTimeAsync(150));

        expect(result.current.searchStatus).toEqual("success");
        expect(result.current).toMatchSnapshot();
    });

    it("should cancel previous search", async () => {
        // This test relies on dummy backend delay in returning results in 100ms
        const DELAY = 100;
        const { result, rerender } = renderHook(
            ({ searchTerm }) =>
                useSemanticSearch({
                    backend,
                    workspace: "test",
                    searchTerm,
                }),
            {
                initialProps: { searchTerm: "test" },
            },
        );

        expect(result.current).toEqual({
            searchStatus: "loading",
            searchResults: [],
            searchError: "",
            relationships: [],
        });

        // Simulate user entering a different search query before the first request is completed
        await act(() => vi.advanceTimersByTimeAsync(DELAY * 0.75));
        rerender({ searchTerm: "test2" });

        // Now, if the first request is not cancelled, the search results should have been delivered by now
        await act(() => vi.advanceTimersByTimeAsync(DELAY * 0.5));

        expect(result.current).toEqual({
            searchStatus: "loading",
            searchResults: [],
            searchError: "",
            relationships: [],
        });

        // Let the second request complete
        await act(() => vi.advanceTimersByTimeAsync(DELAY * 0.5));

        expect(result.current.searchStatus).toEqual("success");
        expect(result.current).toMatchSnapshot();
    });
});

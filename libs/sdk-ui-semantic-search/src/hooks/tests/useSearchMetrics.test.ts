// (C) 2024-2025 GoodData Corporation

import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSearchMetrics } from "../useSearchMetrics.js";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";

describe("useSearchMetrics hook", () => {
    const item: ISemanticSearchResultItem = {
        type: "dashboard",
        id: "test",
        workspaceId: "test",
        title: "selected",
        description: "",
        createdAt: undefined,
        modifiedAt: undefined,
        score: 0.5,
        scoreTitle: 0.5,
        scoreDescriptor: 0.5,
        scoreExactMatch: 0.5,
        tags: [],
    };
    const item2: ISemanticSearchResultItem = {
        type: "dashboard",
        id: "test2",
        workspaceId: "test",
        title: "selected2",
        description: "",
        createdAt: undefined,
        modifiedAt: undefined,
        score: 0.4,
        scoreTitle: 0.4,
        scoreDescriptor: 0.4,
        scoreExactMatch: 0.4,
        tags: [],
    };

    it("should report open -> close transaction", async () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useSearchMetrics(callback));

        const { onCloseMetrics } = result.current;

        act(() => onCloseMetrics());

        expect(callback).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith({
            lastSearchTerm: "",
            lastSearchScores: [],
            searchCount: 0,
            selectedItemTitle: null,
            selectedItemType: null,
            selectedItemScore: null,
            selectedItemIndex: null,
        });
    });

    it("should report open -> type -> close transaction", async () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useSearchMetrics(callback));

        const { onCloseMetrics, onSearchMetrics } = result.current;

        act(() => onSearchMetrics("test", [{ item }, { item: item2 }]));
        act(() => onCloseMetrics());

        expect(callback).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith({
            lastSearchTerm: "test",
            lastSearchScores: [0.5, 0.4],
            searchCount: 1,
            selectedItemTitle: null,
            selectedItemType: null,
            selectedItemScore: null,
            selectedItemIndex: null,
        });
    });

    it("should report open -> type -> select transaction", async () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useSearchMetrics(callback));

        const { onSelectMetrics, onSearchMetrics } = result.current;

        act(() => onSearchMetrics("test", [{ item }, { item: item2 }]));
        act(() => onSelectMetrics(item, 0));

        expect(callback).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith({
            lastSearchTerm: "test",
            lastSearchScores: [0.5, 0.4],
            searchCount: 1,
            selectedItemTitle: "selected",
            selectedItemType: "dashboard",
            selectedItemScore: 0.5,
            selectedItemIndex: 0,
        });
    });

    it("should report open -> type -> select -> select transactions", async () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useSearchMetrics(callback));

        const { onSelectMetrics, onSearchMetrics } = result.current;

        act(() => onSearchMetrics("test", [{ item }, { item: item2 }]));
        act(() => onSelectMetrics(item, 0));
        act(() => onSelectMetrics(item2, 1));

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenNthCalledWith(1, {
            lastSearchTerm: "test",
            lastSearchScores: [0.5, 0.4],
            searchCount: 1,
            selectedItemTitle: "selected",
            selectedItemType: "dashboard",
            selectedItemScore: 0.5,
            selectedItemIndex: 0,
        });
        expect(callback).toHaveBeenNthCalledWith(2, {
            lastSearchTerm: "test",
            lastSearchScores: [0.5, 0.4],
            searchCount: 1,
            selectedItemTitle: "selected2",
            selectedItemType: "dashboard",
            selectedItemScore: 0.4,
            selectedItemIndex: 1,
        });
    });

    it("should not report close transaction if item was selected", async () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useSearchMetrics(callback));

        const { onCloseMetrics, onSelectMetrics, onSearchMetrics } = result.current;

        act(() => onSearchMetrics("test", [{ item }, { item: item2 }]));
        act(() => onSelectMetrics(item, 0));
        act(() => onCloseMetrics());

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({
            lastSearchTerm: "test",
            lastSearchScores: [0.5, 0.4],
            searchCount: 1,
            selectedItemTitle: "selected",
            selectedItemType: "dashboard",
            selectedItemScore: 0.5,
            selectedItemIndex: 0,
        });
    });
});

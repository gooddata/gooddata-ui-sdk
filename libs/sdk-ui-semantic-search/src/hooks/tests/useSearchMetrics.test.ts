// (C) 2024 GoodData Corporation

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
        createdAt: null,
        modifiedAt: null,
        score: 0.5,
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
            searchCount: 0,
            selectedItemTitle: null,
            selectedItemType: null,
        });
    });

    it("should report open -> type -> close transaction", async () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useSearchMetrics(callback));

        const { onCloseMetrics, onSearchMetrics } = result.current;

        act(() => onSearchMetrics("test"));
        act(() => onCloseMetrics());

        expect(callback).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith({
            lastSearchTerm: "test",
            searchCount: 1,
            selectedItemTitle: null,
            selectedItemType: null,
        });
    });

    it("should report open -> type -> select transaction", async () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useSearchMetrics(callback));

        const { onSelectMetrics, onSearchMetrics } = result.current;

        act(() => onSearchMetrics("test"));
        act(() => onSelectMetrics(item));

        expect(callback).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith({
            lastSearchTerm: "test",
            searchCount: 1,
            selectedItemTitle: "selected",
            selectedItemType: "dashboard",
        });
    });

    it("should report open -> type -> select -> select transactions", async () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useSearchMetrics(callback));

        const { onSelectMetrics, onSearchMetrics } = result.current;

        act(() => onSearchMetrics("test"));
        act(() => onSelectMetrics(item));
        act(() => onSelectMetrics({ ...item, title: "other" }));

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenNthCalledWith(1, {
            lastSearchTerm: "test",
            searchCount: 1,
            selectedItemTitle: "selected",
            selectedItemType: "dashboard",
        });
        expect(callback).toHaveBeenNthCalledWith(2, {
            lastSearchTerm: "test",
            searchCount: 1,
            selectedItemTitle: "other",
            selectedItemType: "dashboard",
        });
    });

    it("should not report close transaction if item was selected", async () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useSearchMetrics(callback));

        const { onCloseMetrics, onSelectMetrics, onSearchMetrics } = result.current;

        act(() => onSearchMetrics("test"));
        act(() => onSelectMetrics(item));
        act(() => onCloseMetrics());

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({
            lastSearchTerm: "test",
            searchCount: 1,
            selectedItemTitle: "selected",
            selectedItemType: "dashboard",
        });
    });
});

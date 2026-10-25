// (C) 2019-2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useScrollableArea } from "./ScrollableAreaHook.js";

describe("useScrollableArea", () => {
    it("should not fail before initial rendering", () => {
        const { result } = renderHook(() => useScrollableArea());
        result.current.onScroll();
    });

    it("should call dispatchEvent after initial rendering", () => {
        const dispatchEventMock = vi.fn();
        const { result } = renderHook(() => useScrollableArea());

        result.current.scrollableRef.current = {
            dispatchEvent: dispatchEventMock,
        };

        result.current.onScroll();
        expect(dispatchEventMock).toBeCalled();
    });
});

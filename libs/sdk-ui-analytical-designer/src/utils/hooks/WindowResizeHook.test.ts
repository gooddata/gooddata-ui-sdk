// (C) 2019-2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { range } from "lodash-es";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWindowResize } from "./WindowResizeHook.js";

describe("useWindowResize", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("should call callback once when window is resized", () => {
        const callback = vi.fn();
        renderHook(() => useWindowResize(callback, 10));

        window.dispatchEvent(new Event("resize"));

        expect(callback).toHaveBeenCalledTimes(0);

        vi.runAllTimers();

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should be debounced", () => {
        const callback = vi.fn();
        renderHook(() => useWindowResize(callback, 10));

        range(5).forEach(() => window.dispatchEvent(new Event("resize")));

        vi.runAllTimers();

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should not debounce when time is set to 0", () => {
        const callback = vi.fn();
        renderHook(() => useWindowResize(callback, 0));

        window.dispatchEvent(new Event("resize"));

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should not call callback when hook is unmounted", () => {
        const callback = vi.fn();
        const { unmount } = renderHook(() => useWindowResize(callback, 10));

        unmount();

        window.dispatchEvent(new Event("resize"));

        vi.runAllTimers();

        expect(callback).toHaveBeenCalledTimes(0);
    });
});

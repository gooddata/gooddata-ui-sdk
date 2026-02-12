// (C) 2025-2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebounce } from "../debounce.js";

describe("useDebounce", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should debounce the callback", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebounce(callback, 300));

        // Call debounced function multiple times rapidly
        act(() => {
            result.current();
            result.current();
            result.current();
        });

        // Callback should not be called yet
        expect(callback).not.toHaveBeenCalled();

        // Advance time past the delay
        act(() => {
            vi.advanceTimersByTime(300);
        });

        // Now callback should be called exactly once
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should pass arguments to the callback", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebounce(callback, 100));

        act(() => {
            result.current("arg1", 42);
        });

        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(callback).toHaveBeenCalledWith("arg1", 42);
    });

    it("should return a stable function reference across re-renders", () => {
        const callback = vi.fn();
        const { result, rerender } = renderHook(() => useDebounce(callback, 300));

        const firstReference = result.current;

        // Re-render the hook
        rerender();

        // The debounced function reference should remain the same
        expect(result.current).toBe(firstReference);
    });

    it("should always call the latest callback version", () => {
        const firstCallback = vi.fn();
        const secondCallback = vi.fn();

        const { result, rerender } = renderHook(({ cb }) => useDebounce(cb, 300), {
            initialProps: { cb: firstCallback },
        });

        // Call debounced function
        act(() => {
            result.current();
        });

        // Update to a new callback before the debounce fires
        rerender({ cb: secondCallback });

        // Advance time to trigger the debounced call
        act(() => {
            vi.advanceTimersByTime(300);
        });

        // The second (latest) callback should be called, not the first
        expect(firstCallback).not.toHaveBeenCalled();
        expect(secondCallback).toHaveBeenCalledTimes(1);
    });

    it("should reset timer on subsequent calls within delay period", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebounce(callback, 300));

        act(() => {
            result.current();
        });

        // Advance time but not past the delay
        act(() => {
            vi.advanceTimersByTime(200);
        });

        // Call again - this should reset the timer
        act(() => {
            result.current();
        });

        // Advance another 200ms (total 400ms from first call, but only 200ms from second)
        act(() => {
            vi.advanceTimersByTime(200);
        });

        // Callback should still not be called (need 300ms from last call)
        expect(callback).not.toHaveBeenCalled();

        // Advance the remaining 100ms
        act(() => {
            vi.advanceTimersByTime(100);
        });

        // Now it should be called
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should create new debounced function when delay changes", () => {
        const callback = vi.fn();
        const { result, rerender } = renderHook(({ delay }) => useDebounce(callback, delay), {
            initialProps: { delay: 300 },
        });

        const firstReference = result.current;

        // Change the delay
        rerender({ delay: 500 });

        // The debounced function reference should change
        expect(result.current).not.toBe(firstReference);
    });

    it("should have cancel method that prevents callback execution", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebounce(callback, 300));

        act(() => {
            result.current();
        });

        // Cancel before the delay passes
        act(() => {
            result.current.cancel();
        });

        // Advance time past the delay
        act(() => {
            vi.advanceTimersByTime(300);
        });

        // Callback should not have been called
        expect(callback).not.toHaveBeenCalled();
    });

    it("should have flush method that executes callback immediately", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebounce(callback, 300));

        act(() => {
            result.current();
        });

        // Flush immediately
        act(() => {
            result.current.flush();
        });

        // Callback should be called immediately without waiting
        expect(callback).toHaveBeenCalledTimes(1);
    });
});

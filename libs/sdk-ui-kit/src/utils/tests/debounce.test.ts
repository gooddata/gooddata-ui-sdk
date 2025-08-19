// (C) 2020-2025 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebouncedState } from "@gooddata/sdk-ui";

describe("useDebouncedState", () => {
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
    });

    it("should work as a regular state handler", () => {
        const { result } = renderHook(() => useDebouncedState("foo", 100));
        const [value, setValue] = result.current;

        expect(value).toBe("foo");

        act(() => {
            setValue("bar");
        });

        expect(result.current[0]).toBe("bar");
    });

    it("should provide debounced value", () => {
        const { result } = renderHook(() => useDebouncedState("foo", 100));
        const [_, setValue, debouncedValue] = result.current;

        act(() => {
            setValue("bar");
        });

        expect(debouncedValue).toBe("foo");

        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(result.current[2]).toBe("bar");
    });

    it("should handle multiple changes correctly", () => {
        const { result } = renderHook(() => useDebouncedState("foo", 100));
        const [_, setValue, debouncedValue] = result.current;

        act(() => {
            setValue("bar");
        });

        expect(debouncedValue).toBe("foo");

        act(() => {
            setValue("baz");
        });

        expect(debouncedValue).toBe("foo");

        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(result.current[2]).toBe("baz");
    });
});

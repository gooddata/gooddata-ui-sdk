// (C) 2007-2026 GoodData Corporation

import { act, fireEvent, renderHook } from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { useLocalStorage } from "../useLocalStorage.js";

describe("useLocalStorage hook", () => {
    const KEY = "test-key";
    const VALUE = "test-value";
    const NEW_VALUE = "new-value";

    beforeEach(() => {
        window.localStorage.removeItem(KEY);
    });

    afterAll(() => {
        window.localStorage.removeItem(KEY);
    });

    it("should save the value to local storage", () => {
        const { result } = renderHook(() => useLocalStorage(KEY, VALUE));

        expect(result.current[0]).toBe(VALUE);
        // Default value does not pollute localStorage
        expect(window.localStorage.getItem(KEY)).toBe(null);

        act(() => result.current[1](NEW_VALUE));
        expect(result.current[0]).toBe(NEW_VALUE);
        expect(window.localStorage.getItem(KEY)).toBe(`"${NEW_VALUE}"`);
    });

    it("should recover the value from local storage", () => {
        window.localStorage.setItem(KEY, `"${VALUE}"`);

        const { result } = renderHook(() => useLocalStorage(KEY, VALUE));

        expect(result.current[0]).toBe(VALUE);
    });

    it("should update the value when localStorage changes", () => {
        const { result } = renderHook(() => useLocalStorage(KEY, VALUE));

        expect(result.current[0]).toBe(VALUE);

        act(() => {
            window.localStorage.setItem(KEY, `"${NEW_VALUE}"`);
            fireEvent(window, new StorageEvent("storage", { key: KEY, newValue: `"${NEW_VALUE}"` }));
        });

        expect(result.current[0]).toBe(NEW_VALUE);
    });
});

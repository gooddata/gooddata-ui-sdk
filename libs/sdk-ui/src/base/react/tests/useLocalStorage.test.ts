// (C) 2007-2024 GoodData Corporation
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { useLocalStorage } from "../useLocalStorage.js";
import { act, renderHook, fireEvent } from "@testing-library/react";

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

    it("should save the value to local storage", async () => {
        const { result } = renderHook(() => useLocalStorage(KEY, VALUE));

        expect(result.current[0]).toBe(VALUE);
        // Default value does not pollute localStorage
        expect(window.localStorage.getItem(KEY)).toBe(null);

        act(() => result.current[1](NEW_VALUE));
        expect(result.current[0]).toBe(NEW_VALUE);
        expect(window.localStorage.getItem(KEY)).toBe(`"${NEW_VALUE}"`);
    });

    it("should recover the value from local storage", async () => {
        window.localStorage.setItem(KEY, `"${VALUE}"`);

        const { result } = renderHook(() => useLocalStorage(KEY, VALUE));

        expect(result.current[0]).toBe(VALUE);
    });

    it("should update the value when localStorage changes", async () => {
        const { result } = renderHook(() => useLocalStorage(KEY, VALUE));

        expect(result.current[0]).toBe(VALUE);

        act(() => {
            window.localStorage.setItem(KEY, `"${NEW_VALUE}"`);
            fireEvent(window, new StorageEvent("storage", { key: KEY, newValue: `"${NEW_VALUE}"` }));
        });

        expect(result.current[0]).toBe(NEW_VALUE);
    });
});

// (C) 2020-2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDidComponentMount } from "./generic_hooks.js";

describe("hooks", () => {
    describe("useDidComponentMount", () => {
        it("should return false for the first time when called and true for any subsequent call", () => {
            const { result, rerender } = renderHook(() => useDidComponentMount());
            expect(result.current).toBe(false);

            rerender();
            expect(result.current).toBe(true);

            rerender();
            expect(result.current).toBe(true);
        });
    });
});

// (C) 2025-2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useInsightPickerState } from "../useInsightPickerState.js";

describe("useInsightPickerState", () => {
    it("should default authorFilter to current author", () => {
        const { result } = renderHook(() => useInsightPickerState("john.doe"));

        expect(result.current.authorFilter).toEqual(["john.doe"]);
    });

    it("should sync authorFilter when author becomes available", () => {
        const { result, rerender } = renderHook(
            ({ author }: { author?: string }) => useInsightPickerState(author),
            {
                initialProps: {},
            },
        );

        expect(result.current.authorFilter).toEqual([]);

        rerender({ author: "john.doe" });

        expect(result.current.authorFilter).toEqual(["john.doe"]);
    });

    it("should not override authorFilter after user changes it", () => {
        const { result, rerender } = renderHook(
            ({ author }: { author?: string }) => useInsightPickerState(author),
            {
                initialProps: {},
            },
        );

        act(() => {
            result.current.onAuthorFilterChange(["teammate"]);
        });

        rerender({ author: "john.doe" });

        expect(result.current.authorFilter).toEqual(["teammate"]);
    });
});

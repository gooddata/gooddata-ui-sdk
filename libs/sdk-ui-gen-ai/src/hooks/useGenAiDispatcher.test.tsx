// (C) 2024-2026 GoodData Corporation

import { type ReactNode } from "react";

import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { useGenAiDispatcher } from "./useGenAiDispatcher.js";

describe("useGenAiDispatcher", () => {
    it("should return dispatch from the store", () => {
        const dispatch = vi.fn();
        const store = {
            getState: () => ({}),
            subscribe: () => () => {},
            dispatch,
        };

        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store as any}>{children}</Provider>
        );

        const { result } = renderHook(() => useGenAiDispatcher(), { wrapper });

        expect(result.current).toBe(dispatch);
    });

    it("should throw error if called outside of Provider", () => {
        // react-redux useDispatch throws an error if no store is found in context
        // we suppress the console error for the test
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        expect(() => renderHook(() => useGenAiDispatcher())).toThrow();
        consoleSpy.mockRestore();
    });
});

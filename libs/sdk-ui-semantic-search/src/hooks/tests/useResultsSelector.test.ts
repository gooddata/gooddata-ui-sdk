// (C) 2024 GoodData Corporation

import { describe, it, expect, vi } from "vitest";
import { act, renderHook, fireEvent } from "@testing-library/react";
import { useListSelector } from "../useListSelector.js";

describe("useResultSelector hook", () => {
    it("should selection and setter", async () => {
        const results = ["first", "second", "third"];
        const onSelect = vi.fn();
        const { result } = renderHook(() => useListSelector(results, onSelect));

        const [selected, setSelected] = result.current;

        expect(selected).toEqual(0);
        expect(typeof setSelected).toEqual("function");
    });

    it("should respect the changes from outside", async () => {
        const results = ["first", "second", "third"];
        const onSelect = vi.fn();
        const { result } = renderHook(() => useListSelector(results, onSelect));

        const [, setSelected] = result.current;

        act(() => setSelected(2));

        const [selected] = result.current;

        expect(selected).toEqual(2);
    });

    it("should not let the selection go out of bounds", async () => {
        const results = ["first", "second", "third"];
        const onSelect = vi.fn();
        const { result } = renderHook(() => useListSelector(results, onSelect));

        const [, setSelected] = result.current;

        act(() => setSelected(10));
        expect(result.current[0]).toEqual(2);

        act(() => setSelected(-1));
        expect(result.current[0]).toEqual(0);
    });

    it("should navigate the list up and down", async () => {
        const results = ["first", "second", "third"];
        const onSelect = vi.fn();
        const { result } = renderHook(() => useListSelector(results, onSelect));

        await act(() => fireEvent.keyDown(document, { key: "ArrowDown" }));
        await act(() => fireEvent.keyDown(document, { key: "ArrowDown" }));
        expect(result.current[0]).toEqual(2);

        await act(() => fireEvent.keyDown(document, { key: "ArrowUp" }));
        expect(result.current[0]).toEqual(1);
    });

    it("should return selected item on Enter", async () => {
        const results = ["first", "second", "third"];
        const onSelect = vi.fn();
        const { result } = renderHook(() => useListSelector(results, onSelect));

        const [, setSelected] = result.current;
        act(() => setSelected(1));

        await act(() => fireEvent.keyDown(document, { key: "Enter" }));

        expect(onSelect).toHaveBeenLastCalledWith("second");
    });
});

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

        expect(selected).toEqual("first");
        expect(typeof setSelected).toEqual("function");
    });

    it("should respect the changes from outside", async () => {
        const results = ["first", "second", "third"];
        const onSelect = vi.fn();
        const { result } = renderHook(() => useListSelector(results, onSelect));

        const [, setSelected] = result.current;

        act(() => setSelected("third"));

        const [selected] = result.current;

        expect(selected).toEqual("third");
    });

    it("should not reset to 1st item when setting unknown item", async () => {
        const results = ["first", "second", "third"];
        const onSelect = vi.fn();
        const { result } = renderHook(() => useListSelector(results, onSelect));

        const [, setSelected] = result.current;

        act(() => setSelected("fourth"));
        expect(result.current[0]).toEqual("first");
    });

    it("should navigate the list up and down", async () => {
        const results = ["first", "second", "third"];
        const onSelect = vi.fn();
        const { result } = renderHook(() => useListSelector(results, onSelect));

        await act(() => fireEvent.keyDown(document, { key: "ArrowDown" }));
        await act(() => fireEvent.keyDown(document, { key: "ArrowDown" }));
        expect(result.current[0]).toEqual("third");

        await act(() => fireEvent.keyDown(document, { key: "ArrowUp" }));
        expect(result.current[0]).toEqual("second");
    });

    it("should return selected item on Enter", async () => {
        const results = ["first", "second", "third"];
        const onSelect = vi.fn();
        const { result } = renderHook(() => useListSelector(results, onSelect));

        const [, setSelected] = result.current;
        act(() => setSelected("second"));

        await act(() => fireEvent.keyDown(document, { key: "Enter" }));

        expect(onSelect).toHaveBeenLastCalledWith("second", expect.anything());
    });
});

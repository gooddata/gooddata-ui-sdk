// (C) 2026 GoodData Corporation

import { type KeyboardEvent } from "react";

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useListWithActionsKeyboardNavigation } from "./useListWithActionsKeyboardNavigation.js";

const items = Array.from({ length: 30 }, (_, index) => `item-${index}`);

const makeKeyEvent = (code: string, modifiers: string[] = []) => {
    const event = {
        code,
        key: code,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        getModifierState: (modifier: string) => modifiers.includes(modifier),
    };
    return event as unknown as KeyboardEvent & typeof event;
};

const renderSimpleNavigation = (pageSize?: number) =>
    renderHook(() =>
        useListWithActionsKeyboardNavigation<string, "only">({
            items,
            actionHandlers: {
                selectItem: () => undefined,
                only: () => undefined,
            },
            getItemAdditionalActions: () => ["only"],
            isSimple: true,
            isWrapping: false,
            focusedIndex: 0,
            pageSize,
        }),
    );

describe("useListWithActionsKeyboardNavigation (simple mode)", () => {
    it("should move to the last and the first item on End and Home", () => {
        const { result } = renderSimpleNavigation(10);

        act(() => result.current.onKeyboardNavigation(makeKeyEvent("End")));
        expect(result.current.focusedItem).toBe("item-29");
        expect(result.current.focusedAction).toBe("selectItem");

        act(() => result.current.onKeyboardNavigation(makeKeyEvent("Home", ["Control"])));
        expect(result.current.focusedItem).toBe("item-0");
    });

    it("should move by a page on PageDown and PageUp and stay within the items", () => {
        const { result } = renderSimpleNavigation(10);

        const pageDown = makeKeyEvent("PageDown");
        act(() => result.current.onKeyboardNavigation(pageDown));
        expect(result.current.focusedItem).toBe("item-10");
        expect(pageDown.preventDefault).toHaveBeenCalled();

        act(() => result.current.onKeyboardNavigation(makeKeyEvent("PageDown")));
        act(() => result.current.onKeyboardNavigation(makeKeyEvent("PageDown")));
        expect(result.current.focusedItem).toBe("item-29");

        act(() => result.current.onKeyboardNavigation(makeKeyEvent("PageUp")));
        expect(result.current.focusedItem).toBe("item-19");

        act(() => result.current.onKeyboardNavigation(makeKeyEvent("PageUp")));
        act(() => result.current.onKeyboardNavigation(makeKeyEvent("PageUp")));
        expect(result.current.focusedItem).toBe("item-0");
    });

    it("should leave PageDown to the browser when no page size is set", () => {
        const { result } = renderSimpleNavigation();

        const pageDown = makeKeyEvent("PageDown");
        act(() => result.current.onKeyboardNavigation(pageDown));
        expect(result.current.focusedItem).toBe("item-0");
        expect(pageDown.preventDefault).not.toHaveBeenCalled();
    });
});

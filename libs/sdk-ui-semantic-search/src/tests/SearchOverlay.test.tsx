// (C) 2024-2025 GoodData Corporation

import React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { SearchOverlay } from "../internal/SearchOverlay.js";

const backend = dummyBackend();

describe("SearchOverlay", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("exposes correct ARIA attributes on input", () => {
        render(<SearchOverlay backend={backend} workspace="test" onSelect={vi.fn()} />);

        const input = screen.getByRole("combobox");
        expect(input).toBeVisible();
        expect(input).toHaveAccessibleName(expect.any(String));
        expect(input).toHaveAttribute("id", expect.stringContaining("input"));
        expect(input).toHaveAttribute("aria-controls", expect.stringContaining("treeview"));
        expect(input).toHaveAttribute("aria-expanded", "true");
    });

    it("renders results tree after typing", async () => {
        render(<SearchOverlay backend={backend} workspace="test" onSelect={vi.fn()} />);

        const input = screen.getByRole("combobox");
        const treeViewId = input.getAttribute("aria-controls")!;

        await focusAndType(input, "test");

        const tree = screen.getByRole("tree");
        expect(tree).toBeVisible();
        expect(tree).toHaveAttribute("id", treeViewId);

        const items = screen.getAllByRole("treeitem");
        expect(items.length).toBeGreaterThan(0);
    });

    it("sets aria-activedescendant when navigating with keyboard", async () => {
        render(<SearchOverlay backend={backend} workspace="test" canFullControl={true} onSelect={vi.fn()} />);

        const input = screen.getByRole("combobox");
        const treeViewId = input.getAttribute("aria-controls")!;

        await focusAndType(input, "test");

        const getActiveDescendant = () => input.getAttribute("aria-activedescendant")!;
        const getSelectedItem = () => screen.getByRole("treeitem", { selected: true });

        expect(getActiveDescendant()).toBe(`${treeViewId}/0`);
        expect(getSelectedItem()).toHaveAttribute("id", `${treeViewId}/0`);

        fireEvent.keyDown(input, { code: "ArrowDown" });

        expect(getActiveDescendant()).toBe(`${treeViewId}/1`);
        expect(getSelectedItem()).toHaveAttribute("id", `${treeViewId}/1`);
    });
});

// Abstraction to focus the input and type a value reliably in jsdom
async function focusAndType(input: HTMLElement, value: string) {
    makeElementVisible(input);
    fireEvent.focus(input);
    fireEvent.input(input, { target: { value } });
    await vi.runAllTimersAsync();
}

// This prevents autofocus from failing in jsdom
function makeElementVisible(element: HTMLElement, height = 20) {
    Object.defineProperty(element, "offsetHeight", { configurable: true, get: () => height });
}

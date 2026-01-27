// (C) 2024-2026 GoodData Corporation

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { SemanticSearch } from "../SemanticSearch.js";

vi.mock("../permissions/utils.js", () => ({
    emptyWorkspacePermissions: vi.fn(() => ({
        canManageProject: true,
    })),
}));

const backend = dummyBackend();

describe("SemanticSearch component", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const DEBOUNCE_TIME = 300;
    const SEARCH_REQUEST_DELAY = 100;

    const WITH_DEBOUNCE = 1;
    const WITH_RESULTS = 2;

    // 1. Render the SemanticSearch
    // 2. input "test" into the search input
    // 3. wait for the debounce/loading time
    const renderAndType = async (state: number) => {
        const callback = vi.fn();
        const { baseElement, debug } = render(
            <SemanticSearch backend={backend} workspace="test" onSelect={callback} />,
        );

        const input = baseElement.querySelector("input");
        expect(input).not.toBe(null);
        fireEvent.focus(input!);
        fireEvent.input(input!, { target: { value: "test" } });

        if (state & WITH_DEBOUNCE) {
            await act(() => vi.advanceTimersByTimeAsync(DEBOUNCE_TIME));
        }

        if (state & WITH_RESULTS) {
            await act(() => vi.advanceTimersByTimeAsync(SEARCH_REQUEST_DELAY));
        }

        return { baseElement, callback, debug };
    };

    it("should display loading after debounce time", async () => {
        await renderAndType(WITH_DEBOUNCE);

        const loader = screen.getByLabelText("loading");
        expect(loader).toBeVisible();
    });

    it("should display results", async () => {
        await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        const items = screen.getAllByRole("treeitem");
        expect(items).toHaveLength(8);
    });

    it("should let user select item by clicking on it", async () => {
        const { baseElement, callback } = await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        const firstItem = baseElement.querySelector(".gd-semantic-search__results-item__content");
        fireEvent.click(firstItem!);

        expect(callback).toHaveBeenCalledOnce();
    });

    it("should auto-select first result", async () => {
        await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        const [firstItem] = screen.getAllByRole("treeitem");
        expect(firstItem).toHaveAttribute("aria-selected", "true");
    });

    it("should allow user to select with Enter key", async () => {
        const { callback } = await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        const input = screen.getByRole("combobox");
        fireEvent.keyDown(input, { code: "Enter" });

        expect(callback).toHaveBeenCalledOnce();
    });

    it("should let user navigate with keyboard", async () => {
        await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        const input = screen.getByRole("combobox");

        // down -> down -> up = 2nd item should be selected
        fireEvent.keyDown(input, { code: "ArrowDown" });
        fireEvent.keyDown(input, { code: "ArrowDown" });
        fireEvent.keyDown(input, { code: "ArrowUp" });

        const allItems = screen.getAllByRole("treeitem");
        expect(allItems[1]).toHaveAttribute("aria-selected", "true");
    });

    it("exposes correct ARIA attributes on input", () => {
        const placeholder = "Testing placeholder";

        render(
            <SemanticSearch
                backend={backend}
                workspace="test"
                placeholder={placeholder}
                onSelect={vi.fn()}
            />,
        );

        const input = screen.getByRole("combobox");
        expect(input).toBeVisible();
        expect(input).toHaveAccessibleName(expect.any(String));
        expect(input).toHaveAttribute("id", expect.stringContaining("input"));
        expect(input).toHaveAttribute("aria-controls", expect.stringContaining("treeview"));
        expect(input).toHaveAttribute("aria-expanded", "false");
        expect(input).toHaveAttribute("aria-autocomplete", "list");
        expect(input).not.toHaveAttribute("aria-activedescendant");

        // Aria-label and placeholder should be the same
        expect(input).toHaveAttribute("placeholder", placeholder);
        expect(input).toHaveAttribute("aria-label", placeholder);
    });

    it("sets aria-activedescendant when navigating with keyboard", async () => {
        await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        const input = screen.getByRole("combobox");
        const treeViewId = input.getAttribute("aria-controls")!;
        expect(input).toHaveAttribute("aria-expanded", "true");

        const tree = screen.getByRole("tree");
        expect(tree).toBeVisible();
        expect(tree).toHaveAttribute("id", treeViewId);

        const getActiveDescendant = () => input.getAttribute("aria-activedescendant")!;
        const getSelectedItem = () => screen.getByRole("treeitem", { selected: true });

        expect(getActiveDescendant()).toBe(`${treeViewId}/0`);
        expect(getSelectedItem()).toHaveAttribute("id", `${treeViewId}/0`);

        fireEvent.keyDown(input, { code: "ArrowDown" });

        expect(getActiveDescendant()).toBe(`${treeViewId}/1`);
        expect(getSelectedItem()).toHaveAttribute("id", `${treeViewId}/1`);
    });
});

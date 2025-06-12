// (C) 2024-2025 GoodData Corporation

import * as React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { SemanticSearch } from "../SemanticSearch.js";

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
        fireEvent.focus(input);
        fireEvent.input(input, { target: { value: "test" } });

        if (state & WITH_DEBOUNCE) {
            await act(() => vi.advanceTimersByTimeAsync(DEBOUNCE_TIME));
        }

        if (state & WITH_RESULTS) {
            await act(() => vi.advanceTimersByTimeAsync(SEARCH_REQUEST_DELAY));
        }

        return { baseElement, callback, debug };
    };

    it("should display loading after debounce time", async () => {
        const { baseElement } = await renderAndType(WITH_DEBOUNCE);

        expect(baseElement.querySelector('[aria-label="loading"]')).not.toBe(null);
    });

    it("should display results", async () => {
        const { baseElement } = await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        expect(baseElement.querySelectorAll(".gd-semantic-search__results-item").length).toBe(8);
    });

    it("should let user select item by clicking on it", async () => {
        const { baseElement, callback } = await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        const firstItem = baseElement.querySelector(".gd-semantic-search__results-item__content");
        fireEvent.click(firstItem);

        expect(callback).toHaveBeenCalledOnce();
    });

    it("should auto-select first result", async () => {
        const { baseElement } = await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        const firstItem = baseElement.querySelector(".gd-semantic-search__results-item");
        expect(firstItem.className).to.include("gd-semantic-search__results-item--active");
    });

    it("should allow user to select with Enter key", async () => {
        const { baseElement, callback } = await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        fireEvent.keyDown(baseElement, { key: "Enter" });

        expect(callback).toHaveBeenCalledOnce();
    });

    it("should let user navigate with keyboard", async () => {
        const { baseElement } = await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        // down -> down -> up = 2nd item should be selected
        fireEvent.keyDown(baseElement, { key: "ArrowDown" });
        fireEvent.keyDown(baseElement, { key: "ArrowDown" });
        fireEvent.keyDown(baseElement, { key: "ArrowUp" });

        const secondItem = baseElement.querySelectorAll(".gd-semantic-search__results-item")[1];
        expect(secondItem.className).to.include("gd-semantic-search__results-item--active");
    });
});

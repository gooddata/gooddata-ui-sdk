// (C) 2024-2025 GoodData Corporation

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IntlProvider } from "react-intl";
import { SemanticSearch } from "../SemanticSearch.js";

// Mock messages for tests
const messages = {
    "semantic-search.id": "ID",
    "semantic-search.match": "{score}% match",
    "semantic-search.tags": "Tags",
};

// Mock the IntlWrapper to avoid async issues
vi.mock("../localization/IntlWrapper.js", () => ({
    IntlWrapper: ({ children }: { children: React.ReactNode }) => (
        <IntlProvider locale="en-US" messages={messages}>
            {children}
        </IntlProvider>
    ),
}));

const backend = dummyBackend();

describe("SemanticSearch component", () => {
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

        const input = baseElement.querySelector("input")!;
        expect(input).not.toBe(null);
        fireEvent.focus(input);
        fireEvent.input(input, { target: { value: "test" } });

        if (state & WITH_DEBOUNCE) {
            // Wait for loading state to appear
            await waitFor(
                () => {
                    expect(baseElement.querySelector('[aria-label="loading"]')).not.toBe(null);
                },
                { timeout: DEBOUNCE_TIME + 100 },
            );
        }

        if (state & WITH_RESULTS) {
            // Wait for results to appear
            await waitFor(
                () => {
                    expect(
                        baseElement.querySelectorAll(".gd-semantic-search__results-item").length,
                    ).toBeGreaterThan(0);
                },
                { timeout: SEARCH_REQUEST_DELAY + 200 },
            );
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

        const firstItem = baseElement.querySelector(".gd-semantic-search__results-item__content")!;
        fireEvent.click(firstItem);

        expect(callback).toHaveBeenCalledOnce();
    });

    it("should auto-select first result", async () => {
        const { baseElement } = await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        const firstItem = baseElement.querySelector(".gd-semantic-search__results-item")!;
        expect(firstItem.className).to.include("gd-semantic-search__results-item--active");
    });

    it("should allow user to select with Enter key", async () => {
        const { baseElement, callback } = await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        // Wait for results to be rendered
        await waitFor(() => {
            const items = baseElement.querySelectorAll(".gd-semantic-search__results-item");
            expect(items.length).toBe(8);
        });

        // Fire Enter key on document (where the listener is attached)
        fireEvent.keyDown(document, { key: "Enter" });

        expect(callback).toHaveBeenCalledOnce();
    });

    it("should let user navigate with keyboard", async () => {
        const { baseElement } = await renderAndType(WITH_DEBOUNCE | WITH_RESULTS);

        // Wait for results to be fully rendered and first item to be active
        await waitFor(() => {
            const items = baseElement.querySelectorAll(".gd-semantic-search__results-item");
            expect(items.length).toBe(8);
            expect(items[0].className).to.include("gd-semantic-search__results-item--active");
        });

        // Test basic navigation - just one down arrow
        fireEvent.keyDown(document, { key: "ArrowDown" });

        // Give it a moment to update
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Check if second item is now active
        const items = baseElement.querySelectorAll(".gd-semantic-search__results-item");
        expect(items[1].className).to.include("gd-semantic-search__results-item--active");
    });
});

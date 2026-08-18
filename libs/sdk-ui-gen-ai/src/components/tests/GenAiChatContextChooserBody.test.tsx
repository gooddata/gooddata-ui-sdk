// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { fireEvent, render, screen, within } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const kit = (await importOriginal()) as Record<string, unknown>;

    function MockUiPagedVirtualList<T>({
        items,
        children,
        listboxProps,
        onKeyDownConfirm,
        isLoading,
        hasNextPage,
        skeletonItemsCount,
    }: {
        items?: T[];
        children: (item: T, index?: number) => ReactNode;
        listboxProps?: Record<string, unknown>;
        onKeyDownConfirm?: (item: T) => void;
        isLoading?: boolean;
        hasNextPage?: boolean;
        skeletonItemsCount?: number;
    }) {
        if (isLoading) {
            return <div data-testid="context-chooser-loading" />;
        }

        return (
            <ul
                role="listbox"
                data-testid="context-chooser-paged-list"
                data-has-next-page={hasNextPage}
                data-skeleton-count={skeletonItemsCount}
                {...listboxProps}
            >
                {items?.map((item, index) => (
                    <li
                        key={index}
                        role="option"
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                onKeyDownConfirm?.(item);
                            }
                        }}
                    >
                        {children(item, index)}
                    </li>
                ))}
            </ul>
        );
    }

    return {
        ...kit,
        UiPagedVirtualList: MockUiPagedVirtualList,
    };
});

import { type IGenAIContextObject } from "../../types.js";
import { GenAiChatContextChooserBody } from "../GenAiChatContextChooserBody.js";

const SEARCH_FIELD_VISIBILITY_THRESHOLD = 7;

const messages = {
    "gd.gen-ai.context.add_context": "Add context",
    "gd.gen-ai.context.close": "Close add context",
    "gd.gen-ai.context.list.ariaLabel": "Available context items",
    "gd.gen-ai.context.search.placeholder": "Search...",
    "gd.gen-ai.context.search.ariaLabel": "Search context items",
    "gd.gen-ai.context.noMatchingData": "No matching items",
    "gd.gen-ai.context.noDataAvailable": "No items available",
    "search.results.few": "{count} results",
};

function createItem(
    id: string,
    title: string,
    type: IGenAIContextObject["type"] = "widget",
): IGenAIContextObject {
    return {
        id,
        ref: { identifier: id, type: "insight" },
        title,
        nesting: type === "dashboard" ? 0 : 1,
        type,
        where: type === "dashboard" ? "view.dashboard" : "referencedObjects",
    };
}

function renderBody(
    inputItems: IGenAIContextObject[],
    onSelect = vi.fn(),
    {
        isLoading = false,
        hasNextPage = false,
        loadNextPage = vi.fn(),
    }: {
        isLoading?: boolean;
        hasNextPage?: boolean;
        loadNextPage?: () => void;
    } = {},
) {
    const closeDropdown = vi.fn();

    render(
        <IntlProvider locale="en" messages={messages}>
            <GenAiChatContextChooserBody
                inputItems={inputItems}
                title="Add context"
                titleId="context-chooser-title"
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                loadNextPage={loadNextPage}
                ariaAttributes={{ id: "context-chooser-dialog", role: "dialog" }}
                onSelect={onSelect}
                closeDropdown={closeDropdown}
            />
        </IntlProvider>,
    );

    return { onSelect, closeDropdown, loadNextPage };
}

describe("GenAiChatContextChooserBody", () => {
    it("renders header with close button and available items", () => {
        const { closeDropdown } = renderBody([
            createItem("dashboard-1", "Revenue Dashboard", "dashboard"),
            createItem("widget-1", "Sales Chart"),
        ]);

        expect(screen.getByRole("heading", { name: "Add context" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Close add context" })).toBeInTheDocument();
        expect(screen.getByText("Revenue Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Sales Chart")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Close add context" }));
        expect(closeDropdown).toHaveBeenCalled();
    });

    it("uses listbox with option roles", () => {
        renderBody([createItem("widget-1", "Sales Chart")]);

        const listbox = screen.getByRole("listbox", { name: "Available context items" });
        expect(listbox).toBeInTheDocument();
        expect(within(listbox).getAllByRole("option")).toHaveLength(1);
    });

    it("does not render search when item count is at or below the threshold", () => {
        renderBody(
            Array.from({ length: SEARCH_FIELD_VISIBILITY_THRESHOLD }, (_, index) =>
                createItem(`item-${index}`, `Item ${index}`),
            ),
        );

        expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    });

    it("renders search when item count exceeds the threshold", () => {
        renderBody(
            Array.from({ length: SEARCH_FIELD_VISIBILITY_THRESHOLD + 1 }, (_, index) =>
                createItem(`item-${index}`, `Item ${index}`),
            ),
        );

        const searchbox = screen.getByRole("searchbox", { name: "Search context items" });
        expect(searchbox).toBeInTheDocument();
        expect(searchbox).toHaveAttribute("aria-controls");
        expect(searchbox).toHaveAttribute("placeholder", "Search...");
    });

    it("keeps search rendered while a follow-up page is loading", () => {
        renderBody(
            Array.from({ length: SEARCH_FIELD_VISIBILITY_THRESHOLD + 1 }, (_, index) =>
                createItem(`item-${index}`, `Item ${index}`),
            ),
            vi.fn(),
            { isLoading: true },
        );

        expect(screen.getByRole("searchbox", { name: "Search context items" })).toBeInTheDocument();
        expect(screen.getByTestId("context-chooser-loading")).toBeInTheDocument();
    });

    it("does not render search while the initial load has produced no items yet", () => {
        renderBody([], vi.fn(), { isLoading: true });

        expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
        expect(screen.getByTestId("context-chooser-loading")).toBeInTheDocument();
    });

    it("filters items by search query", () => {
        renderBody([
            ...Array.from({ length: SEARCH_FIELD_VISIBILITY_THRESHOLD }, (_, index) =>
                createItem(`item-${index}`, `Item ${index}`),
            ),
            createItem("target", "Unique Target Widget"),
        ]);

        fireEvent.change(screen.getByRole("searchbox"), { target: { value: "unique target" } });

        expect(screen.getByText("Unique Target Widget")).toBeInTheDocument();
        expect(screen.queryByText("Item 0")).not.toBeInTheDocument();
    });

    it("selects an item on click", () => {
        const item = createItem("widget-1", "Sales Chart");
        const onSelect = vi.fn();

        renderBody([item], onSelect);

        fireEvent.click(screen.getByText("Sales Chart"));

        expect(onSelect).toHaveBeenCalledWith(item);
    });

    it("keeps the paged list mounted when the current page has no selectable items but another page is available", () => {
        renderBody([], vi.fn(), { hasNextPage: true });

        expect(screen.queryByText("No items available")).not.toBeInTheDocument();
        expect(screen.getByTestId("context-chooser-paged-list")).toHaveAttribute(
            "data-has-next-page",
            "true",
        );
        expect(screen.getByTestId("context-chooser-paged-list")).toHaveAttribute("data-skeleton-count", "3");
    });

    it("shows no-data when there are no items and no further pages", () => {
        renderBody([], vi.fn(), { hasNextPage: false });

        expect(screen.getByText("No items available")).toBeInTheDocument();
        expect(screen.queryByTestId("context-chooser-paged-list")).not.toBeInTheDocument();
    });
});

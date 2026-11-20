// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { semanticSearchItem } from "./automation/testIds.js";
import { SearchItem, type SearchItemProps } from "./SearchItem.js";

function renderSearchItem(overrides: Partial<SearchItemProps> = {}) {
    const props: SearchItemProps = {
        children: "Revenue",
        level: 1,
        icon: <span>Metric icon</span>,
        details: <span>Item details</span>,
        resultCounter: <span>3 results</span>,
        href: "/metrics/revenue",
        isFocused: true,
        ariaAttributes: { id: "revenue", role: "treeitem", "aria-label": "Revenue, metric" },
        onClick: vi.fn(),
        onHover: vi.fn(),
        ...overrides,
    };

    return { ...render(<SearchItem {...props} />), props };
}

describe("SearchItem", () => {
    it("is interactive by default, preserving the link, active appearance, hover and details", () => {
        const { props } = renderSearchItem();
        const item = screen.getByRole("treeitem", { name: "Revenue, metric" });

        expect(item.tagName).toBe("A");
        expect(item).toHaveAttribute("href", "/metrics/revenue");
        expect(item).toHaveAttribute("tabindex", "-1");
        expect(screen.getByTestId(semanticSearchItem)).toHaveClass(
            "gd-semantic-search__results-item--active",
        );
        expect(screen.getByTestId(semanticSearchItem)).not.toHaveClass(
            "gd-semantic-search__results-item--inactive",
        );
        expect(screen.getByText("Item details")).toBeInTheDocument();

        fireEvent.mouseEnter(item);

        expect(props.onHover).toHaveBeenCalledOnce();
    });

    it.each([
        ["left", "click", { button: 0 }],
        ["Ctrl", "click", { button: 0, ctrlKey: true }],
        ["Meta", "click", { button: 0, metaKey: true }],
        ["Shift", "click", { button: 0, shiftKey: true }],
        ["Alt", "click", { button: 0, altKey: true }],
        ["middle", "auxClick", { button: 1 }],
    ] as const)("reports %s clicks for interactive items", (_name, event, options) => {
        const { props } = renderSearchItem();

        fireEvent(
            screen.getByRole("treeitem"),
            new MouseEvent(event.toLowerCase(), { bubbles: true, cancelable: true, ...options }),
        );

        expect(props.onClick).toHaveBeenCalledExactlyOnceWith(expect.objectContaining(options));
    });

    it.each([undefined, false])("does not report right clicks when isInteractive=%s", (isInteractive) => {
        const { props } = renderSearchItem({ isInteractive });

        fireEvent(screen.getByRole("treeitem"), new MouseEvent("auxclick", { bubbles: true, button: 2 }));

        expect(props.onClick).not.toHaveBeenCalled();
    });

    it("keeps groups without a URL interactive by default", () => {
        const { props } = renderSearchItem({ href: undefined });
        const item = screen.getByRole("treeitem");

        expect(item.tagName).toBe("DIV");
        fireEvent.click(item);

        expect(props.onClick).toHaveBeenCalledOnce();
    });

    it.each([
        ["unfocused", { isFocused: false }],
        ["nested", { level: 2 }],
    ])("does not show details for %s items", (_name, props) => {
        renderSearchItem(props);

        expect(screen.queryByText("Item details")).not.toBeInTheDocument();
    });

    it.each([false, true])("renders inactive content without an anchor when focused=%s", (isFocused) => {
        renderSearchItem({ isInteractive: false, isFocused });
        const item = screen.getByRole("treeitem", { name: "Revenue, metric" });
        const wrapper = screen.getByTestId(semanticSearchItem);

        expect(item.tagName).toBe("DIV");
        expect(item).not.toHaveAttribute("href");
        expect(wrapper.querySelector("a")).toBeNull();
        expect(wrapper).toHaveClass("gd-semantic-search__results-item--inactive");
        expect(wrapper.classList.contains("gd-semantic-search__results-item--active")).toBe(isFocused);
        expect(wrapper).toHaveAttribute("data-level", "1");
        expect(screen.getByText("Revenue")).toBeInTheDocument();
        expect(screen.getByText("Metric icon")).toBeInTheDocument();
        expect(screen.getByText("3 results")).toBeInTheDocument();
        expect(screen.queryByText("Item details") !== null).toBe(isFocused);
    });

    it.each([
        ["left", "click", { button: 0 }],
        ["Ctrl", "click", { button: 0, ctrlKey: true }],
        ["Meta", "click", { button: 0, metaKey: true }],
        ["Shift", "click", { button: 0, shiftKey: true }],
        ["Alt", "click", { button: 0, altKey: true }],
        ["middle", "auxClick", { button: 1 }],
        ["modified middle", "auxClick", { button: 1, ctrlKey: true, shiftKey: true }],
    ] as const)("preserves %s click and hover handlers for inactive items", (_name, event, options) => {
        const { props } = renderSearchItem({ isInteractive: false });
        const item = screen.getByRole("treeitem");

        fireEvent(item, new MouseEvent(event.toLowerCase(), { bubbles: true, cancelable: true, ...options }));
        fireEvent.mouseEnter(item);

        expect(props.onClick).toHaveBeenCalledExactlyOnceWith(expect.objectContaining(options));
        expect(props.onHover).toHaveBeenCalledOnce();
    });
});

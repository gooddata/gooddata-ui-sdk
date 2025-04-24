// (C) 2025 GoodData Corporation

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import cx from "classnames";
import { UiListbox } from "../UiListbox.js";
import { describe, it, expect, vi } from "vitest";
import { e, b } from "../listboxBem.js";
import { makeSeparatorItem } from "../defaults/DefaultUiListboxItemComponent.js";
import { IUiListboxItem, UiListboxItemProps } from "../types";

describe("UiListbox", () => {
    const mockItems: IUiListboxItem<string>[] = [
        { id: "item1", stringTitle: "Item 1", data: "data1" },
        { id: "item2", stringTitle: "Item 2", data: "data2" },
        { id: "item3", stringTitle: "Item 3", isDisabled: true, data: "data3" },
        { id: "item4", stringTitle: "Item 4", data: "data4" },
    ];

    const renderListbox = (props = {}) => {
        const defaultAriaAttributes = {
            id: "test-dropdown-list",
            "aria-labelledby": "test-dropdown-button",
            role: "listbox" as const,
        };

        return render(
            <UiListbox
                items={mockItems}
                onSelect={vi.fn()}
                onClose={vi.fn()}
                ariaAttributes={defaultAriaAttributes}
                {...props}
            />,
        );
    };

    it("should render all items", () => {
        renderListbox();

        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Item 2")).toBeInTheDocument();
        expect(screen.getByText("Item 3")).toBeInTheDocument();
        expect(screen.getByText("Item 4")).toBeInTheDocument();
    });

    it("should mark selected item", () => {
        renderListbox({ selectedItemId: "item2" });

        const selectedItemLi = screen.getByText("Item 2").closest("li");
        const selectedItemDiv = screen.getByText("Item 2").closest("div");

        expect(selectedItemLi).toHaveAttribute("aria-selected", "true");
        expect(selectedItemDiv).toHaveClass(e("item", { isSelected: true }));
    });

    it("should mark disabled item", () => {
        renderListbox();

        const disabledItemLi = screen.getByText("Item 3").closest("li");
        const disabledItemDiv = screen.getByText("Item 3").closest("div");

        expect(disabledItemLi).toHaveAttribute("aria-disabled", "true");
        expect(disabledItemDiv).toHaveClass(e("item", { isDisabled: true }));
    });

    it("should call onSelect when item is clicked", () => {
        const onSelect = vi.fn();
        renderListbox({ onSelect });

        fireEvent.click(screen.getByText("Item 1"));

        expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
    });

    it("should not call onSelect when disabled item is clicked", () => {
        const onSelect = vi.fn();
        renderListbox({ onSelect });

        fireEvent.click(screen.getByText("Item 3"));

        expect(onSelect).not.toHaveBeenCalled();
    });

    it("should navigate with keyboard", () => {
        renderListbox();

        const listbox = screen.getByRole("listbox");

        // Initial focus is on first item
        expect(screen.getByText("Item 1").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Navigate down
        fireEvent.keyDown(listbox, { code: "ArrowDown" });
        expect(screen.getByText("Item 2").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Skip disabled item
        fireEvent.keyDown(listbox, { code: "ArrowDown" });
        expect(screen.getByText("Item 4").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Navigate up
        fireEvent.keyDown(listbox, { code: "ArrowUp" });
        expect(screen.getByText("Item 2").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Navigate to end
        fireEvent.keyDown(listbox, { code: "End" });
        expect(screen.getByText("Item 4").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Navigate to home
        fireEvent.keyDown(listbox, { code: "Home" });
        expect(screen.getByText("Item 1").closest("div")).toHaveClass(e("item", { isFocused: true }));
    });

    it("should select with Enter key", () => {
        const onSelect = vi.fn();
        renderListbox({ onSelect });

        const listbox = screen.getByRole("listbox");

        // Navigate to second item
        fireEvent.keyDown(listbox, { code: "ArrowDown" });

        // Select with Enter
        fireEvent.keyDown(listbox, { code: "Enter" });

        expect(onSelect).toHaveBeenCalledWith(mockItems[1]);
    });

    it("should select with Space key", () => {
        const onSelect = vi.fn();
        renderListbox({ onSelect });

        const listbox = screen.getByRole("listbox");

        // Navigate to second item
        fireEvent.keyDown(listbox, { code: "ArrowDown" });

        // Select with Space
        fireEvent.keyDown(listbox, { code: "Space" });

        expect(onSelect).toHaveBeenCalledWith(mockItems[1]);
    });

    it("should close with Escape key", () => {
        const onClose = vi.fn();
        renderListbox({ onClose });

        const listbox = screen.getByRole("listbox");

        // Press Escape
        fireEvent.keyDown(listbox, { code: "Escape" });

        expect(onClose).toHaveBeenCalled();
    });

    it("should navigate with character search", () => {
        const items: IUiListboxItem<string>[] = [
            { id: "apple", stringTitle: "Apple", data: "apple-data" },
            { id: "banana", stringTitle: "Banana", data: "banana-data" },
            { id: "cherry", stringTitle: "Cherry", data: "cherry-data" },
            { id: "date", stringTitle: "Date", data: "date-data" },
        ];

        renderListbox({ items });

        const listbox = screen.getByRole("listbox");

        // Type 'b' to navigate to Banana
        fireEvent.keyDown(listbox, { key: "b" });
        expect(screen.getByText("Banana").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Type 'd' to navigate to Date
        fireEvent.keyDown(listbox, { key: "d" });
        expect(screen.getByText("Date").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Type 'a' to navigate to Apple (wrapping around)
        fireEvent.keyDown(listbox, { key: "a" });
        expect(screen.getByText("Apple").closest("div")).toHaveClass(e("item", { isFocused: true }));
    });

    it("should rotate through items that start with the same letter when that letter keeps getting pressed", () => {
        const items: IUiListboxItem<string>[] = [
            { id: "apple", stringTitle: "Apple", data: "apple-data" },
            { id: "apricot", stringTitle: "Apricot", data: "apricot-data" },
            { id: "avocado", stringTitle: "Avocado", data: "avocado-data" },
            { id: "banana", stringTitle: "Banana", data: "banana-data" },
            { id: "blueberry", stringTitle: "Blueberry", data: "blueberry-data" },
        ];

        renderListbox({ items });

        const listbox = screen.getByRole("listbox");

        // Initially focused on Apple
        expect(screen.getByText("Apple").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Press 'a' to navigate to the next 'a' item (Apricot)
        fireEvent.keyDown(listbox, { key: "a" });
        expect(screen.getByText("Apricot").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Press 'a' again to navigate to the next 'a' item (Avocado)
        fireEvent.keyDown(listbox, { key: "a" });
        expect(screen.getByText("Avocado").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Press 'a' again to wrap around to the first 'a' item (Apple)
        fireEvent.keyDown(listbox, { key: "a" });
        expect(screen.getByText("Apple").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Press 'b' to navigate to the first 'b' item (Banana)
        fireEvent.keyDown(listbox, { key: "b" });
        expect(screen.getByText("Banana").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Press 'b' again to navigate to the next 'b' item (Blueberry)
        fireEvent.keyDown(listbox, { key: "b" });
        expect(screen.getByText("Blueberry").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Press 'b' again to wrap around to the first 'b' item (Banana)
        fireEvent.keyDown(listbox, { key: "b" });
        expect(screen.getByText("Banana").closest("div")).toHaveClass(e("item", { isFocused: true }));
    });

    it("should update aria-activedescendant when navigating", () => {
        renderListbox();

        const listbox = screen.getByRole("listbox");

        // Initial focus is on first item
        expect(listbox).toHaveAttribute("aria-activedescendant", expect.stringContaining(mockItems[0].id));

        // Navigate down
        fireEvent.keyDown(listbox, { code: "ArrowDown" });
        expect(listbox).toHaveAttribute("aria-activedescendant", expect.stringContaining(mockItems[1].id));
    });

    it("should call onClose after selection", () => {
        const onSelect = vi.fn();
        const onClose = vi.fn();
        renderListbox({ onSelect, onClose });

        // Click on an item
        fireEvent.click(screen.getByText("Item 1"));

        expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
        expect(onClose).toHaveBeenCalled();
    });

    it("should render with custom ItemComponent", () => {
        const CustomItemComponent = ({
            item,
            isSelected,
            isFocused,
            onSelect,
        }: UiListboxItemProps<string>) => (
            <div
                className={cx("custom-item", {
                    "custom-selected": isSelected,
                    "custom-focused": isFocused,
                    "custom-disabled": item.isDisabled,
                })}
                onClick={item.isDisabled ? undefined : onSelect}
                data-testid="custom-item"
            >
                {item.stringTitle} - {item.data}
            </div>
        );

        renderListbox({
            ItemComponent: CustomItemComponent,
            selectedItemId: "item1",
        });

        // Check that custom component is rendered
        const customItems = screen.getAllByTestId("custom-item");
        expect(customItems.length).toBe(mockItems.length);

        // Check that selected item has custom class
        expect(screen.getByText("Item 1 - data1")).toHaveClass("custom-selected");
    });

    it("should render separator items correctly", () => {
        const separatorItem = makeSeparatorItem();
        const itemsWithSeparator: IUiListboxItem<any>[] = [mockItems[0], separatorItem, mockItems[1]];

        renderListbox({ items: itemsWithSeparator });

        // Check that separator is rendered
        const separators = document.querySelectorAll(".gd-list-item-separator");
        expect(separators.length).toBe(1);

        // Check that regular items are still rendered
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Item 2")).toBeInTheDocument();
    });

    it("should skip separator items when navigating with keyboard", () => {
        const separatorItem = makeSeparatorItem();
        const itemsWithSeparator: IUiListboxItem<any>[] = [mockItems[0], separatorItem, mockItems[1]];

        renderListbox({ items: itemsWithSeparator });

        const listbox = screen.getByRole("listbox");

        // Initial focus is on first item
        expect(screen.getByText("Item 1").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Navigate down should skip separator and go to Item 2
        fireEvent.keyDown(listbox, { code: "ArrowDown" });
        expect(screen.getByText("Item 2").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Navigate up should skip separator and go back to Item 1
        fireEvent.keyDown(listbox, { code: "ArrowUp" });
        expect(screen.getByText("Item 1").closest("div")).toHaveClass(e("item", { isFocused: true }));
    });

    it("should apply maxWidth style when provided", () => {
        const maxWidth = 300;
        renderListbox({ maxWidth });

        const listboxContainer = document.querySelector(`.${b()}`);
        expect(listboxContainer).toHaveStyle({ maxWidth: `${maxWidth}px` });
    });

    it("should call onUnhandledKeyDown for unhandled key events", () => {
        const onUnhandledKeyDown = vi.fn();
        renderListbox({ onUnhandledKeyDown });

        const listbox = screen.getByRole("listbox");

        // Press a character key
        fireEvent.keyDown(listbox, { key: "a" });

        expect(onUnhandledKeyDown).toHaveBeenCalled();
        expect(onUnhandledKeyDown.mock.calls[0][0].key).toBe("a");
        expect(onUnhandledKeyDown.mock.calls[0][1]).toHaveProperty("items", mockItems);
    });

    it("should handle keyboard navigation at list boundaries", () => {
        renderListbox();

        const listbox = screen.getByRole("listbox");

        // Initial focus is on first item
        expect(screen.getByText("Item 1").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Try to navigate up from first item (should stay on first item)
        fireEvent.keyDown(listbox, { code: "ArrowUp" });
        expect(screen.getByText("Item 1").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Navigate to last item
        fireEvent.keyDown(listbox, { code: "End" });
        expect(screen.getByText("Item 4").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Try to navigate down from last item (should stay on last item)
        fireEvent.keyDown(listbox, { code: "ArrowDown" });
        expect(screen.getByText("Item 4").closest("div")).toHaveClass(e("item", { isFocused: true }));
    });

    it("should handle disabled items at list boundaries", () => {
        const itemsWithDisabledEnds: IUiListboxItem<string>[] = [
            { id: "item1", stringTitle: "Item 1", isDisabled: true, data: "data1" },
            { id: "item2", stringTitle: "Item 2", data: "data2" },
            { id: "item3", stringTitle: "Item 3", data: "data3" },
            { id: "item4", stringTitle: "Item 4", isDisabled: true, data: "data4" },
        ];

        renderListbox({ items: itemsWithDisabledEnds });

        const listbox = screen.getByRole("listbox");

        // Initial focus should be on first non-disabled item (Item 2)
        expect(screen.getByText("Item 2").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Navigate to last non-disabled item
        fireEvent.keyDown(listbox, { code: "End" });
        expect(screen.getByText("Item 3").closest("div")).toHaveClass(e("item", { isFocused: true }));
    });

    it("should handle character search with disabled items", () => {
        const items: IUiListboxItem<string>[] = [
            { id: "apple", stringTitle: "Apple", data: "apple-data" },
            { id: "apricot", stringTitle: "Apricot", isDisabled: true, data: "apricot-data" },
            { id: "banana", stringTitle: "Banana", data: "banana-data" },
        ];

        renderListbox({ items });

        const listbox = screen.getByRole("listbox");

        // Type 'a' to navigate to Apple
        fireEvent.keyDown(listbox, { key: "a" });
        expect(screen.getByText("Apple").closest("div")).toHaveClass(e("item", { isFocused: true }));

        // Type 'a' again - should skip disabled Apricot and not change focus
        fireEvent.keyDown(listbox, { key: "a" });
        expect(screen.getByText("Apple").closest("div")).toHaveClass(e("item", { isFocused: true }));
    });

    it("should maintain proper aria attributes", () => {
        renderListbox();

        const listbox = screen.getByRole("listbox");

        // Check that listbox has proper ARIA attributes
        expect(listbox).toHaveAttribute("id", "test-dropdown-list");
        expect(listbox).toHaveAttribute("aria-labelledby", "test-dropdown-button");
        expect(listbox).toHaveAttribute("role", "listbox");

        // Check that items have proper ARIA attributes
        const items = screen.getAllByRole("option");
        expect(items.length).toBe(mockItems.length);

        // First item should have aria-selected="false" by default
        expect(items[0]).toHaveAttribute("aria-selected", "false");

        // Disabled item should have aria-disabled="true"
        expect(items[2]).toHaveAttribute("aria-disabled", "true");
    });
});

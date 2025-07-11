// (C) 2025 GoodData Corporation

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import cx from "classnames";
import { IntlProvider } from "react-intl";
import { pickCorrectWording, messagesMap } from "@gooddata/sdk-ui";
import { UiMenu } from "../UiMenu.js";
import { describe, it, expect, vi } from "vitest";
import { e, b } from "../menuBem.js";
import { IUiMenuItem, IUiMenuInteractiveItemProps, IUiMenuStaticItemProps, IUiMenuProps } from "../types.js";
import { typedUiMenuContextStore } from "../context.js";

describe("UiMenu", () => {
    const mockItems: IUiMenuItem[] = [
        { type: "interactive", id: "item1", stringTitle: "Item 1", data: "data1" },
        { type: "interactive", id: "item2", stringTitle: "Item 2", data: "data2" },
        { type: "interactive", id: "item3", stringTitle: "Item 3", isDisabled: true, data: "data3" },
        { type: "static", id: "static1", data: "Static Item 1" },
        {
            type: "interactive",
            id: "item4",
            stringTitle: "Item 4",
            data: "data4",
            subItems: [
                { type: "interactive", id: "subitem1", stringTitle: "SubItem 1", data: "subdata1" },
                { type: "static", id: "substatic1", data: "SubStatic Item 1" },
                { type: "interactive", id: "subitem2", stringTitle: "SubItem 2", data: "subdata2" },
            ],
        },
        {
            type: "group",
            id: "group1",
            stringTitle: "Group 1",
            data: "Group title",
            subItems: [
                { type: "interactive", id: "groupitem1", stringTitle: "Group Item 1", data: "groupdata1" },
                { type: "interactive", id: "groupitem2", stringTitle: "Group Item 2", data: "groupdata2" },
            ],
        },
    ];

    const DefaultLocale = "en-US";

    const messages = pickCorrectWording(messagesMap[DefaultLocale], {
        workspace: "mockWorkspace",
        enableRenamingMeasureToMetric: true,
    });

    const renderMenu = (props: Partial<IUiMenuProps> = {}) => {
        const defaultAriaAttributes = {
            id: "test-dropdown-menu",
            "aria-labelledby": "test-dropdown-button",
            role: "menu" as const,
        };

        return render(
            <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={messages}>
                <UiMenu
                    items={mockItems}
                    onSelect={vi.fn()}
                    onClose={vi.fn()}
                    ariaAttributes={defaultAriaAttributes}
                    {...props}
                />
            </IntlProvider>,
        );
    };

    it("should render all top-level items", () => {
        renderMenu();

        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Item 2")).toBeInTheDocument();
        expect(screen.getByText("Item 3")).toBeInTheDocument();
        expect(screen.getByText("Static Item 1")).toBeInTheDocument();
        expect(screen.getByText("Item 4")).toBeInTheDocument();
    });

    it("should mark disabled item", () => {
        renderMenu();

        const disabledItemLi = screen.getByText("Item 3").closest("li");

        expect(disabledItemLi).toHaveAttribute("aria-disabled", "true");
    });

    it("should call onSelect when item is clicked", () => {
        const onSelect = vi.fn();
        renderMenu({ onSelect });

        fireEvent.click(screen.getByText("Item 1"));

        expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
    });

    it("should not call onSelect when disabled item is clicked", () => {
        const onSelect = vi.fn();
        renderMenu({ onSelect });

        fireEvent.click(screen.getByText("Item 3"));

        expect(onSelect).not.toHaveBeenCalled();
    });

    it("should navigate with keyboard", () => {
        renderMenu();

        const menu = screen.getByRole("menu");

        // Initial focus is on first item
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("item1"));

        // Navigate down
        fireEvent.keyDown(menu, { code: "ArrowDown" });
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("item2"));

        // Navigate up
        fireEvent.keyDown(menu, { code: "ArrowUp" });
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("item1"));

        // Navigate to end
        fireEvent.keyDown(menu, { code: "End" });
        expect(menu).toHaveAttribute(
            "aria-activedescendant",
            expect.stringContaining("item-test-dropdown-menu-groupitem2"),
        );

        // Navigate to home
        fireEvent.keyDown(menu, { code: "Home" });
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("item1"));
    });

    it("should select with Enter key", () => {
        const onSelect = vi.fn();
        renderMenu({ onSelect });

        const menu = screen.getByRole("menu");

        // Navigate to second item
        fireEvent.keyDown(menu, { code: "ArrowDown" });

        // Select with Enter
        fireEvent.keyDown(menu, { code: "Enter" });

        expect(onSelect).toHaveBeenCalledWith(mockItems[1]);
    });

    it("should select with Space key", () => {
        const onSelect = vi.fn();
        renderMenu({ onSelect });

        const menu = screen.getByRole("menu");

        // Navigate to second item
        fireEvent.keyDown(menu, { code: "ArrowDown" });

        // Select with Space
        fireEvent.keyDown(menu, { code: "Space" }); // Space key is represented as "Space" in event.code

        expect(onSelect).toHaveBeenCalledWith(mockItems[1]);
    });

    it("should close with Escape key", () => {
        const onClose = vi.fn();
        renderMenu({ onClose });

        const menu = screen.getByRole("menu");

        // Press Escape
        fireEvent.keyDown(menu, { code: "Escape" });

        expect(onClose).toHaveBeenCalled();
    });

    it("should call onClose after selection when shouldCloseOnSelect is true", () => {
        const onSelect = vi.fn();
        const onClose = vi.fn();
        renderMenu({ onSelect, onClose, shouldCloseOnSelect: true });

        // Click on an item
        fireEvent.click(screen.getByText("Item 1"));

        expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
        expect(onClose).toHaveBeenCalled();
    });

    it("should not call onClose after selection when shouldCloseOnSelect is false", () => {
        const onSelect = vi.fn();
        const onClose = vi.fn();
        renderMenu({ onSelect, onClose, shouldCloseOnSelect: false });

        // Click on an item
        fireEvent.click(screen.getByText("Item 1"));

        expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
        expect(onClose).not.toHaveBeenCalled();
    });

    it("should open submenu when item with submenu is selected", () => {
        renderMenu();

        // Click directly on the item with submenu
        fireEvent.click(screen.getByText("Item 4"));

        const menu = screen.getByRole("menu");

        // Should focus first item in submenu
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("subitem1"));
    });

    it("should navigate back to parent menu with left arrow key", () => {
        renderMenu();

        // Click directly on the item with submenu
        fireEvent.click(screen.getByText("Item 4"));

        const menu = screen.getByRole("menu");

        // Should be in submenu
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("subitem1"));

        // Navigate back to parent with left arrow
        fireEvent.keyDown(menu, { code: "ArrowLeft" });

        // Should focus parent item
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("item4"));
    });

    it("should render with custom InteractiveItemComponent", () => {
        const CustomInteractiveItemComponent = ({
            item,
            isFocused,
            onSelect,
        }: IUiMenuInteractiveItemProps<{ interactive: string }>) => (
            <div
                className={cx("custom-item", {
                    "custom-focused": isFocused,
                    "custom-disabled": item.isDisabled,
                })}
                onClick={item.isDisabled ? undefined : onSelect}
                data-testid="custom-item"
            >
                {item.stringTitle} - {item.data}
            </div>
        );

        renderMenu({
            InteractiveItem: CustomInteractiveItemComponent,
        });

        // Check that custom component is rendered
        const customItems = screen.getAllByTestId("custom-item");
        expect(customItems.length).toBe(6); // 6 interactive items in mockItems (including group items)

        // Check content of custom component
        expect(screen.getByText("Item 1 - data1")).toBeInTheDocument();
    });

    it("should render with custom StaticItemComponent", () => {
        const CustomStaticItemComponent = ({ item }: IUiMenuStaticItemProps<{ static: string }>) => (
            <div className="custom-static-item" data-testid="custom-static-item">
                Static: {item.data}
            </div>
        );

        renderMenu({
            StaticItem: CustomStaticItemComponent,
        });

        // Check that custom static component is rendered
        const customStaticItems = screen.getAllByTestId("custom-static-item");
        expect(customStaticItems.length).toBe(1);
        expect(screen.getByText("Static: Static Item 1")).toBeInTheDocument();
    });

    it("should apply maxWidth style when provided", () => {
        const maxWidth = 300;
        renderMenu({ maxWidth });

        const menuContainer = document.querySelector(`.${b()}`);
        expect(menuContainer).toHaveStyle({ maxWidth: `${maxWidth}px` });
    });

    it("should call onUnhandledKeyDown for unhandled key events", () => {
        const onUnhandledKeyDown = vi.fn();
        renderMenu({ onUnhandledKeyDown });

        const menu = screen.getByRole("menu");

        // Press an unhandled key
        fireEvent.keyDown(menu, { code: "F1" });

        expect(onUnhandledKeyDown).toHaveBeenCalled();
        expect(onUnhandledKeyDown.mock.calls[0][0].code).toBe("F1");
        expect(onUnhandledKeyDown.mock.calls[0][1]).toHaveProperty("items", mockItems);
    });

    it("should maintain proper aria attributes", () => {
        renderMenu();

        const menu = screen.getByRole("menu");

        // Check that menu has proper ARIA attributes
        expect(menu).toHaveAttribute("id", "test-dropdown-menu");
        expect(menu).toHaveAttribute("aria-labelledby", "test-dropdown-button");
        expect(menu).toHaveAttribute("role", "menu");

        // Check that items have proper ARIA attributes
        const items = screen.getAllByRole("menuitem");

        // Item with submenu should have aria-haspopup
        const itemWithSubmenu = screen.getByText("Item 4").closest("li");
        expect(itemWithSubmenu).toHaveAttribute("aria-haspopup", "menu");
    });

    it("should allow focusing disabled items when isDisabledFocusable is true", () => {
        const onSelect = vi.fn();
        renderMenu({
            isDisabledFocusable: true,
            onSelect,
        });

        const menu = screen.getByRole("menu");

        // Initial focus should be on first item
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("item1"));

        // Navigate down
        fireEvent.keyDown(menu, { code: "ArrowDown" });
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("item2"));

        // Navigate down again should focus disabled item
        fireEvent.keyDown(menu, { code: "ArrowDown" });
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("item3"));

        // Selecting a disabled item should not work
        fireEvent.keyDown(menu, { code: "Enter" });
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("should not allow focusing disabled items when isDisabledFocusable is false", () => {
        renderMenu({
            isDisabledFocusable: false,
        });

        const menu = screen.getByRole("menu");

        // Initial focus should be on first item
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("item1"));

        // Navigate down
        fireEvent.keyDown(menu, { code: "ArrowDown" });
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("item2"));

        // Navigate down again should skip disabled item and focus item4
        fireEvent.keyDown(menu, { code: "ArrowDown" });
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("item4"));
    });

    it("should add data-test-id to items", () => {
        renderMenu({
            itemDataTestId: "item-data-test-id",
        });

        const items = screen.getByRole("menu").querySelectorAll("[data-testid]");
        expect(items).toHaveLength(7);
    });

    it("should handle mouse interaction to focus items", () => {
        renderMenu();

        // Simulate mouse movement to set control type to mouse
        const menuContainer = document.querySelector(`.${b()}`);
        fireEvent.mouseMove(menuContainer!);

        // Mouse over an item
        fireEvent.mouseMove(screen.getByText("Item 2").closest("li")!);

        // Check that item is focused
        const menu = screen.getByRole("menu");
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("item2"));
    });

    it("should render group items with their title", () => {
        renderMenu();

        // Check that group title is rendered
        expect(screen.getByText("Group 1")).toBeInTheDocument();

        // Check that group items are rendered
        expect(screen.getByText("Group Item 1")).toBeInTheDocument();
        expect(screen.getByText("Group Item 2")).toBeInTheDocument();
    });

    it("should render with custom GroupItemComponent", () => {
        const CustomGroupItemComponent = ({ item }: UiMenuGroupItemProps<{ group: string }>) => {
            const { ItemComponent } = typedUiMenuContextStore<{ group: string }>().useContextStore((ctx) => ({
                ItemComponent: ctx.ItemComponent,
            }));

            return (
                <div className="custom-group" data-testid="custom-group">
                    <div className="custom-group-title">{item.data}</div>
                    <div className="custom-group-items">
                        {item.subItems.map((groupItem, index) => (
                            <ItemComponent key={"id" in groupItem ? groupItem.id : index} item={groupItem} />
                        ))}
                    </div>
                </div>
            );
        };

        renderMenu({
            GroupItem: CustomGroupItemComponent,
        });

        // Check that custom component is rendered
        const customGroups = screen.getAllByTestId("custom-group");
        expect(customGroups.length).toBe(1);

        // Check that group title is rendered
        expect(screen.getByText("Group title")).toBeInTheDocument();

        // Check that group items are still rendered
        expect(screen.getByText("Group Item 1")).toBeInTheDocument();
        expect(screen.getByText("Group Item 2")).toBeInTheDocument();
    });
    it("should handle menu with only group items at top level", () => {
        // Create a menu with only group items at the top level
        const onlyGroupItems: IUiMenuItem[] = [
            {
                type: "group",
                id: "group1",
                stringTitle: "Group 1",
                data: "Group 1 title",
                subItems: [
                    {
                        type: "interactive",
                        id: "group1item1",
                        stringTitle: "Group 1 Item 1",
                        data: "group1data1",
                    },
                    {
                        type: "interactive",
                        id: "group1item2",
                        stringTitle: "Group 1 Item 2",
                        data: "group1data2",
                    },
                ],
            },
            {
                type: "group",
                id: "group2",
                stringTitle: "Group 2",
                data: "Group 2 title",
                subItems: [
                    {
                        type: "interactive",
                        id: "group2item1",
                        stringTitle: "Group 2 Item 1",
                        data: "group2data1",
                    },
                    {
                        type: "interactive",
                        id: "group2item2",
                        stringTitle: "Group 2 Item 2",
                        data: "group2data2",
                    },
                ],
            },
        ];

        const onSelect = vi.fn();
        render(
            <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={messages}>
                <UiMenu
                    items={onlyGroupItems}
                    onSelect={onSelect}
                    onClose={vi.fn()}
                    ariaAttributes={{
                        id: "test-group-menu",
                        "aria-labelledby": "test-group-button",
                    }}
                />
            </IntlProvider>,
        );

        // Check that all group items are rendered
        expect(screen.getByText("Group 1")).toBeInTheDocument();
        expect(screen.getByText("Group 2")).toBeInTheDocument();
        expect(screen.getByText("Group 1 Item 1")).toBeInTheDocument();
        expect(screen.getByText("Group 1 Item 2")).toBeInTheDocument();
        expect(screen.getByText("Group 2 Item 1")).toBeInTheDocument();
        expect(screen.getByText("Group 2 Item 2")).toBeInTheDocument();

        const menu = screen.getByRole("menu");

        // Initial focus should be on the first interactive item from the first group
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("group1item1"));

        // Navigate down
        fireEvent.keyDown(menu, { code: "ArrowDown" });
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("group1item2"));

        // Navigate down again to reach the next group
        fireEvent.keyDown(menu, { code: "ArrowDown" });
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("group2item1"));

        // Navigate to end
        fireEvent.keyDown(menu, { code: "End" });
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("group2item2"));

        // Navigate to home
        fireEvent.keyDown(menu, { code: "Home" });
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("group1item1"));

        // Select an item
        fireEvent.keyDown(menu, { code: "ArrowDown" });
        fireEvent.keyDown(menu, { code: "Enter" });
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "group1item2" }));
    });

    it("should open submenu with a group inside when top-level interactive item is clicked", () => {
        const menuWithInteractiveAndGroup: IUiMenuItem[] = [
            { type: "interactive", id: "item1", stringTitle: "Item 1", data: "data1" },
            {
                type: "interactive",
                id: "item2",
                stringTitle: "Item with submenu",
                data: "data2",
                subItems: [
                    {
                        type: "group",
                        id: "group1",
                        stringTitle: "Group 1",
                        data: "Group title",
                        subItems: [
                            {
                                type: "interactive",
                                id: "groupitem1",
                                stringTitle: "Group Item 1",
                                data: "groupdata1",
                            },
                            {
                                type: "interactive",
                                id: "groupitem2",
                                stringTitle: "Group Item 2",
                                data: "groupdata2",
                            },
                        ],
                    },
                ],
            },
            { type: "interactive", id: "item3", stringTitle: "Item 3", data: "data3" },
        ];

        render(
            <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={messages}>
                <UiMenu
                    items={menuWithInteractiveAndGroup}
                    onSelect={vi.fn()}
                    onClose={vi.fn()}
                    ariaAttributes={{
                        id: "test-interactive-with-group",
                        "aria-labelledby": "test-interactive-with-group-button",
                    }}
                />
            </IntlProvider>,
        );

        // Check that top-level items are rendered
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Item with submenu")).toBeInTheDocument();
        expect(screen.getByText("Item 3")).toBeInTheDocument();

        // Click on the item with submenu
        fireEvent.click(screen.getByText("Item with submenu"));

        // Verify that group items are now focused
        const menu = screen.getByRole("menu");
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("groupitem1"));

        // Verify that we can interact with the group items
        fireEvent.keyDown(menu, { code: "ArrowDown" });
        expect(menu).toHaveAttribute("aria-activedescendant", expect.stringContaining("groupitem2"));
    });
});

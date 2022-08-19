// (C) 2007-2022 GoodData Corporation
import React from "react";
import includes from "lodash/includes";
import { withIntl } from "@gooddata/sdk-ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { customMessages } from "./customDictionary";

import LegacyMultiSelectList, { ILegacyMultiSelectListProps } from "../LegacyMultiSelectList";

describe("LegacyMultiSelectList", () => {
    const firstItem: any = {
        title: "First item",
    };
    const secondItem: any = {
        title: "Second item",
    };

    const maskedItem: any = {
        title: null,
        available: false,
    };
    const items: any[] = [firstItem, secondItem];

    function renderList(customProps: Partial<ILegacyMultiSelectListProps<any>> = {}) {
        const isSelected = (item: any) => includes(customProps.selection, item);
        const itemsCount = customProps.itemsCount || customProps.items.length;
        const props = {
            items: customProps.items,
            itemsCount,
            width: 100,
            height: 100,
            itemHeight: 10,
            isSelected,
            ...customProps,
        };

        const Wrapped = withIntl<ILegacyMultiSelectListProps<any>>(
            LegacyMultiSelectList,
            undefined,
            customMessages,
        );
        return render(<Wrapped {...props} />);
    }

    it("should select items based on result of isSelected", () => {
        renderList({
            items: [firstItem, secondItem],
            selection: [firstItem],
        });

        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes[0]).toBeChecked();
        expect(checkboxes[1]).not.toBeChecked();
    });

    it("List should maintain selection as items are clicked", async () => {
        const onSelect = jest.fn();
        renderList({
            items,
            onSelect,
        });

        await userEvent.click(screen.getByText(firstItem.title));

        expect(onSelect).toHaveBeenCalledWith(firstItem);
    });

    it("should deselect previously selected item on second click", async () => {
        const onSelect = jest.fn();
        renderList({
            items,
            selection: [firstItem, secondItem],
            onSelect,
        });

        await userEvent.click(screen.getByText(secondItem.title));
        expect(onSelect).toHaveBeenCalledWith(secondItem);
    });

    it('should correctly handle "only" option', async () => {
        const onSelectOnly = jest.fn();
        renderList({
            items,
            selection: [firstItem, secondItem],
            onSelectOnly,
        });

        await userEvent.click(screen.getAllByText("Only")[0]);
        expect(onSelectOnly).toHaveBeenCalledWith(firstItem);
    });

    it("should work with plain JS inputs too", () => {
        const first = {
            title: "First item",
        };

        const second = {
            title: "Second item",
        };

        const mutableItems = [first, second];
        renderList({
            items: mutableItems,
            selection: [second],
            selectAllCheckbox: true,
            isInverted: false,
            isSearching: false,
            tagName: "Attribute",
        });

        expect(screen.getByTitle("Attribute")).toBeInTheDocument();
        expect(screen.getByTitle(`${second.title}`)).toBeInTheDocument();
    });

    describe("selectAllCheckbox", () => {
        it("should trigger selectAll if none is selected", async () => {
            const onSelectAll = jest.fn();
            renderList({
                items,
                selectAllCheckbox: true,
                onSelectAll,
            });

            await userEvent.click(screen.getAllByRole("checkbox")[0]);
            expect(onSelectAll).toHaveBeenCalledTimes(1);
        });

        it("should trigger selectNone if all are selected", async () => {
            const onSelectNone = jest.fn();
            renderList({
                items,
                selection: items,
                selectAllCheckbox: true,
                onSelectNone,
            });
            await userEvent.click(screen.getAllByRole("checkbox")[0]);
            expect(onSelectNone).toHaveBeenCalledTimes(1);
        });

        it("should trigger selectAll if some are selected", async () => {
            const onSelectAll = jest.fn();
            renderList({
                items,
                selection: [firstItem],
                selectAllCheckbox: true,
                onSelectAll,
            });
            await userEvent.click(screen.getAllByRole("checkbox")[0]);
            expect(onSelectAll).toHaveBeenCalledTimes(1);
        });

        it("should have selectAll enabled if not searching", () => {
            renderList({
                items,
                selection: [firstItem],
                selectAllCheckbox: true,
                isSearching: false,
            });

            expect(screen.getByRole("select-all-checkbox")).not.toHaveClass("disabled");
        });

        describe("selection footer info", () => {
            it("should show all when nothing is selected", () => {
                renderList({
                    items,
                    selection: [],
                    selectAllCheckbox: true,
                    isInverted: true,
                    isSearching: false,
                    tagName: "Attribute",
                });

                expect(screen.getByRole("list-status-bar").textContent.replace(/\xA0/g, " ")).toBe(
                    "Attribute is All",
                );
            });

            it("should show none when nothing is selected", () => {
                renderList({
                    items,
                    selection: [],
                    selectAllCheckbox: true,
                    isSearching: false,
                    tagName: "Attribute",
                });
                expect(screen.getByRole("list-status-bar").textContent.replace(/\xA0/g, " ")).toBe(
                    "Attribute is (None)",
                );
            });

            it("should show selected item info", () => {
                renderList({
                    items,
                    selection: [items[0]],
                    selectAllCheckbox: true,
                    isSearching: false,
                    tagName: "Attribute",
                });

                expect(screen.getByRole("list-status-bar").textContent.replace(/\xA0/g, " ")).toBe(
                    `Attribute is ${firstItem.title}`,
                );
            });

            it("should show selected item info (inverted)", () => {
                renderList({
                    items,
                    selection: [items[0]],
                    selectAllCheckbox: true,
                    isInverted: true,
                    isSearching: false,
                    tagName: "Attribute",
                });

                expect(screen.getByRole("list-status-bar").textContent.replace(/\xA0/g, " ")).toBe(
                    `Attribute is All except ${firstItem.title}`,
                );
            });

            it("should show selected items info with count (inverted)", () => {
                renderList({
                    items,
                    selection: [...items],
                    selectAllCheckbox: true,
                    isInverted: true,
                    isSearching: false,
                    tagName: "Attribute",
                });

                expect(screen.getByRole("list-status-bar").textContent.replace(/\xA0/g, " ")).toBe(
                    `Attribute is All except ${firstItem.title}, ${secondItem.title} (2)`,
                );
            });

            it("should show selected items info with count", () => {
                renderList({
                    items,
                    selection: [...items],
                    selectAllCheckbox: true,
                    isInverted: false,
                    isSearching: false,
                    tagName: "Attribute",
                });

                expect(screen.getByRole("list-status-bar").textContent.replace(/\xA0/g, " ")).toBe(
                    `Attribute is ${firstItem.title}, ${secondItem.title} (2)`,
                );
            });

            it("should show not available for masked attribute elements (MUF)", () => {
                renderList({
                    items: [...items, maskedItem],
                    selection: [firstItem, maskedItem],
                    selectAllCheckbox: true,
                    isInverted: false,
                    isSearching: false,
                    tagName: "Attribute",
                });
                expect(screen.getByRole("list-status-bar").textContent.replace(/\xA0/g, " ")).toBe(
                    `Attribute is ${firstItem.title}, N/A (2)`,
                );
            });
        });

        describe("searching in dropdown", () => {
            it("shouldn't show searching info when not searching", () => {
                renderList({
                    items,
                    itemsCount: items.length,
                    selection: [],
                    selectAllCheckbox: true,
                    isInverted: false,
                    isSearching: false,
                    tagName: "Attribute",
                });

                expect(screen.queryByText("search result", { exact: false })).not.toBeInTheDocument();
            });

            it("should show searching info", () => {
                renderList({
                    items,
                    itemsCount: 1,
                    selection: [...items],
                    selectAllCheckbox: true,
                    isInverted: false,
                    isSearching: true,
                    tagName: "Attribute",
                });

                expect(screen.getByText("search results (1)")).toBeInTheDocument();
            });
        });
    });
});

// (C) 2007-2020 GoodData Corporation
import React from "react";
import includes from "lodash/includes";
import { mount, ReactWrapper } from "enzyme";

import LegacyMultiSelectList, { ILegacyMultiSelectListProps } from "../LegacyMultiSelectList";
import { withIntl } from "@gooddata/sdk-ui";
import { customMessages } from "./customDictionary";

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
        return mount(<Wrapped {...props} />);
    }

    it("should select items based on result of isSelected", () => {
        const wrapper = renderList({
            items: [firstItem, secondItem],
            selection: [firstItem],
        });

        const checkboxes = wrapper.find('input[type="checkbox"]');
        expect(checkboxes.get(0).props.checked).toEqual(true);
        expect(checkboxes.get(1).props.checked).toEqual(false);
    });

    it("List should maintain selection as items are clicked", () => {
        const onSelect = jest.fn();
        const wrapper = renderList({
            items,
            onSelect,
        });

        wrapper.find(".gd-list-item").first().simulate("click");
        expect(onSelect).toHaveBeenCalledWith(firstItem);
    });

    it("should deselect previously selected item on second click", () => {
        const onSelect = jest.fn();
        const wrapper = renderList({
            items,
            selection: [firstItem, secondItem],
            onSelect,
        });

        wrapper.find(".gd-list-item").at(1).simulate("click");
        expect(onSelect).toHaveBeenCalledWith(secondItem);
    });

    it('should correctly handle "only" option', () => {
        const onSelectOnly = jest.fn();
        const wrapper = renderList({
            items,
            selection: [firstItem, secondItem],
            onSelectOnly,
        });

        wrapper.find(".gd-list-item-only").first().simulate("click");
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
        const wrapper = renderList({
            items: mutableItems,
            selection: [second],
            selectAllCheckbox: true,
            isInverted: false,
            isSearching: false,
            tagName: "Attribute",
        });
        expect(wrapper.find(".s-list-status-bar")).toHaveLength(1);
        expect(wrapper.find(".s-list-status-bar").text().replace(/\xA0/g, " ")).toBe(
            `Attribute is ${second.title}`,
        );
    });

    describe("selectAllCheckbox", () => {
        function clickCheckbox(wrapper: ReactWrapper) {
            wrapper.find(".gd-checkbox-selection").simulate("change");
        }

        it("should trigger selectAll if none is selected", () => {
            const onSelectAll = jest.fn();
            const wrapper = renderList({
                items,
                selectAllCheckbox: true,
                onSelectAll,
            });
            clickCheckbox(wrapper);
            expect(onSelectAll).toHaveBeenCalledTimes(1);
        });

        it("should trigger selectNone if all are selected", () => {
            const onSelectNone = jest.fn();
            const wrapper = renderList({
                items,
                selection: items,
                selectAllCheckbox: true,
                onSelectNone,
            });
            clickCheckbox(wrapper);
            expect(onSelectNone).toHaveBeenCalledTimes(1);
        });

        it("should trigger selectAll if some are selected", () => {
            const onSelectAll = jest.fn();
            const wrapper = renderList({
                items,
                selection: [firstItem],
                selectAllCheckbox: true,
                onSelectAll,
            });
            clickCheckbox(wrapper);
            expect(onSelectAll).toHaveBeenCalledTimes(1);
        });

        it("should have selectAll enabled if not searching", () => {
            const wrapper = renderList({
                items,
                selection: [firstItem],
                selectAllCheckbox: true,
                isSearching: false,
            });
            expect(wrapper.find("label.s-select-all-checkbox")).toHaveLength(1);
            expect(wrapper.find("label.s-select-all-checkbox").hasClass("disabled")).toBeFalsy();
        });

        describe("selection footer info", () => {
            it("should show all when nothing is selected", () => {
                const wrapper = renderList({
                    items,
                    selection: [],
                    selectAllCheckbox: true,
                    isInverted: true,
                    isSearching: false,
                    tagName: "Attribute",
                });
                expect(wrapper.find(".s-list-status-bar")).toHaveLength(1);
                expect(wrapper.find(".s-list-status-bar").text().replace(/\xA0/g, " ")).toBe(
                    "Attribute is All",
                );
            });

            it("should show none when nothing is selected", () => {
                const wrapper = renderList({
                    items,
                    selection: [],
                    selectAllCheckbox: true,
                    isSearching: false,
                    tagName: "Attribute",
                });
                expect(wrapper.find(".s-list-status-bar")).toHaveLength(1);
                expect(wrapper.find(".s-list-status-bar").text().replace(/\xA0/g, " ")).toBe(
                    "Attribute is (None)",
                );
            });

            it("should show selected item info", () => {
                const wrapper = renderList({
                    items,
                    selection: [items[0]],
                    selectAllCheckbox: true,
                    isSearching: false,
                    tagName: "Attribute",
                });
                expect(wrapper.find(".s-list-status-bar")).toHaveLength(1);
                expect(wrapper.find(".s-list-status-bar").text().replace(/\xA0/g, " ")).toBe(
                    `Attribute is ${firstItem.title}`,
                );
            });

            it("should show selected item info (inverted)", () => {
                const wrapper = renderList({
                    items,
                    selection: [items[0]],
                    selectAllCheckbox: true,
                    isInverted: true,
                    isSearching: false,
                    tagName: "Attribute",
                });
                expect(wrapper.find(".s-list-status-bar")).toHaveLength(1);
                expect(wrapper.find(".s-list-status-bar").text().replace(/\xA0/g, " ")).toBe(
                    `Attribute is All except ${firstItem.title}`,
                );
            });

            it("should show selected items info with count (inverted)", () => {
                const wrapper = renderList({
                    items,
                    selection: [...items],
                    selectAllCheckbox: true,
                    isInverted: true,
                    isSearching: false,
                    tagName: "Attribute",
                });
                expect(wrapper.find(".s-list-status-bar")).toHaveLength(1);
                expect(wrapper.find(".s-list-status-bar").text().replace(/\xA0/g, " ")).toBe(
                    `Attribute is All except ${firstItem.title}, ${secondItem.title} (2)`,
                );
            });

            it("should show selected items info with count", () => {
                const wrapper = renderList({
                    items,
                    selection: [...items],
                    selectAllCheckbox: true,
                    isInverted: false,
                    isSearching: false,
                    tagName: "Attribute",
                });
                expect(wrapper.find(".s-list-status-bar")).toHaveLength(1);
                expect(wrapper.find(".s-list-status-bar").text().replace(/\xA0/g, " ")).toBe(
                    `Attribute is ${firstItem.title}, ${secondItem.title} (2)`,
                );
            });

            it("should show not available for masked attribute elements (MUF)", () => {
                const wrapper = renderList({
                    items: [...items, maskedItem],
                    selection: [firstItem, maskedItem],
                    selectAllCheckbox: true,
                    isInverted: false,
                    isSearching: false,
                    tagName: "Attribute",
                });
                expect(wrapper.find(".s-list-status-bar")).toHaveLength(1);
                expect(wrapper.find(".s-list-status-bar").text().replace(/\xA0/g, " ")).toBe(
                    `Attribute is ${firstItem.title}, N/A (2)`,
                );
            });
        });

        describe("searching in dropdown", () => {
            it("shouldn't show searching info when not searching", () => {
                const wrapper = renderList({
                    items,
                    itemsCount: items.length,
                    selection: [],
                    selectAllCheckbox: true,
                    isInverted: false,
                    isSearching: false,
                    tagName: "Attribute",
                });
                expect(wrapper.find(".s-list-search-selection-size")).toHaveLength(0);
            });

            it("should show searching info", () => {
                const wrapper = renderList({
                    items,
                    itemsCount: 1,
                    selection: [...items],
                    selectAllCheckbox: true,
                    isInverted: false,
                    isSearching: true,
                    tagName: "Attribute",
                });
                expect(wrapper.find(".s-list-search-selection-size")).toHaveLength(1);
                expect(wrapper.find(".s-list-search-selection-size").text()).toBe("search results (1)");
            });
        });
    });
});

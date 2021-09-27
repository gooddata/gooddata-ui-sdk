// (C) 2007-2020 GoodData Corporation
import React from "react";
import first from "lodash/first";
import times from "lodash/times";
import assign from "lodash/assign";
import noop from "lodash/noop";
import { mount } from "enzyme";

import { withIntl } from "@gooddata/sdk-ui";

import { LegacyInvertableList, ILegacyInvertableListProps } from "../LegacyInvertableList";
import { LegacyMultiSelectList } from "../LegacyMultiSelectList";
import { customMessages } from "./customDictionary";
import { Message } from "../../Messages";

interface IItem {
    title: string;
    key: string;
}
describe("LegacyInvertableList", () => {
    let firstItem: IItem;
    let secondItem: IItem;
    let onSelectStub: () => void;
    let items: IItem[];

    function renderList(options: Partial<ILegacyInvertableListProps<IItem>> = {}) {
        const defaultOptions = {
            maxSelectionSize: 500,
            width: 100,
            height: 100,
            itemHeight: 10,
            onSearch: noop,
            items: [] as IItem[],
        };

        const opts: ILegacyInvertableListProps<IItem> = assign(
            { itemsCount: options.items.length },
            { filteredItemsCount: options.items.length },
            defaultOptions,
            options,
        );

        const Wrapped = withIntl<ILegacyInvertableListProps<IItem>>(
            LegacyInvertableList,
            undefined,
            customMessages,
        );
        return mount(<Wrapped {...opts} />);
    }

    beforeEach(() => {
        const createItem = (title: string, key: number): IItem => ({ title, key: `${key}` });
        items = times(8).map((i) => createItem(`Item ${i + 1}`, i));

        [firstItem, secondItem] = items;

        onSelectStub = jest.fn();
    });

    it("should select all as empty inverted selection", () => {
        const wrapper = renderList({
            items: [firstItem, secondItem],
            onSelect: onSelectStub,
        });

        wrapper.find(".s-select_all").simulate("click");
        expect(onSelectStub).toHaveBeenCalledTimes(1);
        expect(onSelectStub).toHaveBeenCalledWith([], true);
    });

    it("should select none as empty selection", () => {
        const wrapper = renderList({
            items: [firstItem, secondItem],
            onSelect: onSelectStub,
        });

        wrapper.find(".s-clear").simulate("click");
        expect(onSelectStub).toHaveBeenCalledTimes(1);
        expect(onSelectStub).toHaveBeenCalledWith([], false);
    });

    it("should select one as inverted selection with one item", () => {
        const wrapper = renderList({
            items: [firstItem, secondItem],
            onSelect: onSelectStub,
        });

        wrapper.find(".gd-list-item").first().simulate("click");
        expect(onSelectStub).toHaveBeenCalledTimes(1);
        expect(onSelectStub).toHaveBeenCalledWith([firstItem], true);
    });

    it("should send information to render component if search string is not present", () => {
        const wrapper = renderList({
            items: [firstItem, secondItem],
        });

        expect(wrapper.find(LegacyMultiSelectList).props().isSearching).toBeFalsy();
    });

    it("should send information to render component if search string is present", () => {
        const wrapper = renderList({
            items: [firstItem, secondItem],
            searchString: "hello",
        });

        expect(wrapper.find(LegacyMultiSelectList).props().isSearching).toBeTruthy();
    });

    describe("max selection size", () => {
        it("should not allow more items to be checked once maximum selection size is reached", () => {
            const wrapper = renderList({
                items,
                selection: items.slice(0, 3),
                isInverted: false,
                onSelect: onSelectStub,
                maxSelectionSize: 3,
            });

            wrapper.find(".gd-list-item").at(3).simulate("click");
            expect(onSelectStub).not.toHaveBeenCalled();
        });

        it("should not allow more items to be unchecked once maximum inverted selection size is reached", () => {
            const wrapper = renderList({
                items,
                selection: items.slice(0, 3),
                isInverted: true,
                onSelect: onSelectStub,
                maxSelectionSize: 3,
            });

            wrapper.find(".gd-list-item").at(3).simulate("click");
            expect(onSelectStub).not.toHaveBeenCalled();
        });
    });

    describe("select all/none when list is filtered", () => {
        let selection: IItem[];
        let visibleItems: IItem[];
        let options: any;

        beforeEach(() => {
            selection = items.slice(4, 8);

            // cloning ensures getItemKey is used properly
            const clone = (item: IItem) => Object.assign({}, item);
            visibleItems = items.slice(2, 6).map(clone);

            options = {
                getItemKey: (item: IItem) => item.key,
                items: visibleItems,
                maxSelectionSize: 5,
                onSelect: onSelectStub,
                searchString: "foobar",
                selection,
            };
        });

        describe("select all", () => {
            it("should add to the normal selection until limit is reached", () => {
                const wrapper = renderList(assign(options, { isInverted: false }));

                wrapper.find(".s-select_all").simulate("click");
                expect(onSelectStub).toHaveBeenCalledWith([...selection, first(visibleItems)], false);
            });

            it("should remove visible items from inverted selection", () => {
                const wrapper = renderList(assign(options, { isInverted: true }));

                wrapper.find(".s-select_all").simulate("click");
                expect(onSelectStub).toHaveBeenCalledWith(items.slice(6, 8), true);
            });

            it("should trigger inverted selection if selection contains all items", () => {
                const wrapper = renderList(
                    assign(options, {
                        isInverted: false,
                        items: [visibleItems[0]],
                        itemsCount: 4,
                        searchString: "",
                        selection: visibleItems.slice(1),
                    }),
                );

                wrapper.find(".s-select_all").simulate("click");
                expect(onSelectStub).toHaveBeenCalledWith([], true);
            });
        });

        describe("select none", () => {
            it("should remove visible items from normal selection", () => {
                const wrapper = renderList({
                    ...options,
                    isInverted: false,
                });

                wrapper.find(".s-clear").simulate("click");
                expect(onSelectStub).toHaveBeenCalledWith(items.slice(6, 8), false);
            });

            it("should add visible items to inverted selection until limit is reached", () => {
                const wrapper = renderList({
                    ...options,
                    isInverted: true,
                });

                wrapper.find(".s-clear").simulate("click");
                expect(onSelectStub).toHaveBeenCalledWith([...selection, visibleItems[0]], true);
            });
        });
    });

    describe("maximum selection size warning", () => {
        it("should not be displayed when there is no selection", () => {
            const wrapper = renderList({ items });

            expect(wrapper.find(".gd-list-limitExceeded")).toHaveLength(0);
        });

        it("should be displayed when maximum size limit is hit", () => {
            const wrapper = renderList({
                items,
                maxSelectionSize: 4,
                selection: items.slice(0, 4),
            });
            expect(wrapper.find(Message)).toHaveLength(1);
        });
    });
});

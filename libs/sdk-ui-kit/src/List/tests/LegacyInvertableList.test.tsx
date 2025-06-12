// (C) 2007-2025 GoodData Corporation
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { withIntlForTest } from "@gooddata/sdk-ui";
import first from "lodash/first.js";
import times from "lodash/times.js";
import assign from "lodash/assign.js";
import noop from "lodash/noop.js";
import { customMessages } from "./customDictionary.js";
import { LegacyInvertableList, ILegacyInvertableListProps } from "../LegacyInvertableList.js";
import { describe, it, expect, vi, beforeEach } from "vitest";

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

        const Wrapped = withIntlForTest<ILegacyInvertableListProps<IItem>>(
            LegacyInvertableList,
            undefined,
            customMessages,
        );
        return render(<Wrapped {...opts} />);
    }

    beforeEach(() => {
        const createItem = (title: string, key: number): IItem => ({ title, key: `${key}` });
        items = times(8).map((i) => createItem(`Item ${i + 1}`, i));

        [firstItem, secondItem] = items;

        onSelectStub = vi.fn();
    });

    it("should select all as empty inverted selection", () => {
        renderList({
            items: [firstItem, secondItem],
            onSelect: onSelectStub,
        });

        fireEvent.click(screen.getByText("Select all"));

        expect(onSelectStub).toHaveBeenCalledTimes(1);
        expect(onSelectStub).toHaveBeenCalledWith([], true);
    });

    it("should select none as empty selection", () => {
        renderList({
            items: [firstItem, secondItem],
            onSelect: onSelectStub,
        });

        fireEvent.click(screen.getByText("Clear"));

        expect(onSelectStub).toHaveBeenCalledTimes(1);
        expect(onSelectStub).toHaveBeenCalledWith([], false);
    });

    it("should select one as inverted selection with one item", () => {
        renderList({
            items: [firstItem, secondItem],
            onSelect: onSelectStub,
        });

        fireEvent.click(screen.getByText("Item 1").closest("div"));

        expect(onSelectStub).toHaveBeenCalledTimes(1);
        expect(onSelectStub).toHaveBeenCalledWith([firstItem], true);
    });

    describe("max selection size", () => {
        it("should not allow more items to be checked once maximum selection size is reached", () => {
            renderList({
                items,
                selection: items.slice(0, 3),
                isInverted: false,
                onSelect: onSelectStub,
                maxSelectionSize: 3,
            });

            fireEvent.click(screen.getByText("Item 4").closest("div"));

            expect(onSelectStub).not.toHaveBeenCalled();
        });

        it("should not allow more items to be unchecked once maximum inverted selection size is reached", () => {
            renderList({
                items,
                selection: items.slice(0, 3),
                isInverted: true,
                onSelect: onSelectStub,
                maxSelectionSize: 3,
            });

            fireEvent.click(screen.getByText("Item 4").closest("div"));

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
                renderList(assign(options, { isInverted: false }));

                fireEvent.click(screen.getByText("Select all"));

                expect(onSelectStub).toHaveBeenCalledWith([...selection, first(visibleItems)], false);
            });

            it("should remove visible items from inverted selection", () => {
                renderList(assign(options, { isInverted: true }));

                fireEvent.click(screen.getByText("Select all"));

                expect(onSelectStub).toHaveBeenCalledWith(items.slice(6, 8), true);
            });

            it("should trigger inverted selection if selection contains all items", () => {
                renderList(
                    assign(options, {
                        isInverted: false,
                        items: [visibleItems[0]],
                        itemsCount: 4,
                        searchString: "",
                        selection: visibleItems.slice(1),
                    }),
                );

                fireEvent.click(screen.getByText("Select all"));

                expect(onSelectStub).toHaveBeenCalledWith([], true);
            });
        });

        describe("select none", () => {
            it("should remove visible items from normal selection", () => {
                renderList({
                    ...options,
                    isInverted: false,
                });

                fireEvent.click(screen.getByText("Clear"));

                expect(onSelectStub).toHaveBeenCalledWith(items.slice(6, 8), false);
            });

            it("should add visible items to inverted selection until limit is reached", () => {
                renderList({
                    ...options,
                    isInverted: true,
                });

                fireEvent.click(screen.getByText("Clear"));

                expect(onSelectStub).toHaveBeenCalledWith([...selection, visibleItems[0]], true);
            });
        });
    });

    describe("maximum selection size warning", () => {
        it("should be displayed when maximum size limit is hit", () => {
            renderList({
                items,
                maxSelectionSize: 4,
                selection: items.slice(0, 4),
            });

            expect(screen.queryByText("Sorry, you have exceeded the limit (4).")).toBeInTheDocument();
        });

        it("should not be displayed when there is no selection", () => {
            renderList({ items });

            expect(screen.queryByText("Sorry, you have exceeded the limit (4).")).not.toBeInTheDocument();
        });
    });
});

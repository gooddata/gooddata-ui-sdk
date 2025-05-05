// (C) 2025 GoodData Corporation

import { describe, it, expect } from "vitest";
import {
    findItem,
    getItem,
    findInteractiveItem,
    getInteractiveItem,
    getItemsByParent,
    getItemParent,
    getSiblingItems,
    getNextSiblings,
    getPreviousSiblings,
    getClosestFocusableSibling,
} from "../itemUtils.js";
import { IUiMenuItem } from "../types.js";

describe("itemUtils", () => {
    // Mock data for testing
    const mockItems: IUiMenuItem<string>[] = [
        { type: "interactive", id: "item1", stringTitle: "Item 1", data: "data1" },
        { type: "interactive", id: "item2", stringTitle: "Item 2", data: "data2" },
        { type: "interactive", id: "item3", stringTitle: "Item 3", isDisabled: true, data: "data3" },
        { type: "static", id: "static1", data: "Static Item 1" },
        {
            type: "interactive",
            id: "item4",
            stringTitle: "Item 4",
            data: "data4",
            subMenu: [
                { type: "interactive", id: "subitem1", stringTitle: "SubItem 1", data: "subdata1" },
                { type: "static", id: "substatic1", data: "SubStatic Item 1" },
                { type: "interactive", id: "subitem2", stringTitle: "SubItem 2", data: "subdata2" },
            ],
        },
    ];

    describe("findItem", () => {
        it("should find an item by predicate", () => {
            const result = findItem(mockItems, (item) => item.id === "item2");
            expect(result).toEqual(mockItems[1]);
        });

        it("should return undefined if item not found", () => {
            const result = findItem(mockItems, (item) => item.id === "nonexistent");
            expect(result).toBeUndefined();
        });

        it("should find an item in a submenu", () => {
            const result = findItem(mockItems, (item) => item.id === "subitem1");
            expect(result).toEqual(mockItems[4].subMenu?.[0]);
        });

        it("should handle empty array", () => {
            const result = findItem([], (item) => item.id === "item1");
            expect(result).toBeUndefined();
        });
    });

    describe("getItem", () => {
        it("should get an item by id", () => {
            const result = getItem(mockItems, "item2");
            expect(result).toEqual(mockItems[1]);
        });

        it("should return undefined if item not found", () => {
            const result = getItem(mockItems, "nonexistent");
            expect(result).toBeUndefined();
        });

        it("should get an item from a submenu", () => {
            const result = getItem(mockItems, "subitem1");
            expect(result).toEqual(mockItems[4].subMenu?.[0]);
        });
    });

    describe("findInteractiveItem", () => {
        it("should find an interactive item by predicate", () => {
            const result = findInteractiveItem(mockItems, (item) => item.id === "item2");
            expect(result).toEqual(mockItems[1]);
        });

        it("should return undefined if interactive item not found", () => {
            const result = findInteractiveItem(mockItems, (item) => item.id === "nonexistent");
            expect(result).toBeUndefined();
        });

        it("should not find static items", () => {
            const result = findInteractiveItem(mockItems, (item) => item.id === "static1");
            expect(result).toBeUndefined();
        });

        it("should find an interactive item in a submenu", () => {
            const result = findInteractiveItem(mockItems, (item) => item.id === "subitem1");
            expect(result).toEqual(mockItems[4].subMenu?.[0]);
        });
    });

    describe("getInteractiveItem", () => {
        it("should get an interactive item by id", () => {
            const result = getInteractiveItem(mockItems, "item2");
            expect(result).toEqual(mockItems[1]);
        });

        it("should return undefined if interactive item not found", () => {
            const result = getInteractiveItem(mockItems, "nonexistent");
            expect(result).toBeUndefined();
        });

        it("should not get static items", () => {
            const result = getInteractiveItem(mockItems, "static1");
            expect(result).toBeUndefined();
        });

        it("should get an interactive item from a submenu", () => {
            const result = getInteractiveItem(mockItems, "subitem1");
            expect(result).toEqual(mockItems[4].subMenu?.[0]);
        });
    });

    describe("getItemsByParent", () => {
        it("should get items in a submenu by parent id", () => {
            const result = getItemsByParent(mockItems, "item4");
            expect(result).toEqual(mockItems[4].subMenu);
        });

        it("should return undefined if parent item not found", () => {
            const result = getItemsByParent(mockItems, "nonexistent");
            expect(result).toBeUndefined();
        });

        it("should return undefined if parent item has no submenu", () => {
            const result = getItemsByParent(mockItems, "item1");
            expect(result).toBeUndefined();
        });

        it("should return top-level items if parentId is undefined", () => {
            const result = getItemsByParent(mockItems, undefined);
            expect(result).toEqual(mockItems);
        });
    });

    describe("getItemParent", () => {
        it("should get the parent of an item in a submenu", () => {
            const result = getItemParent(mockItems, "subitem1");
            expect(result).toEqual(mockItems[4]);
        });

        it("should return undefined if item not found", () => {
            const result = getItemParent(mockItems, "nonexistent");
            expect(result).toBeUndefined();
        });

        it("should return undefined for top-level items", () => {
            const result = getItemParent(mockItems, "item1");
            expect(result).toBeUndefined();
        });
    });

    describe("getNextSiblings", () => {
        it("should get next siblings in the root menu level with wraparound", () => {
            const results = getNextSiblings(mockItems, "item1");
            // Expect all items except item1, starting from item2 and wrapping around
            expect(results).toEqual([mockItems[1], mockItems[2], mockItems[3], mockItems[4]]);
        });

        it("should get next siblings in a submenu with wraparound", () => {
            const results = getNextSiblings(mockItems, "subitem1");
            // Expect all submenu items except subitem1, starting from the next item
            expect(results).toEqual([mockItems[4].subMenu?.[1], mockItems[4].subMenu?.[2]]);
        });

        it("should return empty array if item not found", () => {
            const results = getNextSiblings(mockItems, "nonexistent");
            expect(results).toEqual([]);
        });
    });

    describe("getPreviousSiblings", () => {
        it("should get previous siblings in the root menu level with wraparound", () => {
            const results = getPreviousSiblings(mockItems, "item4");
            // Expect all items except item4, starting from the previous item and going backwards
            expect(results).toEqual([mockItems[3], mockItems[2], mockItems[1], mockItems[0]]);
        });

        it("should get previous siblings in a submenu with wraparound", () => {
            const results = getPreviousSiblings(mockItems, "subitem2");
            // Expect all submenu items except subitem2, starting from the previous item and going backwards
            expect(results).toEqual([mockItems[4].subMenu?.[1], mockItems[4].subMenu?.[0]]);
        });

        it("should return empty array if item not found", () => {
            const results = getPreviousSiblings(mockItems, "nonexistent");
            expect(results).toEqual([]);
        });
    });

    describe("getSiblingItems", () => {
        it("should get sibling items in the same submenu", () => {
            const result = getSiblingItems(mockItems, "item2");
            expect(result).toEqual(mockItems);
        });

        it("should get sibling items in a submenu", () => {
            const result = getSiblingItems(mockItems, "subitem1");
            expect(result).toEqual(mockItems[4].subMenu);
        });

        it("should return undefined if item not found", () => {
            const result = getSiblingItems(mockItems, "nonexistent");
            expect(result).toBeUndefined();
        });
    });

    describe("getClosestFocusableSibling", () => {
        const isItemFocusable = (item: IUiMenuItem<string>) =>
            item.type === "interactive" && !item.isDisabled;

        it("should get the closest focusable item in forward direction", () => {
            const result = getClosestFocusableSibling({
                items: mockItems,
                isItemFocusable,
                itemId: "item1",
                direction: "forward",
            });
            expect(result).toEqual(mockItems[1]); // item2
        });

        it("should get the closest focusable item in backward direction", () => {
            const result = getClosestFocusableSibling({
                items: mockItems,
                isItemFocusable,
                itemId: "item4",
                direction: "backward",
            });
            expect(result).toEqual(mockItems[1]); // item2
        });

        it("should return first focusable item if itemId is undefined in forward direction", () => {
            const result = getClosestFocusableSibling({
                items: mockItems,
                isItemFocusable,
                itemId: undefined,
                direction: "forward",
            });
            expect(result).toEqual(mockItems[0]); // item1
        });

        it("should return last focusable item if itemId is undefined in backward direction", () => {
            const result = getClosestFocusableSibling({
                items: mockItems,
                isItemFocusable,
                itemId: undefined,
                direction: "backward",
            });
            expect(result).toEqual(mockItems[4]); // item4
        });

        it("should wrap around to the beginning if no focusable item found after the current item", () => {
            const result = getClosestFocusableSibling({
                items: mockItems,
                isItemFocusable,
                itemId: "item4", // last item
                direction: "forward",
            });
            expect(result).toEqual(mockItems[0]); // item1
        });

        it("should wrap around to the end if no focusable item found before the current item", () => {
            const result = getClosestFocusableSibling({
                items: mockItems,
                isItemFocusable,
                itemId: "item1", // first item
                direction: "backward",
            });
            expect(result).toEqual(mockItems[4]); // item4
        });

        it("should return undefined if no focusable items exist", () => {
            // Create a list with only disabled items
            const disabledItems: IUiMenuItem<string>[] = [
                { type: "interactive", id: "item1", stringTitle: "Item 1", isDisabled: true, data: "data1" },
                { type: "static", id: "static1", data: "Static Item 1" },
                { type: "interactive", id: "item2", stringTitle: "Item 2", isDisabled: true, data: "data2" },
            ];

            const result = getClosestFocusableSibling({
                items: disabledItems,
                isItemFocusable,
                itemId: "item1",
                direction: "forward",
            });
            expect(result).toBeUndefined();
        });
    });
});

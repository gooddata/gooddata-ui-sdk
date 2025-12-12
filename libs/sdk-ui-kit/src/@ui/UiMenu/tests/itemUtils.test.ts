// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    findInteractiveItem,
    findItem,
    getClosestFocusableSibling,
    getInteractiveItem,
    getItem,
    getItemInteractiveParent,
    getItemsByInteractiveParent,
    getNextSiblings,
    getPreviousSiblings,
    getSiblingItems,
    unwrapGroupItems,
} from "../itemUtils.js";
import { type IUiMenuItem } from "../types.js";

describe("itemUtils", () => {
    // Mock data for testing
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
            // @ts-expect-error Unknown
            expect(result).toEqual(mockItems[4].subItems?.[0]);
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
            // @ts-expect-error Unknown
            expect(result).toEqual(mockItems[4].subItems?.[0]);
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
            // @ts-expect-error Unknown
            expect(result).toEqual(mockItems[4].subItems?.[0]);
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
            // @ts-expect-error Unknown
            expect(result).toEqual(mockItems[4].subItems?.[0]);
        });
    });

    describe("getItemsByParent", () => {
        it("should get items in a submenu by parent id", () => {
            const result = getItemsByInteractiveParent(mockItems, "item4");
            // @ts-expect-error Unknown
            expect(result).toEqual(mockItems[4].subItems);
        });

        it("should return undefined if parent item not found", () => {
            const result = getItemsByInteractiveParent(mockItems, "nonexistent");
            expect(result).toBeUndefined();
        });

        it("should return undefined if parent item has no submenu", () => {
            const result = getItemsByInteractiveParent(mockItems, "item1");
            expect(result).toBeUndefined();
        });

        it("should return top-level items if parentId is undefined", () => {
            const result = getItemsByInteractiveParent(mockItems, undefined);
            expect(result).toEqual(mockItems);
        });
    });

    describe("getItemParent", () => {
        it("should get the parent of an item in a submenu", () => {
            const result = getItemInteractiveParent(mockItems, "subitem1");
            expect(result).toEqual(mockItems[4]);
        });

        it("should return undefined if item not found", () => {
            const result = getItemInteractiveParent(mockItems, "nonexistent");
            expect(result).toBeUndefined();
        });

        it("should return undefined for top-level items", () => {
            const result = getItemInteractiveParent(mockItems, "item1");
            expect(result).toBeUndefined();
        });
    });

    describe("getNextSiblings", () => {
        it("should get next siblings in the root menu level with wraparound", () => {
            const results = getNextSiblings(mockItems, "item1");
            // Expect all items except item1, starting from item2 and wrapping around
            expect(results).toEqual([mockItems[1], mockItems[2], mockItems[3], mockItems[4], mockItems[5]]);
        });

        it("should get next siblings in a submenu with wraparound", () => {
            const results = getNextSiblings(mockItems, "subitem1");
            // Expect all submenu items except subitem1, starting from the next item
            // @ts-expect-error Unknown
            expect(results).toEqual([mockItems[4].subItems?.[1], mockItems[4].subItems?.[2]]);
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
            expect(results).toEqual([mockItems[3], mockItems[2], mockItems[1], mockItems[0], mockItems[5]]);
        });

        it("should get previous siblings in a submenu with wraparound", () => {
            const results = getPreviousSiblings(mockItems, "subitem2");
            // Expect all submenu items except subitem2, starting from the previous item and going backwards
            // @ts-expect-error Unknown
            expect(results).toEqual([mockItems[4].subItems?.[1], mockItems[4].subItems?.[0]]);
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
            // @ts-expect-error Unknown
            expect(result).toEqual(mockItems[4].subItems);
        });

        it("should return undefined if item not found", () => {
            const result = getSiblingItems(mockItems, "nonexistent");
            expect(result).toBeUndefined();
        });
    });

    describe("unwrapGroupItems", () => {
        it("should unwrap group items", () => {
            const result = unwrapGroupItems(mockItems);

            // Should include all items except the group item itself
            // @ts-expect-error Unknown
            expect(result).toHaveLength(mockItems.length - 1 + mockItems[5].subItems.length);

            // Should include the group items
            // @ts-expect-error Unknown
            expect(result).toContainEqual(mockItems[5].subItems[0]);
            // @ts-expect-error Unknown
            expect(result).toContainEqual(mockItems[5].subItems[1]);

            // Should not include the group item itself
            expect(result).not.toContainEqual(mockItems[5]);
        });

        it("should handle nested group items", () => {
            const nestedItems: IUiMenuItem[] = [
                { type: "interactive", id: "item1", stringTitle: "Item 1", data: "data1" },
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
                            type: "group",
                            id: "nestedgroup",
                            stringTitle: "Nested Group",
                            data: "Nested Group title",
                            subItems: [
                                {
                                    type: "interactive",
                                    id: "nesteditem1",
                                    stringTitle: "Nested Item 1",
                                    data: "nesteddata1",
                                },
                                {
                                    type: "interactive",
                                    id: "nesteditem2",
                                    stringTitle: "Nested Item 2",
                                    data: "nesteddata2",
                                },
                            ],
                        },
                    ],
                },
            ];

            const result = unwrapGroupItems(nestedItems);

            // Should include all items except the group items themselves
            expect(result).toHaveLength(4); // item1, groupitem1, nesteditem1, nesteditem2

            // Should include the nested group items
            expect(result.some((item) => item.id === "nesteditem1")).toBe(true);
            expect(result.some((item) => item.id === "nesteditem2")).toBe(true);

            // Should not include any group items
            expect(result.some((item) => item.type === "group")).toBe(false);
        });

        it("should handle items with only group items at top level", () => {
            // Create a list with only group items at the top level
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

            const result = unwrapGroupItems(onlyGroupItems);

            // Should include all interactive items from all groups
            expect(result).toHaveLength(4); // group1item1, group1item2, group2item1, group2item2

            // Should include all the group items' children
            expect(result.some((item) => item.id === "group1item1")).toBe(true);
            expect(result.some((item) => item.id === "group1item2")).toBe(true);
            expect(result.some((item) => item.id === "group2item1")).toBe(true);
            expect(result.some((item) => item.id === "group2item2")).toBe(true);

            // Should not include any group items
            expect(result.some((item) => item.type === "group")).toBe(false);

            // First item should be the first item from the first group
            expect(result[0].id).toBe("group1item1");

            // Last item should be the last item from the last group
            expect(result[result.length - 1].id).toBe("group2item2");
        });

        it("should preserve interactive items with subItems", () => {
            const result = unwrapGroupItems(mockItems);

            // Should include item4 with its subItems
            const item4 = result.find((item) => item.id === "item4");
            expect(item4).toBeDefined();
            expect(item4?.type).toBe("interactive");
            // @ts-expect-error Unknown
            expect(item4?.subItems).toBeDefined();
            // @ts-expect-error Unknown
            expect(item4?.subItems?.length).toBe(3);
        });
    });

    describe("getClosestFocusableSibling", () => {
        const isItemFocusable = (item: IUiMenuItem) => item.type === "interactive" && !item.isDisabled;

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
            // @ts-expect-error Unknown
            expect(result).toEqual(mockItems[5].subItems[1]); // groupitem2
        });

        it("should wrap around to the beginning if no focusable item found after the current item", () => {
            const result = getClosestFocusableSibling({
                items: mockItems,
                isItemFocusable,
                itemId: "groupitem2", // last interactive item
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
            // @ts-expect-error Unknown
            expect(result).toEqual(mockItems[5].subItems[1]); // last group item
        });

        it("should navigate through group items", () => {
            const result = getClosestFocusableSibling({
                items: mockItems,
                isItemFocusable,
                itemId: "item4", // last item before group
                direction: "forward",
            });

            // Should find the first group item when navigating forward from item4
            expect(result?.id).toBe("groupitem1");
        });

        it("should return undefined if no focusable items exist", () => {
            // Create a list with only disabled items
            const disabledItems: IUiMenuItem[] = [
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

        it("should navigate correctly when top level only contains group items", () => {
            // Create a list with only group items at the top level
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

            // Test forward navigation from undefined (initial focus)
            const firstFocusable = getClosestFocusableSibling({
                items: onlyGroupItems,
                isItemFocusable,
                itemId: undefined,
                direction: "forward",
            });
            expect(firstFocusable?.id).toBe("group1item1");

            // Test backward navigation from undefined (initial focus)
            const lastFocusable = getClosestFocusableSibling({
                items: onlyGroupItems,
                isItemFocusable,
                itemId: undefined,
                direction: "backward",
            });
            expect(lastFocusable?.id).toBe("group2item2");

            // Test forward navigation from first item
            const nextFromFirst = getClosestFocusableSibling({
                items: onlyGroupItems,
                isItemFocusable,
                itemId: "group1item1",
                direction: "forward",
            });
            expect(nextFromFirst?.id).toBe("group1item2");

            // Test forward navigation from last item in first group
            const nextFromLastInFirstGroup = getClosestFocusableSibling({
                items: onlyGroupItems,
                isItemFocusable,
                itemId: "group1item2",
                direction: "forward",
            });
            expect(nextFromLastInFirstGroup?.id).toBe("group2item1");

            // Test backward navigation from first item in second group
            const prevFromFirstInSecondGroup = getClosestFocusableSibling({
                items: onlyGroupItems,
                isItemFocusable,
                itemId: "group2item1",
                direction: "backward",
            });
            expect(prevFromFirstInSecondGroup?.id).toBe("group1item2");
        });
    });
});

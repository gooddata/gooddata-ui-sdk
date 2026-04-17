// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ICatalogItem } from "../types.js";
import { useCatalogItemRemoveCallback, useCatalogItemUpdateCallback } from "../useCatalogItemMutations.js";

const itemA: ICatalogItem = {
    identifier: "item.a",
    type: "parameter",
    title: "Item A",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    definition: { type: "NUMBER", defaultValue: 1 },
};

const itemB: ICatalogItem = {
    ...itemA,
    identifier: "item.b",
    title: "Item B",
    definition: { type: "NUMBER", defaultValue: 2 },
};

describe("useCatalogItemMutations", () => {
    it("updates matching items in endpoint cache and visible list", () => {
        const endpointItems: { current: ICatalogItem[][] } = { current: [[itemA, itemB]] };
        const firstEndpointItems = endpointItems.current[0];
        let renderedItems: ICatalogItem[] = [itemA, itemB];
        const setItems = (nextValue: ICatalogItem[] | ((items: ICatalogItem[]) => ICatalogItem[])) => {
            renderedItems = typeof nextValue === "function" ? nextValue(renderedItems) : nextValue;
        };

        const updatedItemA: ICatalogItem = { ...itemA, title: "Updated Item A" };

        const { result } = renderHook(() => useCatalogItemUpdateCallback(endpointItems, setItems));

        act(() => {
            result.current(updatedItemA);
        });

        expect(endpointItems.current).toEqual([[updatedItemA, itemB]]);
        expect(endpointItems.current[0]).toBe(firstEndpointItems);
        expect(renderedItems).toEqual([updatedItemA, itemB]);
    });

    it("removes matching items from endpoint cache and visible list", () => {
        const endpointItems: { current: ICatalogItem[][] } = { current: [[itemA, itemB]] };
        const firstEndpointItems = endpointItems.current[0];
        let renderedItems: ICatalogItem[] = [itemA, itemB];
        let totalCounts = [2];
        const setItems = (nextValue: ICatalogItem[] | ((items: ICatalogItem[]) => ICatalogItem[])) => {
            renderedItems = typeof nextValue === "function" ? nextValue(renderedItems) : nextValue;
        };
        const setTotalCounts = (nextValue: number[] | ((counts: number[]) => number[])) => {
            totalCounts = typeof nextValue === "function" ? nextValue(totalCounts) : nextValue;
        };

        const { result } = renderHook(() =>
            useCatalogItemRemoveCallback(endpointItems, setItems, setTotalCounts),
        );

        act(() => {
            result.current(itemA);
        });

        expect(endpointItems.current).toEqual([[itemB]]);
        expect(endpointItems.current[0]).toBe(firstEndpointItems);
        expect(renderedItems).toEqual([itemB]);
        expect(totalCounts).toEqual([1]);
    });
});

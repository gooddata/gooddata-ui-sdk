// (C) 2025 GoodData Corporation
import { describe, it, expect } from "vitest";
import { itemsSlideTransformer } from "../itemsSlideTransformer.js";
import { IDashboardLayoutItem } from "@gooddata/sdk-model";

const widget1 = {
    size: {
        xl: {
            gridWidth: 4,
            gridHeight: 4,
        },
    },
    type: "IDashboardLayoutItem",
    widget: {
        type: "insight",
        insight: { type: "insight", identifier: "test1" },
        ref: { type: "insight", identifier: "test1" },
        identifier: "test1",
        drills: [],
    },
};
const widget2 = {
    size: {
        xl: {
            gridWidth: 4,
            gridHeight: 4,
        },
    },
    type: "IDashboardLayoutItem",
    widget: {
        type: "insight",
        insight: { type: "insight", identifier: "test2" },
        ref: { type: "insight", identifier: "test2" },
        identifier: "test2",
        drills: [],
    },
};

describe("ItemsSlideTransformer", () => {
    it("no items", () => {
        const data = itemsSlideTransformer(
            {
                type: "IDashboardLayoutSection",
                items: [],
            },
            (item) => [
                {
                    type: "IDashboardLayoutSection",
                    items: [item],
                },
            ],
        );

        expect(data).toBe(undefined);
    });

    it("filled items", () => {
        const data = itemsSlideTransformer(
            {
                type: "IDashboardLayoutSection",
                items: [
                    widget1 as unknown as IDashboardLayoutItem,
                    widget2 as unknown as IDashboardLayoutItem,
                ],
            },
            (item) => [
                {
                    type: "IDashboardLayoutSection",
                    items: [item],
                },
            ],
        );

        expect(data).toMatchSnapshot();
    });
});

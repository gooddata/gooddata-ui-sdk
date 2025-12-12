// (C) 2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { type IDashboardLayoutItem } from "@gooddata/sdk-model";

import { itemsSlideTransformer } from "../itemsSlideTransformer.js";

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

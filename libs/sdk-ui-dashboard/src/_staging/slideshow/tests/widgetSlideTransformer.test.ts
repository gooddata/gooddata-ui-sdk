// (C) 2025 GoodData Corporation
import { describe, it, expect } from "vitest";
import { IDashboardLayoutItem } from "@gooddata/sdk-model";
import { widgetSlideTransformer } from "../widgetSlideTransformer.js";

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
const base = {
    gridWidth: 12,
    gridHeight: 22,
};

describe("WidgetSlideTransformer", () => {
    it("always transform", () => {
        const data = widgetSlideTransformer(widget1 as unknown as IDashboardLayoutItem);

        expect(data).toEqual([
            {
                items: [
                    {
                        ...widget1,
                        size: {
                            xl: base,
                            lg: base,
                            xs: base,
                            sm: base,
                            md: base,
                        },
                    },
                ],
                type: "IDashboardLayoutSection",
            },
        ]);
    });
});

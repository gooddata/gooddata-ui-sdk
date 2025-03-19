// (C) 2025 GoodData Corporation
import { describe, it, expect } from "vitest";
import { switcherSlideTransformer } from "../switcherSlideTransformer";
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
const switcher1 = {
    size: {
        xl: {
            gridWidth: 4,
            gridHeight: 4,
        },
    },
    type: "IDashboardLayoutItem",
    widget: {
        type: "visualizationSwitcher",
        visualizations: [widget1, widget2],
        ref: { type: "insight", identifier: "switcher1" },
    },
};
const base = {
    gridWidth: 12,
    gridHeight: 22,
};

describe("SwitcherSlideTransformer", () => {
    it("no switcher", () => {
        const data = switcherSlideTransformer(widget1 as IDashboardLayoutItem);

        expect(data).toBe(undefined);
    });

    it("switcher", () => {
        const data = switcherSlideTransformer(switcher1 as unknown as IDashboardLayoutItem);

        expect(data).toMatchSnapshot();
    });
});

// (C) 2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { IDashboardLayoutItem } from "@gooddata/sdk-model";

import { switcherSlideTransformer } from "../switcherSlideTransformer.js";

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

describe("SwitcherSlideTransformer", () => {
    it("no switcher", () => {
        const data = switcherSlideTransformer(widget1 as unknown as IDashboardLayoutItem);

        expect(data).toBe(undefined);
    });

    it("switcher", () => {
        const data = switcherSlideTransformer(switcher1 as unknown as IDashboardLayoutItem);

        expect(data).toMatchSnapshot();
    });
});

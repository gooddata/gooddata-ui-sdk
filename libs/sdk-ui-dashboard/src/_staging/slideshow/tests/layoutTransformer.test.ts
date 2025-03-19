// (C) 2025 GoodData Corporation
import { describe, it, expect } from "vitest";
import { IDashboardLayout } from "@gooddata/sdk-model";
import { layoutTransformer } from "../layoutTransformer";

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
const layout = {
    type: "IDashboardLayout",
    sections: [],
    size: {
        gridHeight: 20,
        gridWidth: 12,
    },
};

const base = {
    gridWidth: 12,
    gridHeight: 22,
};

describe("LayoutTransformer", () => {
    it("empty layout", () => {
        const data = layoutTransformer(layout as IDashboardLayout);

        expect(data).toEqual({
            type: "IDashboardLayout",
            sections: [],
            size: {
                gridHeight: 20,
                gridWidth: 12,
            },
        });
    });

    it("filled layout", () => {
        const data = layoutTransformer({
            ...layout,
            sections: [
                {
                    header: {
                        title: "Section 1",
                        description: "Section 1 description",
                    },
                    type: "IDashboardLayoutSection",
                    items: [widget1],
                },
                {
                    type: "IDashboardLayoutSection",
                    items: [widget2],
                },
            ],
        } as IDashboardLayout);

        expect(data).toMatchSnapshot();
    });
});

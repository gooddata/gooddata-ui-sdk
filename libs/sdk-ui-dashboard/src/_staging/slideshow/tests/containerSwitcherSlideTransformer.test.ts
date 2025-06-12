// (C) 2025 GoodData Corporation
import { describe, it, expect } from "vitest";
import { containerSwitcherSlideTransformer } from "../containerSwitcherSlideTransformer";
import { sectionLayoutSection } from "../sectionSlideTransformer";
import { IDashboardLayoutItem } from "@gooddata/sdk-model";

const base = {
    gridHeight: 22,
    gridWidth: 12,
};
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
            gridWidth: 8,
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
const richText = {
    size: {
        xl: {
            gridWidth: 4,
            gridHeight: 4,
        },
    },
    type: "IDashboardLayoutItem",
    widget: {
        type: "richText",
        content: "This is rich text",
        title: "",
        description: "",
        ignoreDashboardFilters: false,
        drills: [],
        ref: { type: "insight", identifier: "" },
        uri: "",
        identifier: "",
    },
};
const section = {
    type: "IDashboardLayoutItem",
    widget: {
        type: "IDashboardLayout",
        sections: [
            {
                type: "IDashboardLayoutSection",
                items: [switcher1, richText],
            },
        ],
    },
    size: {
        xl: base,
    },
} as unknown as IDashboardLayoutItem;

describe("ContainerSwitcherSlideTransformer", () => {
    it("no layout widget", () => {
        const data = containerSwitcherSlideTransformer(
            {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridWidth: 4,
                        gridHeight: 4,
                    },
                },
                widget: {},
            },
            sectionLayoutSection,
        );

        expect(data).toBe(undefined);
    });

    it("section with 1 switcher and rich text", () => {
        const data = containerSwitcherSlideTransformer(section, sectionLayoutSection);

        expect(data).toMatchSnapshot();
    });
});

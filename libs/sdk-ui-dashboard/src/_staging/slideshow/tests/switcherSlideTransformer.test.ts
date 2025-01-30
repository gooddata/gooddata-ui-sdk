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

describe("SwitcherSlideTransformer", () => {
    it("no switcher", () => {
        const data = switcherSlideTransformer(widget1 as IDashboardLayoutItem);

        expect(data).toBe(undefined);
    });

    it("switcher", () => {
        const data = switcherSlideTransformer(switcher1 as unknown as IDashboardLayoutItem);

        expect(data).toEqual([
            {
                items: [
                    {
                        size: {
                            xl: {
                                gridHeight: 4,
                                gridWidth: 12,
                            },
                        },
                        type: "IDashboardLayoutItem",
                        widget: {
                            size: {
                                xl: {
                                    gridHeight: 4,
                                    gridWidth: 4,
                                },
                            },
                            type: "IDashboardLayoutItem",
                            widget: {
                                drills: [],
                                identifier: "test1",
                                insight: {
                                    identifier: "test1",
                                    type: "insight",
                                },
                                ref: {
                                    identifier: "test1",
                                    type: "insight",
                                },
                                type: "insight",
                            },
                        },
                    },
                ],
                type: "IDashboardLayoutSection",
            },
            {
                items: [
                    {
                        size: {
                            xl: {
                                gridHeight: 4,
                                gridWidth: 12,
                            },
                        },
                        type: "IDashboardLayoutItem",
                        widget: {
                            size: {
                                xl: {
                                    gridHeight: 4,
                                    gridWidth: 4,
                                },
                            },
                            type: "IDashboardLayoutItem",
                            widget: {
                                drills: [],
                                identifier: "test2",
                                insight: {
                                    identifier: "test2",
                                    type: "insight",
                                },
                                ref: {
                                    identifier: "test2",
                                    type: "insight",
                                },
                                type: "insight",
                            },
                        },
                    },
                ],
                type: "IDashboardLayoutSection",
            },
        ]);
    });
});

// (C) 2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { containerSlideTransformer } from "../containerSlideTransformer.js";
import { sectionLayoutSection } from "../sectionSlideTransformer.js";

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

describe("ContainerSlideTransformer", () => {
    it("no layout widget", () => {
        const data = containerSlideTransformer(
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

    it("no items in container", () => {
        const data = containerSlideTransformer(
            {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridWidth: 4,
                        gridHeight: 4,
                    },
                },
                widget: {
                    type: "IDashboardLayout",
                    sections: [],
                    size: {
                        xl: {
                            gridWidth: 4,
                            gridHeight: 4,
                        },
                    },
                    configuration: {},
                },
            },
            sectionLayoutSection,
        );

        expect(data).toMatchSnapshot();
    });

    it("simple items in container, keep it as is", () => {
        const data = containerSlideTransformer(
            {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridWidth: 4,
                        gridHeight: 4,
                    },
                },
                widget: {
                    type: "IDashboardLayout",
                    sections: [
                        {
                            header: {
                                title: "Title",
                                description: "Description",
                            },
                            items: [widget1, widget2],
                            type: "IDashboardLayoutSection",
                        },
                    ],
                    size: {
                        xl: {
                            gridWidth: 4,
                            gridHeight: 4,
                        },
                    },
                    configuration: {},
                },
            },
            sectionLayoutSection,
        );

        expect(data).toMatchSnapshot();
    });

    it("visualisation switcher item in container, convert to flat", () => {
        const data = containerSlideTransformer(
            {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridWidth: 4,
                        gridHeight: 4,
                    },
                },
                widget: {
                    type: "IDashboardLayout",
                    sections: [
                        {
                            header: {
                                title: "Title",
                                description: "Description",
                            },
                            items: [switcher1],
                            type: "IDashboardLayoutSection",
                        },
                    ],
                    size: {
                        xl: {
                            gridWidth: 4,
                            gridHeight: 4,
                        },
                    },
                    configuration: {},
                },
            },
            sectionLayoutSection,
        );

        expect(data).toMatchSnapshot();
    });
});

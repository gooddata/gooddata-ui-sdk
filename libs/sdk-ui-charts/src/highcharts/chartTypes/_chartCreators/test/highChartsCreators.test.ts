// (C) 2007-2021 GoodData Corporation
import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { getHighchartsOptions } from "../highChartsCreators.js";
import { VisualizationTypes, IDrillConfig } from "@gooddata/sdk-ui";
import { supportedDualAxesChartTypes } from "../../_chartOptions/chartCapabilities.js";
import { describe, it, expect } from "vitest";

const dataView = dummyDataView({
    attributes: [],
    buckets: [],
    dimensions: [],
    filters: [],
    measures: [],
    sortBy: [],
    workspace: "",
});

const drillConfig: IDrillConfig = {
    dataView,
    onDrill: (f: any) => f,
};

const chartOptions = {
    data: {
        series: [
            {
                isDrillable: false,
                name: "aa",
                data: [
                    {
                        name: "aa.0",
                    },
                    null,
                ],
                color: "rgb(20,178,226)",
            },
            {
                isDrillable: true,
                name: "bb",
                data: [
                    {
                        name: "bb.0",
                    },
                    null,
                ],
                color: "rgb(0,193,141)",
            },
        ],
    },
};

const pieChartOrTreemapOptions = {
    type: VisualizationTypes.PIE,
    data: {
        series: [
            {
                name: "aa",
                data: [
                    {
                        name: "aa.0",
                        drilldown: false,
                    },
                    {
                        name: "bb.0",
                        drilldown: true,
                    },
                ],
            },
        ],
    },
};

const comboChartOptions = {
    type: VisualizationTypes.COMBO,
    data: {
        series: [
            {
                isDrillable: false,
                name: "aa",
                data: [
                    {
                        name: "aa.0",
                    },
                    null,
                ],
                color: "rgb(20, 178, 226)",
            },
            {
                isDrillable: true,
                type: "line",
                name: "bb",
                data: [
                    {
                        name: "bb.0",
                    },
                    null,
                ],
                color: "rgb(0,193,141)",
            },
        ],
    },
};

describe("highChartCreators", () => {
    describe("Line chart configuration", () => {
        const config = getHighchartsOptions({ ...chartOptions, type: VisualizationTypes.LINE }, drillConfig);

        it("contains styles for drillable", () => {
            expect(config).toHaveProperty("series.0.states.hover.halo.size", 0);

            expect(config).not.toHaveProperty("series.0.marker.states.hover.fillColor");
            expect(config).not.toHaveProperty("series.0.cursor");
        });

        it("contains styles for non-drillable", () => {
            expect(config).not.toHaveProperty("series.1.states.hover.halo.size");

            expect(config).toHaveProperty("series.1.marker.states.hover.fillColor", "rgb(26,199,152)");
        });
    });

    describe("Area chart configuration", () => {
        const config = getHighchartsOptions({ ...chartOptions, type: VisualizationTypes.AREA }, drillConfig);

        it("contains styles for drillable", () => {
            expect(config).toHaveProperty("series.0.states.hover.halo.size", 0);

            expect(config).not.toHaveProperty("series.0.marker.states.hover.fillColor");
            expect(config).not.toHaveProperty("series.0.cursor");
        });

        it("contains styles for non-drillable", () => {
            expect(config).not.toHaveProperty("series.1.states.hover.halo.size");

            expect(config).toHaveProperty("series.1.marker.states.hover.fillColor", "rgb(26,199,152)");
        });
    });

    describe("Column chart configuration", () => {
        const config = getHighchartsOptions(
            { ...chartOptions, type: VisualizationTypes.COLUMN },
            drillConfig,
        );

        it("contains styles for drillable and non-drillable", () => {
            expect(config).toHaveProperty("series.0.states.hover.brightness");
            expect(config).toHaveProperty("series.0.states.hover.enabled", false);
            expect(config).toHaveProperty("series.1.states.hover.enabled", true);
        });
    });

    describe("Column chart stacked configuration", () => {
        const config = getHighchartsOptions(
            { ...chartOptions, type: VisualizationTypes.COLUMN, stacking: "normal" },
            drillConfig,
        );

        it("contains drilldown label styles", () => {
            expect(config).toHaveProperty("drilldown.activeDataLabelStyle.color");
        });
    });

    describe("Bar chart configuration", () => {
        const config = getHighchartsOptions({ ...chartOptions, type: VisualizationTypes.BAR }, drillConfig);

        it("contains styles for drillable and non-drillable", () => {
            expect(config).toHaveProperty("series.0.states.hover.brightness");
            expect(config).toHaveProperty("series.0.states.hover.enabled", false);
            expect(config).toHaveProperty("series.1.states.hover.enabled", true);
        });
    });

    describe("Pie chart configuration", () => {
        const config = getHighchartsOptions(pieChartOrTreemapOptions, drillConfig);

        it("contains styles for drillable and non-drillable", () => {
            expect(config).toHaveProperty("series.0.data.0.states.hover.brightness");
            expect(config).toHaveProperty("series.0.data.0.halo.size", 0);
            expect(config).not.toHaveProperty("series.0.data.1.halo.size");
        });
    });

    describe("Treemap configuration", () => {
        const config = getHighchartsOptions(pieChartOrTreemapOptions, drillConfig);

        it("contains styles for drillable and non-drillable", () => {
            expect(config).toHaveProperty("series.0.data.0.states.hover.brightness");
            expect(config).toHaveProperty("series.0.data.0.halo.size", 0);
            expect(config).not.toHaveProperty("series.0.data.1.halo.size");
        });
    });

    describe("Combo chart configuration", () => {
        const config = getHighchartsOptions(comboChartOptions, drillConfig);

        it("contains different hover styles for column and line series", () => {
            expect(config).toHaveProperty("series.0.states.hover.brightness");
            expect(config).toHaveProperty("series.0.states.hover.enabled", false);
        });
    });

    describe("Render event configuration", () => {
        const getConfig = (type: string) => getHighchartsOptions({ ...chartOptions, type }, drillConfig);

        it("encountered a declaration exception", () => {
            supportedDualAxesChartTypes.forEach((type: string) => {
                const config = getConfig(type);
                expect(config.chart.events.render).toBeTruthy();
            });
        });

        it("should other charts not be registered render event", () => {
            // Bubble chart is an example, as long as it's not dual axis charts
            const config = getConfig(VisualizationTypes.BUBBLE);
            expect(config.chart.events.render).toBeFalsy();
        });
    });
});

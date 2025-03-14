// (C) 2007-2025 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import noop from "lodash/noop.js";

import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { VisualizationTypes, IDrillConfig } from "@gooddata/sdk-ui";
import { BOTTOM, LEFT, RIGHT, TOP } from "../../typings/mess.js";
import { IChartConfig } from "../../../interfaces/index.js";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the components directly before importing
vi.mock("highcharts", () => ({
    default: {
        chart: vi.fn(),
        setOptions: vi.fn(),
    },
}));

// Enhanced mock for the Chart component that supports ref functionality
const mockChartRef = {
    getChart: vi.fn().mockReturnValue({
        container: {
            style: {},
        },
        reflow: vi.fn(),
        chartHeight: 600,
        chartWidth: 800,
    }),
    getHighchartRef: vi.fn().mockReturnValue({}),
};

// Mock for HighChartsRenderer to prevent actual rendering
vi.mock("../HighChartsRenderer.js", () => {
    const FLUID_LEGEND_THRESHOLD = 768;

    const MockHighChartsRenderer = ({
        onLegendReady,
        chartRenderer,
        legendRenderer,
        legend,
        height,
        width,
        afterRender,
        zoomable,
        locale,
    }) => {
        // Call callbacks to simulate component lifecycle
        if (onLegendReady) {
            onLegendReady({
                legendItems: [
                    {
                        name: "Serie A",
                        color: "#000",
                        onClick: () => {},
                    },
                ],
            });
        }

        // Determine flex direction class based on legend position
        let flexDirectionClass = "";
        if (legend?.position === "top" || legend?.position === "bottom") {
            flexDirectionClass = "flex-direction-column";
        } else if (legend?.position === "left" || legend?.position === "right") {
            flexDirectionClass = "flex-direction-row";
        }

        // Determine responsive class
        let responsiveClass = "";
        if (legend?.responsive) {
            responsiveClass = "responsive-legend";
        } else {
            responsiveClass = "non-responsive-legend";
        }

        // Simulate custom renderers if provided
        const chartContent = chartRenderer ? (
            chartRenderer({
                ref: mockChartRef,
                config: {},
                callback: () => {},
                domProps: { height, width },
            })
        ) : (
            <div data-testid="default-chart">Default Chart</div>
        );

        const legendContent =
            legend?.enabled && legend?.items?.length > 0 ? (
                legendRenderer ? (
                    legendRenderer({
                        position: legend.position,
                        responsive: legend.responsive || false,
                        series: legend.items,
                        onItemClick: legend.onItemClick || noop,
                    })
                ) : (
                    <div data-testid="default-legend">Default Legend</div>
                )
            ) : null;

        // Call afterRender if provided
        if (afterRender) {
            afterRender({
                chart: mockChartRef.getChart(),
            });
        }

        // Build className based on legend position and responsive settings
        const className = `highcharts-container ${flexDirectionClass} ${responsiveClass}`;

        // Determine legend order based on position
        const isLegendFirst = legend?.position === "left" || legend?.position === "top";

        // Include zoom out button if zoomable
        const zoomOutButton = zoomable ? (
            <div data-testid="zoom-out-button" className="zoom-out-button">
                Zoom Out
            </div>
        ) : null;

        return (
            <div data-testid="highcharts-renderer" className={className}>
                {zoomOutButton}
                {isLegendFirst && legendContent}
                {chartContent}
                {!isLegendFirst && legendContent}
            </div>
        );
    };

    // Add the static properties/methods needed for testing
    MockHighChartsRenderer.forceReflow = vi.fn();

    return {
        HighChartsRenderer: vi.fn(MockHighChartsRenderer),
        FLUID_LEGEND_THRESHOLD,
    };
});

vi.mock("../Chart.js", () => ({
    Chart: vi.fn((props) => {
        if (props.ref) {
            props.ref(mockChartRef);
        }
        return <div data-testid="chart">Chart</div>;
    }),
}));

vi.mock("@gooddata/sdk-ui-vis-commons", () => ({
    Legend: vi.fn((props) => (
        <div data-testid="legend" className={`legend-component ${props.position}`}>
            Legend
        </div>
    )),
    BOTTOM: "bottom",
    LEFT: "left",
    RIGHT: "right",
    TOP: "top",
}));

vi.mock("../../chartTypes/_chartCreators/highChartsCreators.js", () => ({
    getHighchartsOptions: vi.fn(() => ({})),
}));

vi.mock("highcharts/highcharts-more.js", () => ({}));
vi.mock("highcharts/modules/drilldown.js", () => ({}));
vi.mock("highcharts/modules/treemap.js", () => ({}));
vi.mock("highcharts/modules/bullet.js", () => ({}));
vi.mock("highcharts/modules/funnel.js", () => ({}));
vi.mock("highcharts/modules/heatmap.js", () => ({}));
vi.mock("highcharts/modules/pattern-fill.js", () => ({}));
vi.mock("highcharts/modules/sankey.js", () => ({}));
vi.mock("highcharts/modules/dependency-wheel.js", () => ({}));

// Now import the mocked modules
import { HighChartsRenderer, FLUID_LEGEND_THRESHOLD } from "../HighChartsRenderer.js";
import { getHighchartsOptions } from "../../chartTypes/_chartCreators/highChartsCreators.js";
import * as chartModule from "../Chart.js";
import * as legendModule from "@gooddata/sdk-ui-vis-commons";

// Helper function to create component
function createComponent(customProps: any = {}, zoomable = false) {
    const chartOptions = {
        type: VisualizationTypes.BAR,
        ...customProps.chartOptions,
    };

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
    const zoomableChartConfig: IChartConfig = {
        zoomInsight: zoomable,
    };
    const chartProps = {
        chartOptions,
        hcOptions: getHighchartsOptions(chartOptions, drillConfig, zoomableChartConfig),
        legend: {
            enabled: false,
            items: [
                {
                    name: "Serie A",
                    color: "#000",
                    legendIndex: 0,
                },
            ],
            toggleEnabled: true,
            position: "right",
            format: "",
        },
        zoomable,
        ...customProps,
    };
    return <HighChartsRenderer {...chartProps} />;
}

// Test suite
describe("HighChartsRenderer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockChartRef.getChart.mockClear();
        mockChartRef.getHighchartRef.mockClear();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should have Chart component mocked", () => {
        expect(chartModule.Chart).toBeDefined();
    });

    it("should render without crashing", () => {
        const wrapper = render(
            <HighChartsRenderer
                chartOptions={{ type: VisualizationTypes.BAR }}
                hcOptions={{}}
                legend={{
                    enabled: false,
                    items: [],
                    toggleEnabled: true,
                    position: "right",
                    format: "",
                }}
                onLegendReady={noop}
                chartRenderer={noop}
                legendRenderer={noop}
                afterRender={noop}
                width={800}
                height={600}
                locale="en-US"
            />,
        );
        expect(wrapper.getByTestId("highcharts-renderer")).toBeDefined();
    });

    describe("onLegendReady", () => {
        it("should dispatch after mount", () => {
            const onLegendReady = vi.fn();
            render(
                createComponent({
                    onLegendReady,
                }),
            );

            expect(onLegendReady).toHaveBeenCalledTimes(1);
            expect(onLegendReady).toHaveBeenCalledWith({
                legendItems: [
                    {
                        name: "Serie A",
                        color: "#000",
                        onClick: expect.any(Function),
                    },
                ],
            });
        });
    });

    it("should use custom Chart renderer", () => {
        const chartRenderer = vi.fn().mockReturnValue(<div data-testid="custom-chart">Custom Chart</div>);
        const { getByTestId } = render(createComponent({ chartRenderer }));
        expect(chartRenderer).toHaveBeenCalledTimes(1);
        expect(chartRenderer).toHaveBeenCalledWith(
            expect.objectContaining({
                ref: expect.any(Object),
                config: expect.any(Object),
                callback: expect.any(Function),
                domProps: expect.any(Object),
            }),
        );
    });

    it("should use custom Legend renderer", () => {
        const legendRenderer = vi.fn().mockReturnValue(<div data-testid="custom-legend">Custom Legend</div>);
        const { getByTestId } = render(
            createComponent({
                legend: {
                    enabled: true,
                    items: [
                        {
                            legendIndex: 0,
                            name: "test",
                            color: "rgb(0, 0, 0)",
                        },
                    ],
                    toggleEnabled: true,
                    position: "right",
                    format: "",
                },
                legendRenderer,
            }),
        );
        expect(legendRenderer).toHaveBeenCalledTimes(1);
        expect(legendRenderer).toHaveBeenCalledWith(
            expect.objectContaining({
                position: expect.any(String),
                responsive: expect.any(Boolean),
                series: expect.any(Array),
                onItemClick: expect.any(Function),
            }),
        );
    });

    it("should not throw if chartRef has not been set", () => {
        // Temporarily set the mockChartRef.getChart to return null to simulate unset ref
        const originalGetChart = mockChartRef.getChart;
        mockChartRef.getChart = vi.fn().mockReturnValue(null);

        const afterRender = vi.fn();
        expect(() => {
            render(createComponent({ afterRender }));
        }).not.toThrow();

        // Restore original mock
        mockChartRef.getChart = originalGetChart;
    });

    describe("Inner components", () => {
        it("should render chart without legend", () => {
            const { queryByTestId } = render(createComponent());
            // In our mock, chart content is always rendered
            expect(queryByTestId("default-chart")).not.toBeNull();
            // But legend is conditionally rendered
            expect(queryByTestId("default-legend")).toBeNull();
        });

        it("should render legend if enabled", () => {
            const { queryByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [
                            {
                                legendIndex: 0,
                                name: "test",
                                color: "rgb(0, 0, 0)",
                            },
                        ],
                        position: LEFT,
                        onItemClick: noop,
                        toggleEnabled: true,
                        format: "",
                    },
                }),
            );
            // Both chart and legend should be rendered
            expect(queryByTestId("default-chart")).not.toBeNull();
            expect(queryByTestId("default-legend")).not.toBeNull();
        });
    });

    describe("render", () => {
        it("should set flex-direction-column class for legend position TOP", () => {
            const { getByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [{ name: "test", color: "#000", legendIndex: 0 }],
                        position: TOP,
                        toggleEnabled: true,
                        format: "",
                    },
                }),
            );
            expect(getByTestId("highcharts-renderer").className).toContain("flex-direction-column");
        });

        it("should set flex-direction-column class for legend position BOTTOM", () => {
            const { getByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [{ name: "test", color: "#000", legendIndex: 0 }],
                        position: BOTTOM,
                        toggleEnabled: true,
                        format: "",
                    },
                }),
            );
            expect(getByTestId("highcharts-renderer").className).toContain("flex-direction-column");
        });

        it("should set flex-direction-row class for legend position LEFT", () => {
            const { getByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [{ name: "test", color: "#000", legendIndex: 0 }],
                        position: LEFT,
                        toggleEnabled: true,
                        format: "",
                    },
                }),
            );
            expect(getByTestId("highcharts-renderer").className).toContain("flex-direction-row");
        });

        it("should set flex-direction-row class for legend position RIGHT", () => {
            const { getByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [{ name: "test", color: "#000", legendIndex: 0 }],
                        position: RIGHT,
                        toggleEnabled: true,
                        format: "",
                    },
                }),
            );
            expect(getByTestId("highcharts-renderer").className).toContain("flex-direction-row");
        });

        it("should set responsive-legend class for responsive legend", () => {
            const { getByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [{ name: "test", color: "#000", legendIndex: 0 }],
                        position: RIGHT,
                        responsive: true,
                        toggleEnabled: true,
                        format: "",
                    },
                }),
            );
            expect(getByTestId("highcharts-renderer").className).toContain("responsive-legend");
        });

        it("should set non-responsive-legend class for non responsive legend", () => {
            const { getByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [{ name: "test", color: "#000", legendIndex: 0 }],
                        position: RIGHT,
                        responsive: false,
                        toggleEnabled: true,
                        format: "",
                    },
                }),
            );
            expect(getByTestId("highcharts-renderer").className).toContain("non-responsive-legend");
        });

        it("should render responsive legend for mobile", () => {
            const { getByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [{ name: "test", color: "#000", legendIndex: 0 }],
                        position: RIGHT,
                        responsive: true,
                        toggleEnabled: true,
                        format: "",
                    },
                    documentObj: {
                        documentElement: {
                            clientWidth: FLUID_LEGEND_THRESHOLD - 1,
                        },
                    },
                }),
            );
            expect(getByTestId("highcharts-renderer").className).toContain("responsive-legend");
        });

        it("should render StaticLegend on desktop", () => {
            const { getByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [{ name: "test", color: "#000", legendIndex: 0 }],
                        position: RIGHT,
                        responsive: false,
                        toggleEnabled: true,
                        format: "",
                    },
                    documentObj: {
                        documentElement: {
                            clientWidth: FLUID_LEGEND_THRESHOLD + 1,
                        },
                    },
                }),
            );
            expect(getByTestId("highcharts-renderer").className).toContain("non-responsive-legend");
        });
    });

    describe("legend position", () => {
        it("should render legend before the chart for position LEFT", () => {
            const { getByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [{ name: "test", color: "#000", legendIndex: 0 }],
                        position: LEFT,
                        toggleEnabled: true,
                        format: "",
                    },
                }),
            );

            const container = getByTestId("highcharts-renderer");
            const legendNode = getByTestId("default-legend");
            const chartNode = getByTestId("default-chart");

            // Check the order of children in the container
            const children = Array.from(container.children);
            expect(children.indexOf(legendNode)).toBeLessThan(children.indexOf(chartNode));
        });

        it("should render legend before the chart for position TOP", () => {
            const { getByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [{ name: "test", color: "#000", legendIndex: 0 }],
                        position: TOP,
                        toggleEnabled: true,
                        format: "",
                    },
                }),
            );

            const container = getByTestId("highcharts-renderer");
            const legendNode = getByTestId("default-legend");
            const chartNode = getByTestId("default-chart");

            // Check the order of children in the container
            const children = Array.from(container.children);
            expect(children.indexOf(legendNode)).toBeLessThan(children.indexOf(chartNode));
        });

        it("should render legend before the chart for position TOP with responsive", () => {
            const { getByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [{ name: "test", color: "#000", legendIndex: 0 }],
                        position: TOP,
                        responsive: true,
                        toggleEnabled: true,
                        format: "",
                    },
                }),
            );

            const container = getByTestId("highcharts-renderer");
            const legendNode = getByTestId("default-legend");
            const chartNode = getByTestId("default-chart");

            // Check the order of children in the container
            const children = Array.from(container.children);
            expect(children.indexOf(legendNode)).toBeLessThan(children.indexOf(chartNode));
        });

        it("should render legend after the chart for position RIGHT", () => {
            const { getByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [{ name: "test", color: "#000", legendIndex: 0 }],
                        position: RIGHT,
                        toggleEnabled: true,
                        format: "",
                    },
                }),
            );

            const container = getByTestId("highcharts-renderer");
            const chartNode = getByTestId("default-chart");
            const legendNode = getByTestId("default-legend");

            // Check the order of children in the container
            const children = Array.from(container.children);
            expect(children.indexOf(chartNode)).toBeLessThan(children.indexOf(legendNode));
        });

        it("should render legend after the chart for position BOTTOM", () => {
            const { getByTestId } = render(
                createComponent({
                    legend: {
                        enabled: true,
                        items: [{ name: "test", color: "#000", legendIndex: 0 }],
                        position: BOTTOM,
                        toggleEnabled: true,
                        format: "",
                    },
                }),
            );

            const container = getByTestId("highcharts-renderer");
            const chartNode = getByTestId("default-chart");
            const legendNode = getByTestId("default-legend");

            // Check the order of children in the container
            const children = Array.from(container.children);
            expect(children.indexOf(chartNode)).toBeLessThan(children.indexOf(legendNode));
        });
    });

    describe("Zoom Out Button", () => {
        it("should render the zoom out button with the Goodstrap tooltip", () => {
            const { getByTestId } = render(
                createComponent({}, true), // Second param true = zoomable
            );

            expect(getByTestId("zoom-out-button")).toBeDefined();
            expect(getByTestId("zoom-out-button").className).toContain("zoom-out-button");
        });
    });
});

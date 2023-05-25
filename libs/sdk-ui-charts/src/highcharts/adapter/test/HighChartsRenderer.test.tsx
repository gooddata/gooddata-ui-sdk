// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import noop from "lodash/noop.js";

import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";

import { HighChartsRenderer, FLUID_LEGEND_THRESHOLD } from "../HighChartsRenderer.js";
import { getHighchartsOptions } from "../../chartTypes/_chartCreators/highChartsCreators.js";
import * as chartModule from "../Chart.js";
import { VisualizationTypes, IDrillConfig } from "@gooddata/sdk-ui";
import * as legendModule from "@gooddata/sdk-ui-vis-commons";

import { BOTTOM, LEFT, RIGHT, TOP } from "../../typings/mess.js";
import { IChartConfig } from "../../../interfaces/index.js";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

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
        },
        ...customProps,
    };
    return <HighChartsRenderer {...chartProps} />;
}

describe("HighChartsRenderer", () => {
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
        const chartRenderer = vi.fn().mockReturnValue(<div />);
        render(createComponent({ chartRenderer }));
        expect(chartRenderer).toHaveBeenCalledTimes(1);
    });

    it("should use custom Legend renderer", () => {
        const legendRenderer = vi.fn().mockReturnValue(<div />);
        render(
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
                },
                legendRenderer,
            }),
        );
        expect(legendRenderer).toHaveBeenCalledTimes(1);
    });

    describe("Inner components", () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        afterAll(() => {
            vi.restoreAllMocks();
        });

        const chartSpy = vi.spyOn(chartModule, "Chart").mockImplementation((): any => null);
        const legendSpy = vi.spyOn(legendModule, "Legend").mockImplementation((): any => null);

        it("should render chart without legend", () => {
            render(createComponent());
            expect(chartSpy).toHaveBeenCalled();
            expect(legendSpy).not.toHaveBeenCalled();
        });

        it("should render legend if enabled", () => {
            render(
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
                    },
                }),
            );
            expect(chartSpy).toHaveBeenCalled();
            expect(legendSpy).toHaveBeenCalled();
        });
    });

    it("should force chart reflow and set container styles when height is set", () => {
        const chartMock: any = {
            container: {
                style: {},
            },
            reflow: vi.fn(),
        };
        const mockRef = {
            getChart: () => chartMock,
        };
        const mockHeight = 123;

        const chartRenderer = (props: any) => {
            props.ref(mockRef);
            return <div />;
        };

        vi.useFakeTimers();
        render(
            createComponent({
                chartRenderer,
                height: mockHeight,
            }),
        );
        vi.runAllTimers();

        expect(chartMock.reflow).toHaveBeenCalledTimes(1);
        expect(chartMock.container.style.height).toBe(String(mockHeight));
        expect(chartMock.container.style.position).toBe("relative");
    });

    it("should force chart reflow and set container styles when height is not set", () => {
        const chartMock: any = {
            container: {
                style: {},
            },
            reflow: vi.fn(),
        };
        const mockRef = {
            getChart: () => chartMock,
        };

        const chartRenderer = (props: any) => {
            props.ref(mockRef);
            return <div />;
        };

        vi.useFakeTimers();
        render(
            createComponent({
                chartRenderer,
            }),
        );
        vi.runAllTimers();

        expect(chartMock.reflow).toHaveBeenCalledTimes(1);
        expect(chartMock.container.style.height).toBe("100%");
        expect(chartMock.container.style.position).toBe("absolute");
    });

    it("should not throw if chartRef has not been set", () => {
        const chartRenderer = vi.fn().mockReturnValue(<div />);

        const doMount = () => {
            vi.useFakeTimers();
            render(
                createComponent({
                    chartRenderer,
                }),
            );
            vi.runAllTimers();
        };

        expect(doMount).not.toThrow();
    });

    describe("render", () => {
        const defaultDocumentObj = {
            documentElement: {
                clientWidth: FLUID_LEGEND_THRESHOLD,
            },
        };

        const customComponentProps = ({
            position = TOP,
            responsive = false,
            documentObj = defaultDocumentObj,
        }) => ({
            documentObj,
            legend: {
                enabled: true,
                position,
                responsive,
                items: [
                    {
                        legendIndex: 0,
                        name: "TEST",
                        color: "rgb(0, 0, 0)",
                    },
                ],
            },
        });

        it("should set flex-direction-column class for legend position TOP", () => {
            render(createComponent(customComponentProps({ position: TOP })));
            expect(document.querySelector(".flex-direction-column")).toBeInTheDocument();
        });

        it("should set flex-direction-column class for legend position BOTTOM", () => {
            render(createComponent(customComponentProps({ position: BOTTOM })));
            expect(document.querySelector(".flex-direction-column")).toBeInTheDocument();
        });

        it("should set flex-direction-row class for legend position LEFT", () => {
            render(createComponent(customComponentProps({ position: LEFT })));
            expect(document.querySelector(".flex-direction-row")).toBeInTheDocument();
        });

        it("should set flex-direction-row class for legend position RIGHT", () => {
            render(createComponent(customComponentProps({ position: RIGHT })));
            expect(document.querySelector(".flex-direction-row")).toBeInTheDocument();
        });

        it("should set responsive-legend class for responsive legend", () => {
            render(createComponent(customComponentProps({ responsive: true })));
            expect(document.querySelector(".responsive-legend")).toBeInTheDocument();
        });

        it("should set non-responsive-legend class for non responsive legend", () => {
            render(createComponent(customComponentProps({ responsive: false })));
            expect(document.querySelector(".non-responsive-legend")).toBeInTheDocument();
        });

        it("should render responsive legend for mobile", () => {
            const documentObj = {
                documentElement: {
                    clientWidth: FLUID_LEGEND_THRESHOLD - 10,
                },
            };
            render(createComponent(customComponentProps({ responsive: true, documentObj })));
            expect(document.querySelector(".viz-fluid-legend-wrap")).toBeInTheDocument();
        });

        it("should render StaticLegend on desktop", () => {
            const documentObj = {
                documentElement: {
                    clientWidth: FLUID_LEGEND_THRESHOLD + 10,
                },
            };
            render(createComponent(customComponentProps({ responsive: true, documentObj })));
            expect(document.querySelector(".viz-static-legend-wrap")).toBeInTheDocument();
        });
    });

    describe("legend position", () => {
        const getlegendOnPosition = (position: string) => ({
            enabled: true,
            items: [
                {
                    legendIndex: 0,
                    name: "test",
                    color: "rgb(0, 0, 0)",
                },
            ],
            position,
            onItemClick: noop,
        });

        const getDocumentMock = (clientWidth: number) => ({
            ...document,
            ...{ documentElement: { clientWidth } },
        });

        it.each([
            ["before", 1000, TOP],
            ["before", 1000, LEFT],
            ["before", 500, BOTTOM],
        ])(
            "should render legend %s the chart",
            (_position: string, clientWidth: number, legendPosition: string) => {
                render(
                    createComponent({
                        legend: getlegendOnPosition(legendPosition),
                        documentObj: getDocumentMock(clientWidth),
                    }),
                );

                expect(document.querySelector(".viz-static-legend-wrap").nextElementSibling).toHaveClass(
                    "viz-react-highchart-wrap",
                );
            },
        );

        it.each([
            ["after", 1000, BOTTOM],
            ["after", 1000, RIGHT],
        ])(
            "should render legend %s the chart",
            (_position: string, clientWidth: number, legendPosition: string) => {
                render(
                    createComponent({
                        legend: getlegendOnPosition(legendPosition),
                        documentObj: getDocumentMock(clientWidth),
                    }),
                );

                expect(document.querySelector(".viz-static-legend-wrap").previousElementSibling).toHaveClass(
                    "viz-react-highchart-wrap",
                );
            },
        );
    });

    describe("Zoom Out Button", () => {
        it("should render the zoom out button with the Goodstrap tooltip", () => {
            const chartRenderer = vi.fn().mockReturnValue(<div className="chart" />);
            const legendRenderer = vi.fn().mockReturnValue(<div className="legend" />);
            render(
                createComponent(
                    {
                        legend: {
                            enabled: true,
                            items: [
                                {
                                    legendIndex: 0,
                                    name: "test",
                                    color: "rgb(0, 0, 0)",
                                },
                            ],
                        },
                        legendRenderer,
                        chartRenderer,
                    },
                    true,
                ),
            );

            expect(document.querySelector(".gd-bubble-trigger")).toBeInTheDocument();
            expect(document.querySelector("button.s-zoom-out")).toBeInTheDocument();
            expect(document.querySelector(".legend")).toBeInTheDocument();
            expect(document.querySelector(".chart")).toBeInTheDocument();
        });
    });
});

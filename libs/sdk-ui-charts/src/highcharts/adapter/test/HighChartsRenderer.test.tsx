// (C) 2007-2022 GoodData Corporation
import React from "react";
import { shallow, mount, ShallowWrapper } from "enzyme";
import noop from "lodash/noop";

import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";

import { HighChartsRenderer, FLUID_LEGEND_THRESHOLD } from "../HighChartsRenderer";
import { getHighchartsOptions } from "../../chartTypes/_chartCreators/highChartsCreators";
import { Chart } from "../Chart";
import { VisualizationTypes, IDrillConfig } from "@gooddata/sdk-ui";
import { Legend } from "@gooddata/sdk-ui-vis-commons";
import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { BOTTOM, LEFT, RIGHT, TOP } from "../../typings/mess";
import { IChartConfig } from "../../../interfaces";

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
            const onLegendReady = jest.fn();
            mount(
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

        it("should dispatch when recieve new props", () => {
            const onLegendReady = jest.fn();
            const wrapper = mount(
                createComponent({
                    onLegendReady,
                }),
            );

            const newLegendItems = [
                {
                    name: "Serie A",
                    color: "#000",
                    legendIndex: 0,
                },
                {
                    name: "Serie b",
                    color: "#fff",
                    legendIndex: 1,
                },
            ];
            wrapper.setProps({
                legend: {
                    items: newLegendItems,
                },
            });

            expect(onLegendReady).toHaveBeenCalledTimes(2);
            expect(onLegendReady).toHaveBeenLastCalledWith({
                legendItems: [
                    {
                        name: "Serie A",
                        color: "#000",
                        onClick: expect.any(Function),
                    },
                    {
                        name: "Serie b",
                        color: "#fff",
                        onClick: expect.any(Function),
                    },
                ],
            });
        });
    });

    it("should use custom Chart renderer", () => {
        const chartRenderer = jest.fn().mockReturnValue(<div />);
        mount(createComponent({ chartRenderer }));
        expect(chartRenderer).toHaveBeenCalledTimes(1);
    });

    it("should use custom Legend renderer", () => {
        const legendRenderer = jest.fn().mockReturnValue(<div />);
        mount(
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

    it("should render chart without legend", () => {
        const wrapper = shallow(createComponent());
        expect(wrapper.find(Chart)).toHaveLength(1);
        expect(wrapper.find(Legend)).toHaveLength(0);
    });

    it("should render legend if enabled", () => {
        const wrapper = shallow(
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
        expect(wrapper.find(Chart)).toHaveLength(1);
        expect(wrapper.find(Legend)).toHaveLength(1);
    });

    it("should set chart ref", () => {
        const mockRef = {
            getChart: () => ({
                container: {
                    style: {},
                },
                reflow: jest.fn(),
            }),
        };
        const chartRenderer = (props: any) => {
            props.ref(mockRef);
            return <div />;
        };
        const wrapper: any = mount(
            createComponent({
                chartRenderer,
            }),
        );
        const { chartRef } = wrapper.instance();
        expect(chartRef).toBe(mockRef);
    });

    it("should force chart reflow and set container styles when height is set", () => {
        const chartMock: any = {
            container: {
                style: {},
            },
            reflow: jest.fn(),
        };
        const mockRef = {
            getChart: () => chartMock,
        };
        const mockHeight = 123;

        const chartRenderer = (props: any) => {
            props.ref(mockRef);
            return <div />;
        };

        jest.useFakeTimers();
        mount(
            createComponent({
                chartRenderer,
                height: mockHeight,
            }),
        );
        jest.runAllTimers();

        expect(chartMock.reflow).toHaveBeenCalledTimes(1);
        expect(chartMock.container.style.height).toBe(String(mockHeight));
        expect(chartMock.container.style.position).toBe("relative");
    });

    it("should force chart reflow and set container styles when height is not set", () => {
        const chartMock: any = {
            container: {
                style: {},
            },
            reflow: jest.fn(),
        };
        const mockRef = {
            getChart: () => chartMock,
        };

        const chartRenderer = (props: any) => {
            props.ref(mockRef);
            return <div />;
        };

        jest.useFakeTimers();
        mount(
            createComponent({
                chartRenderer,
            }),
        );
        jest.runAllTimers();

        expect(chartMock.reflow).toHaveBeenCalledTimes(1);
        expect(chartMock.container.style.height).toBe("100%");
        expect(chartMock.container.style.position).toBe("absolute");
    });

    it("should not throw if chartRef has not been set", () => {
        const chartRenderer = jest.fn().mockReturnValue(<div />);

        const doMount = () => {
            jest.useFakeTimers();
            mount(
                createComponent({
                    chartRenderer,
                }),
            );
            jest.runAllTimers();
        };

        expect(doMount).not.toThrow();
    });

    describe("legend toggling", () => {
        const legend = {
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
        };

        it("should toggle when onLegendItemClick is called", () => {
            const wrapper: any = shallow(createComponent({ legend }));

            wrapper.instance().onLegendItemClick({ legendIndex: 0 });
            expect(wrapper.instance().state.legendItemsEnabled).toEqual([false]);
            wrapper.instance().onLegendItemClick({ legendIndex: 0 });
            expect(wrapper.instance().state.legendItemsEnabled).toEqual([true]);
        });
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
            const wrapper = shallow(createComponent(customComponentProps({ position: TOP })));
            expect(wrapper.hasClass("flex-direction-column")).toBe(true);
        });

        it("should set flex-direction-column class for legend position BOTTOM", () => {
            const wrapper = shallow(createComponent(customComponentProps({ position: BOTTOM })));
            expect(wrapper.hasClass("flex-direction-column")).toBe(true);
        });

        it("should set flex-direction-row class for legend position LEFT", () => {
            const wrapper = shallow(createComponent(customComponentProps({ position: LEFT })));
            expect(wrapper.hasClass("flex-direction-row")).toBe(true);
        });

        it("should set flex-direction-row class for legend position RIGHT", () => {
            const wrapper = shallow(createComponent(customComponentProps({ position: RIGHT })));
            expect(wrapper.hasClass("flex-direction-row")).toBe(true);
        });

        it("should set responsive-legend class for responsive legend", () => {
            const wrapper = shallow(createComponent(customComponentProps({ responsive: true })));
            expect(wrapper.hasClass("responsive-legend")).toBe(true);
        });

        it("should set non-responsive-legend class for non responsive legend", () => {
            const wrapper = shallow(createComponent(customComponentProps({ responsive: false })));
            expect(wrapper.hasClass("non-responsive-legend")).toBe(true);
        });

        it("should render responsive legend for mobile", () => {
            const documentObj = {
                documentElement: {
                    clientWidth: FLUID_LEGEND_THRESHOLD - 10,
                },
            };

            const wrapper = shallow(createComponent(customComponentProps({ responsive: true, documentObj })));
            expect(wrapper.state("showFluidLegend")).toBeTruthy();
        });

        it("should render StaticLegend on desktop", () => {
            const documentObj = {
                documentElement: {
                    clientWidth: FLUID_LEGEND_THRESHOLD + 10,
                },
            };

            const wrapper = shallow(createComponent(customComponentProps({ responsive: true, documentObj })));
            expect(wrapper.state("showFluidLegend")).toBeFalsy();
        });
    });

    describe("componentWillReceiveProps", () => {
        const chartRenderer = jest.fn().mockReturnValue(<div />);
        const legendRenderer = jest.fn().mockReturnValue(<div />);

        const rendererProps = {
            chartRenderer,
            legendRenderer,
            legend: {
                enabled: true,
                position: LEFT,
                items: [
                    {
                        legendIndex: 0,
                        name: "TEST",
                        color: "rgb(0, 0, 0)",
                    },
                ],
            },
        };

        it("should reset legend if legend props change", () => {
            const wrapper = mount(createComponent(rendererProps));
            const props = wrapper.props();
            const getLegendItems = () => wrapper.state("legendItemsEnabled");

            const legendItemsEnabledState = getLegendItems();

            const updatedProps = {
                ...props,
                legend: {
                    ...props.legend,
                    items: [
                        {
                            legendIndex: 0,
                            name: "UPDATED TEST",
                            color: "rgb(0, 0, 0)",
                        },
                    ],
                },
                children: null as any,
            };

            wrapper.setState({ legendItemsEnabled: [false] });
            wrapper.setProps(updatedProps);

            const updatedLegendItemsEnabledState = getLegendItems();
            expect(legendItemsEnabledState).toEqual([true]);
            expect(updatedLegendItemsEnabledState).toEqual([true]);
        });

        it("should not reset legend if props change but legend items stay the same", () => {
            const wrapper = mount(createComponent(rendererProps));
            const props = wrapper.props();
            const getLegendItems = () => wrapper.state("legendItemsEnabled");

            const legendItemsEnabledState = getLegendItems();

            const updatedProps = {
                ...props,
                legendRenderer,
                legend: {
                    ...props.legend,
                    position: RIGHT,
                },
                children: null as any,
            };

            wrapper.setState({ legendItemsEnabled: [false] });
            wrapper.setProps(updatedProps);

            const updatedLegendItemsEnabledState = getLegendItems();

            expect(legendItemsEnabledState).toEqual([true]);
            expect(updatedLegendItemsEnabledState).toEqual([false]);
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
            ["after", 1000, BOTTOM],
            ["after", 1000, RIGHT],
        ])(
            "should render legend %s the chart",
            (position: string, clientWidth: number, legendPosition: string) => {
                const wrapper: ShallowWrapper = shallow(
                    createComponent({
                        legend: getlegendOnPosition(legendPosition),
                        documentObj: getDocumentMock(clientWidth),
                    }),
                );

                const legendChildPosition = position === "before" ? 0 : 1;

                const legendIsRenderedFirst = wrapper
                    .find(".s-viz-line-family-chart-wrap")
                    .childAt(legendChildPosition)
                    .is(Legend);
                expect(legendIsRenderedFirst).toEqual(true);
            },
        );
    });

    describe("Zoom Out Button", () => {
        it("should render the zoom out button with the Goodstrap tooltip", () => {
            const chartRenderer = jest.fn().mockReturnValue(<div className="chart" />);
            const legendRenderer = jest.fn().mockReturnValue(<div className="legend" />);
            const wrapper = mount(
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
            const chartWrapper = wrapper.find(".viz-line-family-chart-wrap");

            expect(chartWrapper.childAt(0).find("button.s-zoom-out")).toHaveLength(1);
            expect(chartWrapper.find(BubbleHoverTrigger)).toHaveLength(1);
            expect(chartWrapper.childAt(1).prop("className")).toBe("legend");
            expect(chartWrapper.childAt(2).prop("className")).toBe("chart");
        });

        it.each([[true], [false]])(
            "should show and hide the zoom out button correctly when the resetSelection is %s",
            (resetSelection: boolean) => {
                const chartRenderer = jest.fn().mockReturnValue(<div className="chart" />);
                const legendRenderer = jest.fn().mockReturnValue(<div className="legend" />);
                const wrapperInstance: any = mount(
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
                ).instance();
                const zoomOutButton = {
                    style: {
                        display: "grid",
                    },
                };
                wrapperInstance.onChartSelection({
                    target: {
                        renderTo: {
                            parentElement: {
                                closest: jest.fn().mockReturnValue({
                                    querySelector: jest.fn().mockReturnValue(zoomOutButton),
                                }),
                            },
                        },
                    },
                    resetSelection,
                });

                expect(zoomOutButton.style.display).toBe(resetSelection ? "none" : "grid");
            },
        );
    });
});

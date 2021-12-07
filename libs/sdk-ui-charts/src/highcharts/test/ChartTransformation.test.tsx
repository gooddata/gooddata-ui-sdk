// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";

import { ChartTransformation } from "../ChartTransformation";
import { HighChartsRenderer } from "../adapter/HighChartsRenderer";
import { IChartConfig } from "../../interfaces";
import { getRgbString } from "@gooddata/sdk-ui-vis-commons";
import { IColorPaletteItem, measureLocalId } from "@gooddata/sdk-model";
import { Chart } from "../adapter/Chart";
import { VisualizationTypes, IntlWrapper, withIntl } from "@gooddata/sdk-ui";
import { TOP, BOTTOM, MIDDLE } from "../constants/alignments";
import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import * as fixtures from "../../../__mocks__/fixtures";
import { recordedDataFacade } from "../../../__mocks__/recordings";

const BarChartNoAttributes = recordedDataFacade(ReferenceRecordings.Scenarios.BarChart.SingleMeasure);
const BarChartView = recordedDataFacade(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy);
const BarChartMultipleMeasures = recordedDataFacade(
    ReferenceRecordings.Scenarios.BarChart.ArithmeticMeasures,
);
const BarChartTwoMeasures = recordedDataFacade(ReferenceRecordings.Scenarios.BarChart.TwoMeasuresWithViewBy);
const BarChartViewAndStack = recordedDataFacade(
    ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy,
);
const PieChartSingleMeasure = recordedDataFacade(ReferenceRecordings.Scenarios.PieChart.SingleMeasure);

describe("ChartTransformation", () => {
    const defaultProps = {
        dataView: BarChartNoAttributes.dataView,
        config: {
            type: "column",
            legend: {
                enabled: true,
                position: "right",
            },
            legendLayout: "horizontal",
        },
        onDataTooLarge: noop,
        onNegativeValuess: noop,
    };

    function createComponent(customProps: any = {}) {
        const props = { ...defaultProps, ...customProps };
        const Wrapped = withIntl(ChartTransformation);
        return <Wrapped {...props} />;
    }

    it("should use custom renderer", () => {
        const renderer = jest.fn().mockReturnValue(<div />);
        mount(createComponent({ renderer }));
        expect(renderer).toHaveBeenCalledTimes(1);
    });

    it("should use custom color palette", () => {
        let colors: string[] = [];
        const customColorPalette = [
            {
                guid: "black",
                fill: {
                    r: 0,
                    g: 0,
                    b: 0,
                },
            },
            {
                guid: "red",
                fill: {
                    r: 255,
                    g: 0,
                    b: 0,
                },
            },
        ];
        const renderer = (params: any) => {
            colors = params.chartOptions.data.series.map((serie: any) => serie.color);
            return <div />;
        };
        const componentProps = {
            renderer,
            dataView: BarChartViewAndStack.dataView,
            config: {
                ...defaultProps.config,
                colorPalette: customColorPalette,
            },
        };
        mount(createComponent(componentProps));
        expect(colors).toEqual(
            customColorPalette.map((colorPaletteItem: IColorPaletteItem) => getRgbString(colorPaletteItem)),
        );
    });

    describe("Legend config", () => {
        const defaultConfig = {
            type: "column",
            legend: {
                enabled: true,
            },
        };
        let pushData: any;
        function createChartRendererProps(executionData = BarChartViewAndStack, config: IChartConfig = {}) {
            const renderer = jest.fn().mockReturnValue(<div />);
            pushData = jest.fn();
            mount(
                createComponent({
                    renderer,
                    ...executionData,
                    config: {
                        ...config,
                        type: config.type || defaultConfig.type,
                    },
                    pushData,
                }),
            );
            return renderer.mock.calls[0][0];
        }

        it("should be always disabled for single series and push this info out", () => {
            const passedProps = createChartRendererProps(BarChartView);
            expect(passedProps.legend.enabled).toEqual(false);

            expect(pushData).toMatchSnapshot();
        });

        it("should be enabled & on the top by default and push this info out", () => {
            const passedProps = createChartRendererProps(BarChartMultipleMeasures);
            expect(passedProps.legend.enabled).toEqual(true);
            expect(passedProps.legend.position).toEqual(TOP);

            expect(pushData).toMatchSnapshot();
        });

        it("should be able to disable default", () => {
            const passedProps = createChartRendererProps(BarChartMultipleMeasures, {
                legend: {
                    enabled: false,
                },
            });
            expect(passedProps.legend.enabled).toEqual(false);
        });
    });

    describe("onDataTooLarge", () => {
        it("should be invoked if data series is over limit", () => {
            const onDataTooLarge = jest.fn();
            const props = {
                ...BarChartMultipleMeasures,
                onDataTooLarge,
                config: {
                    ...defaultProps.config,
                    limits: {
                        series: 1,
                    },
                },
            };
            mount(createComponent(props));
            expect(onDataTooLarge).toHaveBeenCalledTimes(1);
        });

        it("should be invoked if data categories is over limit", () => {
            const onDataTooLarge = jest.fn();
            const props = {
                ...BarChartMultipleMeasures,
                onDataTooLarge,
                config: {
                    ...defaultProps.config,
                    limits: {
                        categories: 1,
                    },
                },
            };
            mount(createComponent(props));
            expect(onDataTooLarge).toHaveBeenCalledTimes(1);
        });

        it("should be invoked on component mount", () => {
            const onDataTooLarge = jest.fn();
            const props = {
                ...BarChartMultipleMeasures,
                onDataTooLarge,
                config: {
                    ...defaultProps.config,
                    limits: {
                        series: 1,
                    },
                },
            };
            const wrapper = mount(createComponent(props));
            expect(wrapper.find(HighChartsRenderer)).toHaveLength(0);
            expect(onDataTooLarge).toHaveBeenCalledTimes(1);
        });

        it("should be invoked on props change", () => {
            const onDataTooLarge = jest.fn();
            const props = {
                ...BarChartMultipleMeasures,
                onDataTooLarge,
                config: {
                    ...defaultProps.config,
                    limits: {
                        series: 1,
                    },
                },
            };
            const wrapper = mount(createComponent());
            expect(wrapper.find(HighChartsRenderer)).toHaveLength(1);

            wrapper.setProps(props);
            expect(wrapper.find(HighChartsRenderer)).toHaveLength(0);
            expect(onDataTooLarge).toHaveBeenCalledTimes(1);

            wrapper.setProps({
                ...defaultProps,
                config: {
                    ...defaultProps.config,
                    limits: undefined,
                },
            });
            expect(wrapper.find(HighChartsRenderer)).toHaveLength(1);
        });
    });

    describe("onNegativeValues", () => {
        const pieChartPropsWithNegativeValue = {
            dataView: fixtures.pieChartWithMetricsOnlyFundata.dataView,
            config: {
                ...defaultProps.config,
                type: "pie",
            },
        };

        it("should be invoked if pie chart data contains a negative value", () => {
            const onNegativeValues = jest.fn();
            const props = {
                onNegativeValues,
                ...pieChartPropsWithNegativeValue,
            };
            mount(createComponent(props));
            expect(onNegativeValues).toHaveBeenCalledTimes(1);
        });

        it("should not be invoke on other than pie charts", () => {
            const onNegativeValues = jest.fn();
            const props = {
                onNegativeValues,
                ...pieChartPropsWithNegativeValue,
                config: {
                    ...defaultProps.config,
                    type: "column",
                },
            };
            mount(createComponent(props));
            expect(onNegativeValues).toHaveBeenCalledTimes(0);
        });

        it("should not be invoked if data is too large as well", () => {
            const onNegativeValues = jest.fn();
            const props = {
                onNegativeValues,
                ...pieChartPropsWithNegativeValue,
                config: {
                    ...defaultProps.config,
                    type: "pie",
                    limits: {
                        categories: 1,
                    },
                },
            };
            mount(createComponent(props));
            expect(onNegativeValues).toHaveBeenCalledTimes(0);
        });

        it("should be invoked on component mount", () => {
            const onNegativeValues = jest.fn();
            const props = {
                onNegativeValues,
                ...pieChartPropsWithNegativeValue,
            };
            const wrapper = mount(createComponent(props));
            expect(wrapper.find(HighChartsRenderer)).toHaveLength(0);
            expect(onNegativeValues).toHaveBeenCalledTimes(1);
        });

        it("should be invoked on props change", () => {
            const onNegativeValues = jest.fn();
            const props = {
                onNegativeValues,
                ...pieChartPropsWithNegativeValue,
            };
            const wrapper = mount(createComponent());
            expect(wrapper.find(HighChartsRenderer)).toHaveLength(1);

            wrapper.setProps(props);
            expect(wrapper.find(HighChartsRenderer)).toHaveLength(0);
            expect(onNegativeValues).toHaveBeenCalledTimes(1);

            wrapper.setProps(PieChartSingleMeasure);
            expect(wrapper.find(HighChartsRenderer)).toHaveLength(1);
        });
    });

    const AlignableCharts: Array<[string]> = [[VisualizationTypes.PIE], [VisualizationTypes.DONUT]];

    describe.each(AlignableCharts)("%s chart alignments", (type: string) => {
        function render(chartConfig: IChartConfig) {
            const props = {
                ...PieChartSingleMeasure,
                config: {
                    type,
                    ...chartConfig,
                },
                onDataTooLarge: noop,
            };
            return mount(createComponent(props));
        }

        it.each([[TOP], [MIDDLE], [BOTTOM]])("should props.verticalAlign be %s", (verticalAlign: string) => {
            const wrapper = render({ chart: { verticalAlign } });
            const highChartsRendererProps = wrapper.find(HighChartsRenderer).props();
            expect(highChartsRendererProps.chartOptions.verticalAlign).toBe(verticalAlign);
        });

        it("should props.verticalAlign be undefined", () => {
            const wrapper = render({});
            const highChartsRendererProps = wrapper.find(HighChartsRenderer).props();
            expect(highChartsRendererProps.chartOptions.verticalAlign).toBe(undefined);
        });
    });

    describe("axis labels alignment on dual bar chart", () => {
        function createComponent(chartConfig: IChartConfig) {
            const props = {
                dataView: BarChartTwoMeasures.dataView,
                config: {
                    type: VisualizationTypes.BAR,
                    ...chartConfig,
                },
                onDataTooLarge: noop,
            };
            return mount(
                <IntlWrapper>
                    <ChartTransformation {...(props as any)} />
                </IntlWrapper>,
            );
        }

        it("should align secondary Y axis labels to left", () => {
            const chartConfig: IChartConfig = {
                secondary_xaxis: {
                    measures: [measureLocalId(ReferenceMd.Won)],
                    rotation: "90",
                },
            };
            const wrapper = createComponent(chartConfig);
            const chartConfigProps = wrapper.find(Chart).prop("config");
            const label = chartConfigProps?.yAxis?.[1]?.labels;

            expect(label.align).toBe("left");
            expect(label.y).toBe(undefined);
        });

        it("should align Y axis label to right and secondary Y axis labels to left", () => {
            const chartConfig: IChartConfig = {
                xaxis: {
                    rotation: "90",
                },
                secondary_xaxis: {
                    measures: [measureLocalId(ReferenceMd.Won)],
                    rotation: "90",
                },
            };
            const wrapper = createComponent(chartConfig);
            const chartConfigProps = wrapper.find(Chart).prop("config");

            const labels = chartConfigProps?.yAxis?.[0]?.labels;
            expect(labels.align).toBe("right");
            expect(labels.y).toBe(8);

            const secondaryLabels = chartConfigProps?.yAxis?.[1]?.labels;
            expect(secondaryLabels.align).toBe("left");
            expect(secondaryLabels.y).toBe(undefined);
        });

        it("should not align secondary Y axis labels to left on other charts", () => {
            const chartConfig: IChartConfig = {
                type: VisualizationTypes.COLUMN,
                secondary_yaxis: {
                    measures: [measureLocalId(ReferenceMd.Won)],
                    rotation: "90",
                },
            };
            const wrapper = createComponent(chartConfig);
            const chartConfigProps = wrapper.find(Chart).prop("config");
            const label = chartConfigProps?.yAxis?.[1]?.labels;

            expect(label.align).toBe(undefined);
            expect(label.y).toBe(undefined);
        });
    });
});

// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow, mount } from "enzyme";
import noop = require("lodash/noop");
import get = require("lodash/get");

import ChartTransformation from "../ChartTransformation";
import * as fixtures from "../../../../__mocks__/fixtures";
import HighChartsRenderer from "../HighChartsRenderer";
import { IChartConfig } from "../../Config";
import { getRgbString } from "../../utils/color";
import { IColorPaletteItem } from "@gooddata/sdk-model";
import Chart from "../Chart";
import { VisualizationTypes, IntlWrapper } from "@gooddata/sdk-ui";
import { TOP, BOTTOM, MIDDLE } from "../../constants/alignments";

describe("ChartTransformation", () => {
    const defaultProps = {
        ...fixtures.barChartWithoutAttributes,
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
        return <ChartTransformation {...props} />;
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
            dataView: fixtures.barChartWithStackByAndViewByAttributes.dataView,
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

    describe("Stacking config", () => {
        const defaultConfig = {
            type: "area",
        };

        function createChartRendererProps(
            executionData = fixtures.areaChartWith3MetricsAndViewByAttribute.dataView,
            config: IChartConfig = {},
        ) {
            const renderer = jest.fn().mockReturnValue(<div />);
            mount(
                createComponent({
                    renderer,
                    dataView: executionData,
                    config: {
                        ...config,
                        type: config.type || defaultConfig.type,
                    },
                }),
            );
            return renderer.mock.calls[0][0];
        }

        it("should be enabled by default for area chart", () => {
            const passedProps = createChartRendererProps(
                fixtures.areaChartWith3MetricsAndViewByAttribute.dataView,
            );
            expect(passedProps.chartOptions.stacking).toEqual("normal");
        });

        it("should be enabled by configuration", () => {
            const passedProps = createChartRendererProps(
                fixtures.areaChartWith3MetricsAndViewByAttribute.dataView,
                {
                    stacking: true,
                },
            );
            expect(passedProps.chartOptions.stacking).toEqual("normal");
        });

        it("should be disabled by configuration", () => {
            const passedProps = createChartRendererProps(
                fixtures.areaChartWith3MetricsAndViewByAttribute.dataView,
                {
                    stacking: false,
                },
            );
            expect(passedProps.chartOptions.stacking).toBeNull();
        });

        describe("getChartConfig", () => {
            it("should keep stack measures configuration", () => {
                const passedProps = createChartRendererProps(
                    fixtures.areaChartWith3MetricsAndViewByAttribute.dataView,
                    {
                        stackMeasures: true,
                        stackMeasuresToPercent: true,
                    },
                );
                expect(passedProps.chartOptions.stacking).toEqual("percent");
            });
            it("should keep stack measures configuration without stackBy", () => {
                const passedProps = createChartRendererProps(
                    fixtures.columnChartWithMeasureAndViewBy.dataView,
                    {
                        stackMeasures: true,
                        stackMeasuresToPercent: true,
                    },
                );
                expect(passedProps.chartOptions.stacking).toEqual("percent");
            });
            it("should sanitized stack measures configuration with computeRatio", () => {
                const passedProps = createChartRendererProps(
                    fixtures.columnChartWithMeasureAndViewByAndComputeRatio.dataView,
                    {
                        stackMeasures: true,
                        stackMeasuresToPercent: true,
                    },
                );
                expect(passedProps.chartOptions.stacking).toBeNull();
            });
        });
    });

    describe("Legend config", () => {
        const defaultConfig = {
            type: "column",
            legend: {
                enabled: true,
            },
        };
        let pushData: any;
        function createChartRendererProps(
            executionData = fixtures.barChartWithStackByAndViewByAttributes,
            config: IChartConfig = {},
        ) {
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
            const passedProps = createChartRendererProps(fixtures.barChartWithViewByAttribute);
            expect(passedProps.legend.enabled).toEqual(false);
            expect(pushData).toBeCalledWith({
                colors: {
                    colorAssignments: [
                        {
                            color: {
                                type: "guid",
                                value: "1",
                            },
                            headerItem: {
                                measureHeaderItem: {
                                    format: "#,##0.00",
                                    identifier: "ah1EuQxwaCqs",
                                    localIdentifier: "amountMetric",
                                    name: "Amount",
                                    uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1279",
                                },
                            },
                        },
                    ],
                    colorPalette: undefined,
                },
                propertiesMeta: {
                    legend_enabled: false,
                },
            });
        });

        it("should be enabled & on the top by default and push this info out", () => {
            const passedProps = createChartRendererProps(fixtures.barChartWith3MetricsAndViewByAttribute);
            expect(passedProps.legend.enabled).toEqual(true);
            expect(passedProps.legend.position).toEqual(TOP);
            expect(pushData).toBeCalledWith({
                colors: {
                    colorAssignments: [
                        {
                            color: {
                                type: "guid",
                                value: "1",
                            },
                            headerItem: {
                                measureHeaderItem: {
                                    format: "#,##0.00",
                                    identifier: "af2Ewj9Re2vK",
                                    localIdentifier: "lostMetric",
                                    name: "<button>Lost</button> ...",
                                    uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                                },
                            },
                        },
                        {
                            color: {
                                type: "guid",
                                value: "2",
                            },
                            headerItem: {
                                measureHeaderItem: {
                                    format: "#,##0.00",
                                    identifier: "afSEwRwdbMeQ",
                                    localIdentifier: "wonMetric",
                                    name: "Won",
                                    uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284",
                                },
                            },
                        },
                        {
                            color: {
                                type: "guid",
                                value: "3",
                            },
                            headerItem: {
                                measureHeaderItem: {
                                    format: "#,##0.00",
                                    identifier: "alUEwmBtbwSh",
                                    localIdentifier: "expectedMetric",
                                    name: "Expected",
                                    uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1285",
                                },
                            },
                        },
                    ],
                    colorPalette: undefined,
                },
                propertiesMeta: {
                    legend_enabled: true,
                },
            });
        });

        it("should be able to disable default", () => {
            const passedProps = createChartRendererProps(fixtures.barChartWith3MetricsAndViewByAttribute, {
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
                ...fixtures.barChartWith3MetricsAndViewByAttribute,
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
                ...fixtures.barChartWith3MetricsAndViewByAttribute,
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
                ...fixtures.barChartWith3MetricsAndViewByAttribute,
                onDataTooLarge,
                config: {
                    ...defaultProps.config,
                    limits: {
                        series: 1,
                    },
                },
            };
            const wrapper = shallow(createComponent(props));
            expect(wrapper.find(HighChartsRenderer)).toHaveLength(0);
            expect(onDataTooLarge).toHaveBeenCalledTimes(1);
        });

        it("should be invoked on props change", () => {
            const onDataTooLarge = jest.fn();
            const props = {
                ...fixtures.barChartWith3MetricsAndViewByAttribute,
                onDataTooLarge,
                config: {
                    ...defaultProps.config,
                    limits: {
                        series: 1,
                    },
                },
            };
            const wrapper = shallow(createComponent());
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
            const wrapper = shallow(createComponent(props));
            expect(wrapper.find(HighChartsRenderer)).toHaveLength(0);
            expect(onNegativeValues).toHaveBeenCalledTimes(1);
        });

        it("should be invoked on props change", () => {
            const onNegativeValues = jest.fn();
            const props = {
                onNegativeValues,
                ...pieChartPropsWithNegativeValue,
            };
            const wrapper = shallow(createComponent());
            expect(wrapper.find(HighChartsRenderer)).toHaveLength(1);

            wrapper.setProps(props);
            expect(wrapper.find(HighChartsRenderer)).toHaveLength(0);
            expect(onNegativeValues).toHaveBeenCalledTimes(1);

            wrapper.setProps(fixtures.pieChartWithMetricsOnly);
            expect(wrapper.find(HighChartsRenderer)).toHaveLength(1);
        });
    });

    const AlignableCharts: Array<[string]> = [[VisualizationTypes.PIE], [VisualizationTypes.DONUT]];

    describe.each(AlignableCharts)("%s chart alignments", (type: string) => {
        function render(chartConfig: IChartConfig) {
            const props = {
                ...fixtures.pieChartWithMetricsOnly,
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
            const chartProps = wrapper.find(Chart).props();
            expect(chartProps.config.chart.verticalAlign).toBe(verticalAlign);
        });

        it("should props.verticalAlign be undefined", () => {
            const wrapper = render({});
            const chartProps = wrapper.find(Chart).props();
            expect(chartProps.config.chart.verticalAlign).toBe(undefined);
        });
    });

    describe("axis labels alignment on dual bar chart", () => {
        function createComponent(chartConfig: IChartConfig) {
            const props = {
                ...fixtures.barChartWith2MetricsAndViewByAttribute,
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
                    measures: ["wonMetric"],
                    rotation: "90",
                },
            };
            const wrapper = createComponent(chartConfig);
            const chartConfigProps = wrapper.find(Chart).prop("config");
            const label = get(chartConfigProps, "yAxis.1.labels");

            expect(label.align).toBe("left");
            expect(label.y).toBe(undefined);
        });

        it("should align Y axis label to right and secondary Y axis labels to left", () => {
            const chartConfig: IChartConfig = {
                xaxis: {
                    rotation: "90",
                },
                secondary_xaxis: {
                    measures: ["wonMetric"],
                    rotation: "90",
                },
            };
            const wrapper = createComponent(chartConfig);
            const chartConfigProps = wrapper.find(Chart).prop("config");

            const labels = get(chartConfigProps, "yAxis.0.labels");
            expect(labels.align).toBe("right");
            expect(labels.y).toBe(8);

            const secondaryLabels = get(chartConfigProps, "yAxis.1.labels");
            expect(secondaryLabels.align).toBe("left");
            expect(secondaryLabels.y).toBe(undefined);
        });

        it("should not align secondary Y axis labels to left on other charts", () => {
            const chartConfig: IChartConfig = {
                type: VisualizationTypes.COLUMN,
                secondary_yaxis: {
                    measures: ["wonMetric"],
                    rotation: "90",
                },
            };
            const wrapper = createComponent(chartConfig);
            const chartConfigProps = wrapper.find(Chart).prop("config");
            const label = get(chartConfigProps, "yAxis.1.labels");

            expect(label.align).toBe(undefined);
            expect(label.y).toBe(undefined);
        });
    });
});

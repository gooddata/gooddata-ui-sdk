// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import noop from "lodash/noop.js";

import { ChartTransformation } from "../ChartTransformation.js";
import { HighChartsRenderer } from "../adapter/HighChartsRenderer.js";
import { IChartConfig } from "../../interfaces/index.js";
import { getRgbString } from "@gooddata/sdk-ui-vis-commons";
import { IColorPaletteItem, measureLocalId } from "@gooddata/sdk-model";
import { VisualizationTypes, IntlWrapper, withIntl } from "@gooddata/sdk-ui";
import { TOP, BOTTOM, MIDDLE } from "../constants/alignments.js";
import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import * as fixtures from "../../../__mocks__/fixtures.js";
import { recordedDataFacade } from "../../../__mocks__/recordings.js";
import { describe, it, expect, vi, beforeEach } from "vitest";

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

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../adapter/HighChartsRenderer", async () => ({
    ...((await vi.importActual("../adapter/HighChartsRenderer")) as object),
    HighChartsRenderer: vi.fn(() => null),
}));

describe("ChartTransformation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

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
        const renderer = vi.fn().mockReturnValue(<div />);
        render(createComponent({ renderer }));
        expect(renderer).toHaveBeenCalledTimes(1);
    });

    it("should use highcharts renderer", () => {
        render(createComponent());
        expect(HighChartsRenderer).toHaveBeenCalledTimes(1);
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
        render(createComponent(componentProps));
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
            const renderer = vi.fn().mockReturnValue(<div />);
            pushData = vi.fn();
            render(
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
            const onDataTooLarge = vi.fn();
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
            render(createComponent(props));
            expect(onDataTooLarge).toHaveBeenCalledTimes(1);
        });

        it("should be invoked if data categories is over limit", () => {
            const onDataTooLarge = vi.fn();
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
            render(createComponent(props));
            expect(onDataTooLarge).toHaveBeenCalledTimes(1);
        });

        it("should be invoked on component mount", () => {
            const onDataTooLarge = vi.fn();
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
            render(createComponent(props));
            expect(HighChartsRenderer).toHaveBeenCalledTimes(0);
            expect(onDataTooLarge).toHaveBeenCalledTimes(1);
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
            const onNegativeValues = vi.fn();
            const props = {
                onNegativeValues,
                ...pieChartPropsWithNegativeValue,
            };
            render(createComponent(props));
            expect(onNegativeValues).toHaveBeenCalledTimes(1);
        });

        it("should not be invoke on other than pie charts", () => {
            const onNegativeValues = vi.fn();
            const props = {
                onNegativeValues,
                ...pieChartPropsWithNegativeValue,
                config: {
                    ...defaultProps.config,
                    type: "column",
                },
            };
            render(createComponent(props));
            expect(onNegativeValues).toHaveBeenCalledTimes(0);
        });

        it("should not be invoked if data is too large as well", () => {
            const onNegativeValues = vi.fn();
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
            render(createComponent(props));
            expect(onNegativeValues).toHaveBeenCalledTimes(0);
        });

        it("should be invoked on component mount", () => {
            const onNegativeValues = vi.fn();
            const props = {
                onNegativeValues,
                ...pieChartPropsWithNegativeValue,
            };
            render(createComponent(props));
            expect(HighChartsRenderer).toHaveBeenCalledTimes(0);
            expect(onNegativeValues).toHaveBeenCalledTimes(1);
        });
    });

    const AlignableCharts: Array<[string]> = [[VisualizationTypes.PIE], [VisualizationTypes.DONUT]];

    describe.each(AlignableCharts)("%s chart alignments", (type: string) => {
        function renderComponent(chartConfig: IChartConfig) {
            const props = {
                ...PieChartSingleMeasure,
                config: {
                    type,
                    ...chartConfig,
                },
                onDataTooLarge: noop,
            };
            return render(createComponent(props));
        }

        it.each([[TOP], [MIDDLE], [BOTTOM]])("should props.verticalAlign be %s", (verticalAlign: string) => {
            renderComponent({ chart: { verticalAlign } });
            expect(HighChartsRenderer).toHaveBeenCalledWith(
                expect.objectContaining({ chartOptions: expect.objectContaining({ verticalAlign }) }),
                {},
            );
        });

        it("should props.verticalAlign be undefined", () => {
            renderComponent({});
            expect(HighChartsRenderer).toHaveBeenCalledWith(
                expect.objectContaining({
                    chartOptions: expect.objectContaining({ verticalAlign: undefined }),
                }),
                {},
            );
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
            return render(
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
            createComponent(chartConfig);

            expect(HighChartsRenderer).toHaveBeenCalledWith(
                expect.objectContaining({
                    hcOptions: expect.objectContaining({
                        yAxis: expect.arrayContaining([
                            expect.anything(),
                            expect.objectContaining({
                                labels: expect.objectContaining({ align: "left", y: undefined }),
                            }),
                        ]),
                    }),
                }),
                {},
            );
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
            createComponent(chartConfig);

            expect(HighChartsRenderer).toHaveBeenCalledWith(
                expect.objectContaining({
                    hcOptions: expect.objectContaining({
                        yAxis: expect.arrayContaining([
                            expect.objectContaining({
                                labels: expect.objectContaining({ align: "right", y: 8 }),
                            }),
                            expect.objectContaining({
                                labels: expect.objectContaining({ align: "left", y: undefined }),
                            }),
                        ]),
                    }),
                }),
                {},
            );
        });

        it("should not align secondary Y axis labels to left on other charts", () => {
            const chartConfig: IChartConfig = {
                type: VisualizationTypes.COLUMN,
                secondary_yaxis: {
                    measures: [measureLocalId(ReferenceMd.Won)],
                    rotation: "90",
                },
            };
            createComponent(chartConfig);

            expect(HighChartsRenderer).toHaveBeenCalledWith(
                expect.objectContaining({
                    hcOptions: expect.objectContaining({
                        yAxis: expect.arrayContaining([
                            expect.anything(),
                            expect.objectContaining({
                                labels: expect.not.objectContaining({ align: "left" }),
                            }),
                        ]),
                    }),
                }),
                {},
            );
        });
    });
});

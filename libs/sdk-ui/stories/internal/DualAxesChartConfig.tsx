// (C) 2007-2019 GoodData Corporation
import React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";
import * as dataSet from "../test_data/chart_with_2_metrics_and_view_by_attribute";
import { Visualization } from "../../src/highcharts";
import { wrap } from "../utils/wrap";
import "../../../sdk-ui-charts/styles/scss/charts.scss";
import { ChartType, IChartConfig, VisualizationTypes } from "../../src";
import { barChartWithoutAttributes } from "../test_data/fixtures";
import { BASE_DUAL_AXIS_CHARTS } from "../data/dualAxis";
import { createHighChartResolver, ScreenshotReadyWrapper } from "../utils/ScreenshotReadyWrapper";

const NOT_SET = "not set";
const MinMaxInfo = ({
    minLeft = NOT_SET,
    maxLeft = NOT_SET,
    minRight = NOT_SET,
    maxRight = NOT_SET,
}: any) => (
    <div>
        <div>
            Left: Min({minLeft}), Max({maxLeft})
        </div>
        <div>
            Right: Min({minRight}), Max({maxRight})
        </div>
    </div>
);

const renderSupportedCharts = (dataset: any, config?: IChartConfig, minmaxInfo = {}) =>
    screenshotWrap(
        <ScreenshotReadyWrapper resolver={createHighChartResolver(3)}>
            {BASE_DUAL_AXIS_CHARTS.map((type: ChartType, index: number) => {
                const chartConfig: IChartConfig = {
                    type,
                    legend: {
                        enabled: true,
                        position: "top",
                    },
                    secondary_yaxis: {
                        measures: ["wonMetric"],
                    },
                    ...config,
                };
                const style = {
                    height: 600,
                    width: 600,
                };

                if (type === VisualizationTypes.BAR) {
                    chartConfig.xaxis = chartConfig.yaxis;
                    chartConfig.secondary_xaxis = chartConfig.secondary_yaxis;
                    chartConfig.yaxis = chartConfig.secondary_yaxis = undefined;
                    chartConfig.dataLabels = {
                        visible: false, // disable data label on bar chart to make test stable
                    };
                }

                return wrap(
                    <div style={style}>
                        <MinMaxInfo {...minmaxInfo} />
                        <Visualization config={chartConfig} {...dataset} />
                    </div>,
                    640,
                    620,
                    undefined,
                    undefined,
                    index,
                );
            })}
        </ScreenshotReadyWrapper>,
    );

const getMinMaxConfig: any = (
    minLeft = undefined as string,
    maxLeft = undefined as string,
    minRight = undefined as string,
    maxRight = undefined as string,
) => ({
    config: {
        yaxis: {
            min: minLeft,
            max: maxLeft,
        },
        secondary_yaxis: {
            min: minRight,
            max: maxRight,
            measures: ["wonMetric"],
        },
    },
    info: {
        minLeft,
        maxLeft,
        minRight,
        maxRight,
    },
});

storiesOf("Internal/DualAxesMinMaxConfig", module)
    .add("Dataset with positive data on both axes", () => {
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.positiveDataset)}</div>);
    })
    .add("Dataset with positive data on both axes, with shallow min/max", () => {
        const { config, info } = getMinMaxConfig("1", "2", "100", "101");
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.positiveDataset, config, info)}</div>);
    })
    .add("Dataset with positive data on both axes, with shallow decimal min/max", () => {
        const { config, info } = getMinMaxConfig("0.01", "0.021", "100.001", "100.002");
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.positiveDataset, config, info)}</div>);
    })
    .add("Dataset with positive data on both axes, with max setting", () => {
        const { config, info } = getMinMaxConfig(undefined, "500", undefined, "4000");
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.positiveDataset, config, info)}</div>);
    })
    .add("Dataset with positive data on both axes, min > max on left axis", () => {
        const { config, info } = getMinMaxConfig("600", "500", undefined, undefined);
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.positiveDataset, config, info)}</div>);
    })
    .add("Dataset with positive data on both axes, out-of-range min/max on left axis", () => {
        const { config, info } = getMinMaxConfig("1000", "2000", undefined, undefined);
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.positiveDataset, config, info)}</div>);
    })
    .add(
        "Dataset with positive data on both axes, left axis is invalid and right axis is without middle 0",
        () => {
            const { config, info } = getMinMaxConfig("-1000", "-500", "2000", "8000");
            return screenshotWrap(<div>{renderSupportedCharts(dataSet.positiveDataset, config, info)}</div>);
        },
    )
    .add("Dataset with positive data on both axes, min = max on right axis", () => {
        const { config, info } = getMinMaxConfig(undefined, undefined, "4000", "4000");
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.positiveDataset, config, info)}</div>);
    })
    .add("Dataset with positive data on both axes, min > max on left axis, min = max on right axis", () => {
        const { config, info } = getMinMaxConfig("600", "500", "4000", "4000");
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.positiveDataset, config, info)}</div>);
    })
    .add("Dataset with positive data on both axes, with min setting", () => {
        const { config, info } = getMinMaxConfig("100", null, "1000", null);
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.positiveDataset, config, info)}</div>);
    })
    .add("Dataset with positive data on both axes, with min and max settings", () => {
        const { config, info } = getMinMaxConfig("50", "100", "1000", "4000");
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.positiveDataset, config, info)}</div>);
    })
    .add("Dataset with negative data on both axes", () => {
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.negativeDataset)}</div>);
    })
    .add("Dataset with negative data on both axes, with max setting", () => {
        const { config, info } = getMinMaxConfig(null, "-50", null, "-1000");
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.negativeDataset, config, info)}</div>);
    })
    .add("Dataset with negative data on both axes, with min and max settings", () => {
        const { config, info } = getMinMaxConfig("-500", "50", "-4000", "-1000");
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.negativeDataset, config, info)}</div>);
    })
    .add("Dataset with positive on left axis, negative on right axis", () => {
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.oneNegativeSideDataset)}</div>);
    })
    .add("Dataset with positive on left axis, negative on right axis, stretch Y axes", () => {
        const { config, info } = getMinMaxConfig(null, "10000", "-10000", null);
        return screenshotWrap(
            <div>{renderSupportedCharts(dataSet.oneNegativeSideDataset, config, info)}</div>,
        );
    })
    .add("Dataset with positive on left axis, negative on right axis, shrink left Y axis", () => {
        const { config, info } = getMinMaxConfig("10000", null, null, null);
        return screenshotWrap(
            <div>{renderSupportedCharts(dataSet.oneNegativeSideDataset, config, info)}</div>,
        );
    })
    .add("Dataset with positive on left axis, negative on right axis, shrink right Y axis", () => {
        const { config, info } = getMinMaxConfig(null, null, null, "-10000");
        return screenshotWrap(
            <div>{renderSupportedCharts(dataSet.oneNegativeSideDataset, config, info)}</div>,
        );
    })
    .add("Dataset with positive on left axis, negative on right axis, empty left axis", () => {
        const { config, info } = getMinMaxConfig(null, "0", null, null);
        return screenshotWrap(
            <div>{renderSupportedCharts(dataSet.oneNegativeSideDataset, config, info)}</div>,
        );
    })
    .add("Dataset with positive on left axis, negative on right axis, empty right axis", () => {
        const { config, info } = getMinMaxConfig(null, null, "0", null);
        return screenshotWrap(
            <div>{renderSupportedCharts(dataSet.oneNegativeSideDataset, config, info)}</div>,
        );
    })
    .add("Dataset with positive on left axis, negative on right axis, empty chart", () => {
        const { config, info } = getMinMaxConfig(null, "0", "0", null);
        return screenshotWrap(
            <div>{renderSupportedCharts(dataSet.oneNegativeSideDataset, config, info)}</div>,
        );
    })
    .add(
        "Dataset with positive on left axis, negative on right axis with min max settings in same scale",
        () => {
            const { config, info } = getMinMaxConfig("-400", "400", "-5000", "5000");
            return screenshotWrap(
                <div>{renderSupportedCharts(dataSet.oneNegativeSideDataset, config, info)}</div>,
            );
        },
    )
    .add(
        "Dataset with positive on left axis, negative on right axis with min max settings not in same scale",
        () => {
            const { config, info } = getMinMaxConfig("-212", "312", "-4123", "2123");
            return screenshotWrap(
                <div>{renderSupportedCharts(dataSet.oneNegativeSideDataset, config, info)}</div>,
            );
        },
    )
    .add("Dataset with negative and positive on left axis, negative on right axis", () => {
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.mixDataset02)}</div>);
    })
    .add(
        "Dataset with negative and positive on left axis, negative on right axis with min max settings",
        () => {
            const { config, info } = getMinMaxConfig("0", "400", "-5000", "5000");
            return screenshotWrap(<div>{renderSupportedCharts(dataSet.mixDataset02, config, info)}</div>);
        },
    )
    .add("Dataset with negative and positive on left axis, negative and positive on right axis", () => {
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.mixDataset01)}</div>);
    })
    .add(
        "Dataset with negative and positive on left axis, negative and positive on right axis with min and max settings",
        () => {
            const { config, info } = getMinMaxConfig("-200", "200", "-10000", "5000");
            return screenshotWrap(<div>{renderSupportedCharts(dataSet.mixDataset01, config, info)}</div>);
        },
    )
    .add(
        "Dataset with negative and positive on left axis, negative and positive on right axis with positive min and max settings",
        () => {
            const { config, info } = getMinMaxConfig("0", "200", "0", "5000");
            return screenshotWrap(<div>{renderSupportedCharts(dataSet.mixDataset01, config, info)}</div>);
        },
    )
    .add(
        "Dataset with negative and positive on left axis, negative and positive on right axis with negative min and max settings",
        () => {
            const { config, info } = getMinMaxConfig("-100", "0", "-4500", "0");
            return screenshotWrap(<div>{renderSupportedCharts(dataSet.mixDataset01, config, info)}</div>);
        },
    )
    .add("Dataset without attribute", () => {
        const config = {
            secondary_yaxis: {
                measures: ["snapshotMetric"],
            },
        };
        return screenshotWrap(<div>{renderSupportedCharts(barChartWithoutAttributes, config)}</div>);
    })
    .add("Column should not be cut off on right axis", () => {
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.sd160DataSet01)}</div>);
    })
    .add("Column should not be cut off on left axis", () => {
        return screenshotWrap(<div>{renderSupportedCharts(dataSet.sd160DataSet02)}</div>);
    })
    .add("Chart should be zero aligned and no columns is hidden", () => {
        // SD-538
        const chartConfig: IChartConfig = {
            type: VisualizationTypes.COLUMN,
            legend: {
                enabled: true,
                position: "top",
            },
            secondary_yaxis: {
                measures: ["wonMetric"],
            },
        };

        // real size causes SD-538
        const width = 907;
        const height = 526;

        return screenshotWrap(
            wrap(
                <div style={{ height, width }}>
                    <Visualization config={chartConfig} {...dataSet.leftPositiveRightMixDataset} />
                </div>,
                height + 40,
                width + 20,
            ),
        );
    });

// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";
import {
    columnChartWithMeasureViewByAndComputeRatio,
    columnChartWithMeasureViewBy,
    columnChartWithMeasureViewBy2AttributesAndComputeRatio,
    columnChartWithMeasureViewBy2Attributes,
} from "../test_data/fixtures";
import { wrap } from "../utils/wrap";
import { IChartConfig, VisualizationTypes } from "../../src";
import { Visualization } from "../../src/components/visualizations/Visualization";
import "../../styles/scss/charts.scss";

const renderSupportedChartsByDataSet = (dataset: any, config: IChartConfig = {}) => (
    <React.Fragment>
        {[VisualizationTypes.COLUMN, VisualizationTypes.BAR].map(type => {
            const newConfig: IChartConfig = {
                type,
                legend: {
                    enabled: true,
                    position: "top",
                },
                stackMeasuresToPercent: true,
                ...config,
            };

            if (type === VisualizationTypes.BAR) {
                newConfig.xaxis = config.yaxis;
                newConfig.yaxis = config.xaxis;
                newConfig.secondary_xaxis = config.secondary_yaxis;
                newConfig.dataLabels = {
                    visible: false, // disable data label on bar chart to make test stable
                };
            }

            return wrap(<Visualization config={newConfig} {...dataset} />);
        })}
    </React.Fragment>
);

storiesOf("Internal/OptionalStacking/Compute Ratio and Stack Measures To Percent", module)
    .add("Chart with 1 measure, 1 viewBy and stackMeasuresToPercent", () => {
        const config: IChartConfig = { stackMeasuresToPercent: true };
        return screenshotWrap(renderSupportedChartsByDataSet(columnChartWithMeasureViewBy, config));
    })
    .add("Chart with 1 measures, 1 viewBy and computeRatio", () =>
        screenshotWrap(renderSupportedChartsByDataSet(columnChartWithMeasureViewByAndComputeRatio)),
    )
    .add("Chart with 1 measures, 1 viewBy, computeRatio and stackMeasuresToPercent", () => {
        const config: IChartConfig = { stackMeasuresToPercent: true };
        return screenshotWrap(
            renderSupportedChartsByDataSet(columnChartWithMeasureViewByAndComputeRatio, config),
        );
    })
    .add("Chart with 1 measure, 2 viewBy and stackMeasuresToPercent", () => {
        const config: IChartConfig = { stackMeasuresToPercent: true };
        return screenshotWrap(
            renderSupportedChartsByDataSet(columnChartWithMeasureViewBy2Attributes, config),
        );
    })
    .add("Chart with 1 measures, 2 viewBy, and computeRatio", () =>
        screenshotWrap(
            renderSupportedChartsByDataSet(columnChartWithMeasureViewBy2AttributesAndComputeRatio),
        ),
    )
    .add("Chart with 1 measures, 2 viewBy, computeRatio and stackMeasuresToPercent", () => {
        const config: IChartConfig = { stackMeasuresToPercent: true };
        return screenshotWrap(
            renderSupportedChartsByDataSet(columnChartWithMeasureViewBy2AttributesAndComputeRatio, config),
        );
    });

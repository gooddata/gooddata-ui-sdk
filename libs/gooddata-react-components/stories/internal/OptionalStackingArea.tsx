// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";
import { Visualization } from "../../src/components/visualizations/Visualization";
import { wrap } from "../utils/wrap";
import "../../styles/scss/charts.scss";
import { IChartConfig, VisualizationTypes } from "../../src";
import {
    areaChartWith3MetricsAndViewByAttribute,
    areaChartWithMeasureViewByAndStackBy,
} from "../test_data/fixtures";

const renderSupportedCharts = (dataSet: any, config: IChartConfig = {}) => {
    const newConfig: IChartConfig = {
        type: VisualizationTypes.AREA,
        legend: {
            enabled: true,
            position: "top",
        },
        ...config,
    };
    return wrap(<Visualization config={newConfig} {...dataSet} />);
};

storiesOf("Internal/OptionalStacking/Area Chart", module)
    .add("Chart with viewBy 2 attributes and areas are stacked by default", () => {
        return screenshotWrap(renderSupportedCharts(areaChartWithMeasureViewByAndStackBy));
    })
    .add("Chart with viewBy 2 attributes and 'Stack Measures' enabled", () => {
        return screenshotWrap(
            renderSupportedCharts(areaChartWithMeasureViewByAndStackBy, {
                stackMeasures: true,
            }),
        );
    })
    .add("Chart with viewBy 2 attributes and 'Stack Measures' disabled", () => {
        return screenshotWrap(
            renderSupportedCharts(areaChartWithMeasureViewByAndStackBy, {
                stackMeasures: false,
            }),
        );
    })
    .add("Charts with viewBy 2 attributes and 'Stack to 100%' enabled", () => {
        return screenshotWrap(
            renderSupportedCharts(areaChartWithMeasureViewByAndStackBy, {
                stackMeasuresToPercent: true,
            }),
        );
    })
    .add("Chart with 1 attribute, 3 measures and areas are stacked by default", () => {
        return screenshotWrap(renderSupportedCharts(areaChartWith3MetricsAndViewByAttribute));
    })
    .add("Chart with 1 attribute, 3 measures and 'Stack Measures' enabled'", () => {
        return screenshotWrap(
            renderSupportedCharts(areaChartWith3MetricsAndViewByAttribute, {
                stackMeasures: true,
            }),
        );
    })
    .add("Chart with 1 attribute, 3 measures and 'Stack Measures' disabled'", () => {
        return screenshotWrap(
            renderSupportedCharts(areaChartWith3MetricsAndViewByAttribute, {
                stackMeasures: false,
            }),
        );
    })
    .add("Chart with 1 attribute, 3 measures and 'Stack to 100%' enabled'", () => {
        return screenshotWrap(
            renderSupportedCharts(areaChartWith3MetricsAndViewByAttribute, {
                stackMeasuresToPercent: true,
            }),
        );
    });

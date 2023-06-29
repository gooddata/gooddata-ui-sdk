// (C) 2020 GoodData Corporation
import { storiesOf } from "../../../_infra/storyRepository.js";
import React from "react";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { CustomStories } from "../../../_infra/storyGroups.js";
import { StorybookBackend, ReferenceWorkspaceId } from "../../../_infra/backend.js";

import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "../insightStories.css";
import {
    BarChartWithLargeLegend,
    BarChartWithTwoMeasuresAndTwoViewBy,
} from "../../../../scenarios/charts/barChart/base.js";
import {
    createElementCountResolver,
    ScreenshotReadyWrapper,
} from "../../../_infra/ScreenshotReadyWrapper.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const backend = StorybookBackend();

const BarChartTest = (config: Partial<IBarChartProps> = {}) => (
    <div
        style={{
            width: 400,
            height: 400,
            padding: 10,
            border: "solid 1px #000000",
            resize: "both",
            overflow: "auto",
        }}
        className="s-table"
    >
        <BarChart
            backend={backend}
            workspace={ReferenceWorkspaceId}
            measures={BarChartWithLargeLegend.measures}
            stackBy={BarChartWithLargeLegend.stackBy}
            filters={BarChartWithLargeLegend.filters}
            config={{
                legend: {
                    position: "top",
                    responsive: "autoPositionWithPopup",
                },
            }}
            {...config}
        />
    </div>
);

const BarChartWithHierarchicalLabelsTest = (config: Partial<IBarChartProps> = {}) => (
    <div
        style={{
            width: 400,
            height: 134,
            padding: 10,
            border: "solid 1px #000000",
            resize: "both",
            overflow: "auto",
        }}
        className="s-table"
    >
        <BarChart
            backend={backend}
            workspace={ReferenceWorkspaceId}
            measures={BarChartWithTwoMeasuresAndTwoViewBy.measures}
            viewBy={BarChartWithTwoMeasuresAndTwoViewBy.viewBy}
            config={{
                legend: {
                    position: "top",
                    responsive: "autoPositionWithPopup",
                },
                enableCompactSize: true,
            }}
            {...config}
        />
    </div>
);

storiesOf(`${CustomStories}/BarChart`)
    .add(
        "responsive popup legend",
        () => {
            return (
                <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                    <BarChartTest />
                </ScreenshotReadyWrapper>
            );
        },
        {
            screenshots: {
                closed: {},
                menuLegendClick: {
                    clickSelector: ".s-legend-popup-icon",
                    postInteractionWait: 300,
                },
                paginatorClick: {
                    clickSelectors: [".s-legend-popup-icon", 200, ".gd-icon-chevron-right"],
                    postInteractionWait: 300,
                },
            },
        },
    )
    .add(
        "themed popup legend",
        () => {
            return wrapWithTheme(
                <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                    <BarChartTest />
                </ScreenshotReadyWrapper>,
            );
        },
        {
            screenshots: {
                closed: {},
                menuLegendClick: {
                    clickSelector: ".s-legend-popup-icon",
                    postInteractionWait: 300,
                },
            },
        },
    )
    .add(
        "hidding of hierarchical axis labels",
        () => {
            return (
                <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                    <BarChartWithHierarchicalLabelsTest />
                </ScreenshotReadyWrapper>
            );
        },
        { screenshot: true },
    );

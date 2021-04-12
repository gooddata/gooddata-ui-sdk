// (C) 2020 GoodData Corporation
import { storiesOf } from "@storybook/react";
import React from "react";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { withMultipleScreenshots } from "../../../_infra/backstopWrapper";
import { CustomStories } from "../../../_infra/storyGroups";
import { StorybookBackend, ReferenceWorkspaceId } from "../../../_infra/backend";

import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "../insightStories.css";
import { BarChartWithLargeLegend } from "../../../../scenarios/charts/barChart/base";
import { createElementCountResolver, ScreenshotReadyWrapper } from "../../../_infra/ScreenshotReadyWrapper";
import { wrapWithTheme } from "../../themeWrapper";

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

storiesOf(`${CustomStories}/BarChart`, module).add("responsive popup legend", () => {
    return withMultipleScreenshots(
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <BarChartTest />
        </ScreenshotReadyWrapper>,
        {
            closed: {},
            menuLegendClick: {
                clickSelector: ".s-legend-popup-icon",
                postInteractionWait: 300,
            },
            paginatorClick: {
                clickSelectors: [".s-legend-popup-icon", 200, ".icon-chevron-right"],
                postInteractionWait: 300,
            },
        },
    );
});

storiesOf(`${CustomStories}/BarChart`, module).add("themed popup legend", () => {
    return withMultipleScreenshots(
        wrapWithTheme(
            <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                <BarChartTest />
            </ScreenshotReadyWrapper>,
        ),
        {
            closed: {},
            menuLegendClick: {
                clickSelector: ".s-legend-popup-icon",
                postInteractionWait: 300,
            },
        },
    );
});

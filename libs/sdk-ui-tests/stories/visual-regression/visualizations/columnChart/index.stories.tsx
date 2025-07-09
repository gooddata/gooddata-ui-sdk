// (C) 2021-2025 GoodData Corporation

import React from "react";
import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui-charts";
import { StorybookBackend, ReferenceWorkspaceId } from "../../../_infra/backend.js";

import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "../insightStories.css";
import { ColumnChartWithSingleMeasureAndTwoViewByAndStack } from "../../../../scenarios/charts/columnChart/base.js";
import {
    createElementCountResolver,
    ScreenshotReadyWrapper,
} from "../../../_infra/ScreenshotReadyWrapper.js";

const backend = StorybookBackend();

const ColumnChartWithHierarchicalLabelsTest = (config: Partial<IColumnChartProps> = {}) => (
    <div
        style={{
            width: 400,
            height: 170,
            padding: 10,
            border: "solid 1px #000000",
            resize: "both",
            overflow: "auto",
        }}
        className="s-table"
    >
        <ColumnChart
            backend={backend}
            workspace={ReferenceWorkspaceId}
            measures={ColumnChartWithSingleMeasureAndTwoViewByAndStack.measures}
            viewBy={ColumnChartWithSingleMeasureAndTwoViewByAndStack.viewBy}
            stackBy={ColumnChartWithSingleMeasureAndTwoViewByAndStack.stackBy}
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

export default {
    title: "02 Custom Test Stories/ColumnChart",
};

export const HidingOfHierarchicalAxisLabels = () => (
    <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
        <ColumnChartWithHierarchicalLabelsTest />
    </ScreenshotReadyWrapper>
);
HidingOfHierarchicalAxisLabels.parameters = { kind: "hiding of hierarchical axis labels", screenshot: true };

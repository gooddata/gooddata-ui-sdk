// (C) 2021-2025 GoodData Corporation

import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui-charts";
import "@gooddata/sdk-ui-charts/styles/css/main.css";

import { ColumnChartWithSingleMeasureAndTwoViewByAndStack } from "../../../../scenarios/charts/columnChart/base.js";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../_infra/backend.js";
import { IStoryParameters } from "../../../_infra/backstopScenario.js";
import {
    ScreenshotReadyWrapper,
    createElementCountResolver,
} from "../../../_infra/ScreenshotReadyWrapper.js";
import "../insightStories.css";

const backend = StorybookBackend();

function ColumnChartWithHierarchicalLabelsTest(config: Partial<IColumnChartProps> = {}) {
    return (
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
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "02 Custom Test Stories/ColumnChart",
};

export function HidingOfHierarchicalAxisLabels() {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <ColumnChartWithHierarchicalLabelsTest />
        </ScreenshotReadyWrapper>
    );
}
HidingOfHierarchicalAxisLabels.parameters = {
    kind: "hiding of hierarchical axis labels",
    screenshot: true,
} satisfies IStoryParameters;

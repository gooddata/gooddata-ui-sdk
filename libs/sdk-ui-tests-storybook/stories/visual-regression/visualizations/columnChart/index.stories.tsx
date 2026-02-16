// (C) 2021-2026 GoodData Corporation

import { ColumnChart, type IColumnChartProps } from "@gooddata/sdk-ui-charts";
import { ColumnChartWithSingleMeasureAndTwoViewByAndStack } from "@gooddata/sdk-ui-tests-scenarios";

import "@gooddata/sdk-ui-charts/styles/css/main.css";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../_infra/backend.js";
import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
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
    screenshot: { readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached } },
} satisfies IStoryParameters;

// (C) 2007-2025 GoodData Corporation

/* eslint-disable sonarjs/no-identical-functions */

import { action } from "storybook/actions";

import {
    type IPivotTableProps,
    PivotTable,
    newWidthForAllColumnsForMeasure,
    newWidthForAttributeColumn,
} from "@gooddata/sdk-ui-pivot";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/pivotTable.css";

import { AmountMeasurePredicate } from "../../../../scenarios/_infra/predicates.js";
import {
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndTwoRowsAndCols,
} from "../../../../scenarios/pivotTable/base.js";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../_infra/backend.js";
import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import {
    ScreenshotReadyWrapper,
    createElementCountResolver,
} from "../../../_infra/ScreenshotReadyWrapper.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const backend = StorybookBackend();
const tableConfig: IPivotTableProps["config"] = {
    menu: {
        aggregations: true,
    },
    columnSizing: {
        defaultWidth: "autoresizeAll",
    },
};

function PivotTableTest(config: Partial<IPivotTableProps> = {}) {
    return (
        <div
            style={{
                width: 800,
                height: 400,
                padding: 10,
                border: "solid 1px #000000",
                resize: "both",
                overflow: "auto",
            }}
            className="s-table"
        >
            <PivotTable
                backend={backend}
                workspace={ReferenceWorkspaceId}
                measures={PivotTableWithSingleMeasureAndTwoRowsAndCols.measures}
                rows={PivotTableWithSingleMeasureAndTwoRowsAndCols.rows}
                columns={PivotTableWithSingleMeasureAndTwoRowsAndCols.columns}
                onColumnResized={action("columnResized")}
                config={tableConfig}
                {...config}
            />
        </div>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "02 Custom Test Stories/Pivot Table",
};
export function TableWithResizing() {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <PivotTableTest />
        </ScreenshotReadyWrapper>
    );
}
TableWithResizing.parameters = {
    kind: "table with resizing",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const Themed = () =>
    wrapWithTheme(
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <PivotTableTest />
        </ScreenshotReadyWrapper>,
    );
Themed.parameters = {
    kind: "themed",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        misMatchThreshold: 0.01,
        hoverSelector:
            ".s-table-measure-column-header-group-cell-0.s-table-measure-column-header-cell-0.s-table-measure-column-header-index-2",
        postInteractionWait: { delay: 200 },
    },
} satisfies IStoryParameters;

export function DrillUnderlineStyle() {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <PivotTableTest drillableItems={[AmountMeasurePredicate]} />
        </ScreenshotReadyWrapper>
    );
}
DrillUnderlineStyle.parameters = {
    kind: "drill underline style",
    screenshots: {
        "standard cell": {
            readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
            misMatchThreshold: 0.01,
            hoverSelector: ".s-cell-1-2",
        },
        "empty cell": {
            readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
            misMatchThreshold: 0.01,
            hoverSelector: ".s-cell-3-2",
        },
    },
} satisfies IStoryParameters;

export function AutoResizingOfAllColumns() {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <PivotTableTest />
        </ScreenshotReadyWrapper>
    );
}
AutoResizingOfAllColumns.parameters = {
    kind: "auto-resizing of all columns",
    screenshots: {
        "initial viewport": {
            readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
            misMatchThreshold: 0.01,
        },
        "scrolled right": {
            /*
                this scroll is done to check if virtualized hidden cells
                are correctly resized after scroll

                ag-grid has a problem with programmatically scrolled header
                so we used a cell in the body to scroll instead
            */
            readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
            misMatchThreshold: 0.01,
            scrollToSelector: ".s-cell-0-9",
        },
    },
} satisfies IStoryParameters;

export function AutoResizingOfVisibleColumns() {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <PivotTableTest
                config={{
                    ...tableConfig,
                    columnSizing: {
                        defaultWidth: "viewport",
                    },
                }}
            />
        </ScreenshotReadyWrapper>
    );
}
AutoResizingOfVisibleColumns.parameters = {
    kind: "auto-resizing of visible columns",
    screenshots: {
        "initial viewport": {
            readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
            misMatchThreshold: 0.01,
        },
        "scrolled right": {
            /*
                this scroll is done to check if virtualized hidden cells
                are correctly resized after scroll

                ag-grid has a problem with programatically scrolled header
                so we used a cell in the body to scroll instead
            */
            readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
            misMatchThreshold: 0.01,
            scrollToSelector: ".s-cell-0-9",
            postInteractionWait: { delay: 1000 },
        },
    },
} satisfies IStoryParameters;

export function AutoResizingOfVisibleColumnsWithSomeOfThemManuallyShrinked() {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <PivotTableTest
                measures={PivotTableWithTwoMeasuresAndTwoRowsAndCols.measures}
                rows={PivotTableWithTwoMeasuresAndTwoRowsAndCols.rows}
                columns={PivotTableWithTwoMeasuresAndTwoRowsAndCols.columns}
                config={{
                    ...tableConfig,
                    columnSizing: {
                        defaultWidth: "viewport",
                        columnWidths: [
                            newWidthForAttributeColumn(
                                PivotTableWithTwoMeasuresAndTwoRowsAndCols.rows[0],
                                61,
                            ),
                            newWidthForAttributeColumn(
                                PivotTableWithTwoMeasuresAndTwoRowsAndCols.rows[1],
                                61,
                            ),
                            newWidthForAllColumnsForMeasure(
                                PivotTableWithTwoMeasuresAndTwoRowsAndCols.measures[0],
                                61,
                            ),
                        ],
                    },
                }}
            />
        </ScreenshotReadyWrapper>
    );
}
AutoResizingOfVisibleColumnsWithSomeOfThemManuallyShrinked.parameters = {
    kind: "auto-resizing of visible columns with some of them manually shrinked",
    screenshots: {
        "initial viewport": {
            readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
            misMatchThreshold: 0.01,
        },
    },
} satisfies IStoryParameters;

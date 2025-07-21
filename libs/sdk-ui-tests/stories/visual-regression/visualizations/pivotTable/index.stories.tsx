// (C) 2007-2025 GoodData Corporation
/* eslint-disable sonarjs/no-identical-functions */

import {
    PivotTable,
    IPivotTableProps,
    newWidthForAttributeColumn,
    newWidthForAllColumnsForMeasure,
} from "@gooddata/sdk-ui-pivot";
import {
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndTwoRowsAndCols,
} from "../../../../scenarios/pivotTable/base.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/pivotTable.css";
import { StorybookBackend, ReferenceWorkspaceId } from "../../../_infra/backend.js";
import { action } from "storybook/actions";
import {
    createElementCountResolver,
    ScreenshotReadyWrapper,
} from "../../../_infra/ScreenshotReadyWrapper.js";
import { AmountMeasurePredicate } from "../../../../scenarios/_infra/predicates.js";

const backend = StorybookBackend();
const tableConfig: IPivotTableProps["config"] = {
    menu: {
        aggregations: true,
    },
    columnSizing: {
        defaultWidth: "autoresizeAll",
    },
};

const PivotTableTest = (config: Partial<IPivotTableProps> = {}) => (
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

export default {
    title: "02 Custom Test Stories/Pivot Table",
};
export const TableWithResizing = () => (
    <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
        <PivotTableTest />
    </ScreenshotReadyWrapper>
);
TableWithResizing.parameters = { kind: "table with resizing", screenshot: true };

export const Themed = () =>
    wrapWithTheme(
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <PivotTableTest />
        </ScreenshotReadyWrapper>,
    );
Themed.parameters = {
    kind: "themed",
    screenshot: {
        hoverSelector:
            ".s-table-measure-column-header-group-cell-0.s-table-measure-column-header-cell-0.s-table-measure-column-header-index-2",
        postInteractionWait: 200,
    },
};

export const DrillUnderlineStyle = () => (
    <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
        <PivotTableTest drillableItems={[AmountMeasurePredicate]} />
    </ScreenshotReadyWrapper>
);
DrillUnderlineStyle.parameters = {
    kind: "drill underline style",
    screenshots: {
        "standard cell": {
            hoverSelector: ".s-cell-1-2",
            postInteractionWait: 1000,
        },
        "empty cell": {
            hoverSelector: ".s-cell-3-2",
            postInteractionWait: 1000,
        },
    },
};

export const AutoResizingOfAllColumns = () => (
    <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
        <PivotTableTest />
    </ScreenshotReadyWrapper>
);
AutoResizingOfAllColumns.parameters = {
    kind: "auto-resizing of all columns",
    screenshots: {
        "initial viewport": {},
        "scrolled right": {
            /*
                this scroll is done to check if virtualized hidden cells
                are correctly resized after scroll

                ag-grid has a problem with programatically scrolled header
                so we used a cell in the body to scroll instead
            */
            scrollToSelector: ".s-cell-0-9",
            postInteractionWait: 1000,
        },
    },
};

export const AutoResizingOfVisibleColumns = () => (
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
AutoResizingOfVisibleColumns.parameters = {
    kind: "auto-resizing of visible columns",
    screenshots: {
        "initial viewport": {},
        "scrolled right": {
            /*
                this scroll is done to check if virtualized hidden cells
                are correctly resized after scroll

                ag-grid has a problem with programatically scrolled header
                so we used a cell in the body to scroll instead
            */
            scrollToSelector: ".s-cell-0-9",
            postInteractionWait: 1000,
        },
    },
};

export const AutoResizingOfVisibleColumnsWithSomeOfThemManuallyShrinked = () => (
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
                        newWidthForAttributeColumn(PivotTableWithTwoMeasuresAndTwoRowsAndCols.rows[0], 61),
                        newWidthForAttributeColumn(PivotTableWithTwoMeasuresAndTwoRowsAndCols.rows[1], 61),
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
AutoResizingOfVisibleColumnsWithSomeOfThemManuallyShrinked.parameters = {
    kind: "auto-resizing of visible columns with some of them manually shrinked",
    screenshots: {
        "initial viewport": {},
    },
};

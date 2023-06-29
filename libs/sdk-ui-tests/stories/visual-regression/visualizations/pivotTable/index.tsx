// (C) 2007-2018 GoodData Corporation
/* eslint-disable sonarjs/no-identical-functions */
import { storiesOf } from "../../../_infra/storyRepository.js";
import React from "react";
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
import { CustomStories } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/pivotTable.css";
import { StorybookBackend, ReferenceWorkspaceId } from "../../../_infra/backend.js";
import { action } from "@storybook/addon-actions";
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

storiesOf(`${CustomStories}/Pivot Table`)
    .add(
        "table with resizing",
        () => (
            <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                <PivotTableTest />
            </ScreenshotReadyWrapper>
        ),
        { screenshot: true },
    )
    .add(
        "themed",
        () =>
            wrapWithTheme(
                <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                    <PivotTableTest />
                </ScreenshotReadyWrapper>,
            ),
        {
            screenshot: {
                hoverSelector:
                    ".s-table-measure-column-header-group-cell-0.s-table-measure-column-header-cell-0.s-table-measure-column-header-index-2",
                postInteractionWait: 200,
            },
        },
    )
    .add(
        "drill underline style",
        () => (
            <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                <PivotTableTest drillableItems={[AmountMeasurePredicate]} />
            </ScreenshotReadyWrapper>
        ),
        {
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
        },
    )
    .add(
        "auto-resizing of all columns",
        () => (
            <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                <PivotTableTest />
            </ScreenshotReadyWrapper>
        ),
        {
            screenshots: {
                "initial viewport": {},
                "scrolled right": {
                    /* 
                        this scroll is done to check if virtualized hidden cells 
                        are correctly resized after scroll

                        ag-grid has a problem with programatically scrolled header 
                        so we used a cell in the body to scroll instead
                    */
                    scrollToSelector: ".ag-center-cols-clipper .s-cell-0-9",
                    postInteractionWait: 1000,
                },
            },
        },
    )
    .add(
        "auto-resizing of visible columns",
        () => (
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
        ),
        {
            screenshots: {
                "initial viewport": {},
                "scrolled right": {
                    /* 
                        this scroll is done to check if virtualized hidden cells 
                        are correctly resized after scroll

                        ag-grid has a problem with programatically scrolled header 
                        so we used a cell in the body to scroll instead
                    */
                    scrollToSelector: ".ag-center-cols-clipper .s-cell-0-9",
                    postInteractionWait: 1000,
                },
            },
        },
    )
    .add(
        "auto-resizing of visible columns with some of them manually shrinked",
        () => (
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
        ),
        {
            screenshots: {
                "initial viewport": {},
            },
        },
    );

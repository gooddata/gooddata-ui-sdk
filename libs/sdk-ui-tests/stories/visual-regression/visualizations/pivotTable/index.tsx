// (C) 2007-2018 GoodData Corporation
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { PivotTableWithSingleMeasureAndTwoRowsAndCols } from "../../../../scenarios/pivotTable/base";
import { withScreenshot } from "../../../_infra/backstopWrapper";
import { CustomStories } from "../../../_infra/storyGroups";

import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/pivotTable.css";
import { StorybookBackend, ReferenceWorkspaceId } from "../../../_infra/backend";
import { action } from "@storybook/addon-actions";
import { createElementCountResolver, ScreenshotReadyWrapper } from "../../../_infra/ScreenshotReadyWrapper";

const backend = StorybookBackend();

storiesOf(`${CustomStories}/Pivot Table`, module).add("table with resizing", () =>
    withScreenshot(
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
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
                    config={{
                        menu: {
                            aggregations: true,
                            aggregationsSubMenu: true,
                        },
                        columnSizing: {
                            defaultWidth: "viewport",
                        },
                    }}
                    onColumnResized={action("columnResized")}
                />
            </div>
            ,
        </ScreenshotReadyWrapper>,
    ),
);

// (C) 2007-2018 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { PivotTable } from "@gooddata/sdk-ui";
import { PivotTableWithSingleMeasureAndTwoRowsAndCols } from "../../../../scenarios/pivotTable/base";
import { screenshotWrap } from "../../_infra/screenshotWrap";
import { CustomStories } from "../../_infra/storyGroups";

import "@gooddata/sdk-ui/styles/css/main.css";
import "@gooddata/sdk-ui/styles/css/pivotTable.css";

const DefaultWorkspace = "testWorkspace";

const backend = recordedBackend(ReferenceRecordings.Recordings);

storiesOf(`${CustomStories}/Pivot Table`, module).add("table with resizing", () =>
    screenshotWrap(
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
                workspace={DefaultWorkspace}
                measures={PivotTableWithSingleMeasureAndTwoRowsAndCols.measures}
                rows={PivotTableWithSingleMeasureAndTwoRowsAndCols.rows}
                columns={PivotTableWithSingleMeasureAndTwoRowsAndCols.columns}
            />
        </div>,
    ),
);

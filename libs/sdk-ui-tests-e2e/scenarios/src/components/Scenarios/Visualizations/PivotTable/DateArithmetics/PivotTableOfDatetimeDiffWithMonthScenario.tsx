// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

const measures = [
    ReferenceMd.DiffOfMonth2SameParams,
    ReferenceMd.DiffOfMonth2DifferenceParams,
    ReferenceMd.DiffOfMonth2ParamsAndString,
    ReferenceMd.DiffOfMonth3Parameters,
    ReferenceMd.DiffOfMonth3ParamsAndString,
    ReferenceMd.DiffOfMonth3DifferenceParams,
];
const attributes = [
    ReferenceMd.DateDatasets.Closed.ClosedMonthYear.Default,
    ReferenceMd.DateDatasets.Snapshot.SnapshotMonthYear.Default,
];

const style = { height: 300 };

export const PivotTableOfDatetimeDiffWithMonthScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} />
        </div>
    );
};

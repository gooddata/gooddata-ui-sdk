// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

const measures = [
    ReferenceMd.DiffOfYear2Parameters,
    ReferenceMd.DiffOfYear3Parameters,
    ReferenceMd.DiffOfYearNext,
    ReferenceMd.DiffOfYearPrevious,
    ReferenceMd.DiffOfYearStringAndThis,
    ReferenceMd.DiffOfYearString,
    ReferenceMd.DiffOfYearPreviousAndNext,
];
const attributes = [
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
    ReferenceMd.DateDatasets.Snapshot.SnapshotYear.Default,
];

const style = { height: 300 };

export const PivotTableOfDatetimeDiffWithYearScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} />
        </div>
    );
};

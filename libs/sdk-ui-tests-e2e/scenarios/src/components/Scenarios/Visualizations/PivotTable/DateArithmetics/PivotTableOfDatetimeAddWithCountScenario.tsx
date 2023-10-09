// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

const measures = [
    ReferenceMd.CountOfSalesRepWithDatetimeAddAndMax,
    ReferenceMd.CountOfSalesRepWithDatetimeAndPrevious,
    ReferenceMd.DatetimeAddWithIfElse,
    ReferenceMd.CountOfSalesRepAndDatetimeCondition,
];
const attributes = [
    ReferenceMd.DateDatasets.Snapshot.SnapshotYear.Default,
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
];

const style = { height: 300 };

export const PivotTableOfDatetimeAddWithCountScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} />
        </div>
    );
};

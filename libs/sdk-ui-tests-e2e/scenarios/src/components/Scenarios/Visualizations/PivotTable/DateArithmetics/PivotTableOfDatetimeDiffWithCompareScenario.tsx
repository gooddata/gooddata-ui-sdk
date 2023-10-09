// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

const measures = [
    ReferenceMd.CountOfSalesRepWithDiffAnd3DifferenceParams,
    ReferenceMd.CountOfSalesRepWithDiffAndMaxByAllOther,
    ReferenceMd.CountOfSalesRepsWithDiffAndMaxCondition,
    ReferenceMd.CountOfSalesRepWithDiffAndAdd,
];
const attributes = [
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
];

const style = { height: 300 };

export const PivotTableOfDatetimeDiffWithCompareScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} />
        </div>
    );
};

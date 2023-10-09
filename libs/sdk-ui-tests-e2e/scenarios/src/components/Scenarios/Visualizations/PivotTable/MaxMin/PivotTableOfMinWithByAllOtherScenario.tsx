// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAbsoluteDateFilter } from "@gooddata/sdk-model";

const measures = [
    ReferenceMd.Amount,
    ReferenceMd.SumOfAmountWithMinAndByAllOther,
    ReferenceMd.SumOfAmountWithMinAndByAllOtherExcept,
];
const attributes = [
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
];
const filters = [
    newAbsoluteDateFilter("dt_oppcreated_timestamp", "2010-01-01", "2012-12-31"),
    newAbsoluteDateFilter("dt_closedate_timestamp", "2010-01-01", "2012-12-31"),
];

const style = { height: 300 };

export const PivotTableOfMinWithByAllOtherScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} filters={filters} />
        </div>
    );
};

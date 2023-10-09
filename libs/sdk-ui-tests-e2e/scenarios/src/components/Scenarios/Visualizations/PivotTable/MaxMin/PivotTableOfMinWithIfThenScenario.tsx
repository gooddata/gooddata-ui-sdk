// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAbsoluteDateFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";

const measures = [ReferenceMd.Amount, ReferenceMd.SumOfAmountWithIfHavingAndMin];
const attributes = [
    ReferenceMd.CountyName,
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
];

const filters = [
    newAbsoluteDateFilter("dt_oppcreated_timestamp", "2009-01-01", "2010-12-31"),
    newPositiveAttributeFilter("county_name", ["Clark", "Dutchess"]),
];

const style = { height: 300 };

export const PivotTableOfMinWithIfThenScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} filters={filters} />
        </div>
    );
};

// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAbsoluteDateFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";

const measures = [ReferenceMd.Amount, ReferenceMd.SumOfAmountWithCaseAndMax];
const attributes = [
    ReferenceMd.CountyName,
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
];
const filters = [
    newAbsoluteDateFilter("dt_closedate_timestamp", "2010-01-01", "2011-12-31"),
    newPositiveAttributeFilter("county_name", ["Clark", "Dutchess"]),
];

const style = { height: 300 };

export const PivotTableOfMaxWithCaseWhenScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} filters={filters} />
        </div>
    );
};

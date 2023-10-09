// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAbsoluteDateFilter } from "@gooddata/sdk-model";

const measures = [
    ReferenceMd.SumOfAmountBetweenMaxCreatedYearAndPreviousYear,
    ReferenceMd.SumOfAmountNotBetweenMaxCreatedYearAndThisYear,
];
const attributes = [
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
];
const filters = [newAbsoluteDateFilter("dt_oppcreated_timestamp", "2011-01-01", "2011-12-31")];

const style = { height: 300 };

export const PivotTableOfMaxWithMacroYearScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} filters={filters} />
        </div>
    );
};

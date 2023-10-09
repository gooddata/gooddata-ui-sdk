// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAbsoluteDateFilter } from "@gooddata/sdk-model";

const measures = [
    ReferenceMd.SumAmountWithDatetimeAddAndBetween,
    ReferenceMd.SumAmountWithDatetimeAddAndNotBetween,
];
const attributes = [
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
];
const filters = [newAbsoluteDateFilter("dt_closedate_timestamp", "2011-01-01", "2011-12-31")];

const style = { height: 300 };

export const PivotTableOfDatetimeAddWithBetweenScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} filters={filters} />
        </div>
    );
};

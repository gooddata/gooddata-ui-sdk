// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAbsoluteDateFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";

const measures = [
    ReferenceMd.Amount,
    ReferenceMd.RunsumFirstValueOfAmountWithCondition,
    ReferenceMd.RunsumLastValueOfAmountWithCondition,
];
const attributes = [ReferenceMd.SalesRep.Default, ReferenceMd.DateDatasets.Created.CreatedYear.Default];
const filters = [
    newAbsoluteDateFilter("dt_oppcreated_timestamp", "2010-01-01", "2011-12-31"),
    newPositiveAttributeFilter("attr.f_owner.salesrep", [
        "Alejandro Vabiano",
        "Adam Bradley",
        "Alexsandr Fyodr",
    ]),
];

const style = { height: 300 };

export const PivotTableOfFirstLastValueWithRunSumScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} filters={filters} />
        </div>
    );
};

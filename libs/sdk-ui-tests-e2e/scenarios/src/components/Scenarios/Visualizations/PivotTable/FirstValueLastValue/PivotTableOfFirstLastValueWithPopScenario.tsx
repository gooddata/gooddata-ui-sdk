// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";

const measures = [
    ReferenceMd.ForNextFirstValueOfAmount,
    ReferenceMd.ForNextLastValueOfAmount,
    ReferenceMd.ForPreviousFirstValueOfAmount,
    ReferenceMd.ForPreviousLastValueOfAmount,
];
const attributes = [ReferenceMd.SalesRep.Default, ReferenceMd.DateDatasets.Closed.ClosedYear.Default];
const filters = [newPositiveAttributeFilter("attr.f_owner.salesrep", ["Adam Bradley"])];

const style = { height: 300 };

export const PivotTableOfFirstLastValueWithPopScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} filters={filters} />
        </div>
    );
};

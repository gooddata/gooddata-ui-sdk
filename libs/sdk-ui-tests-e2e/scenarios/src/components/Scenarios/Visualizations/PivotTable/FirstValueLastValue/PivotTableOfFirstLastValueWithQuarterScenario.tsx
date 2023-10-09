// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAbsoluteDateFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";

const measures = [ReferenceMd.FirstValueOfAmountByQuarter, ReferenceMd.LastValueOfAmountByQuarter];
const attributes = [ReferenceMd.SalesRep.Default, ReferenceMd.DateDatasets.Closed.ClosedQuarterYear.Default];
const filters = [
    newAbsoluteDateFilter("dt_closedate_timestamp", "2010-01-01", "2011-12-31"),
    newPositiveAttributeFilter("attr.f_owner.salesrep", ["Ellen Jones"]),
];

const style = { height: 300 };

export const PivotTableOfFirstLastValueWithQuarterScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} filters={filters} />
        </div>
    );
};

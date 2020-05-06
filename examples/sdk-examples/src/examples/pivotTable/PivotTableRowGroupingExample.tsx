// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { Ldm, LdmExt } from "../../ldm";

const measures = [
    LdmExt.FranchiseFees,
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesInitialFranchiseFee,
    LdmExt.FranchiseFeesOngoingRoyalty,
];
const attributes = [Ldm.LocationState, Ldm.LocationName.Default, Ldm.MenuCategory];
const columns = [Ldm.DateQuarter, Ldm.DateMonth.Short];
const style = { height: 500 };

export const PivotTableRowGroupingExample: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table-row-grouping">
            <PivotTable measures={measures} rows={attributes} columns={columns} pageSize={20} groupRows />
        </div>
    );
};

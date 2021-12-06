// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAttributeSort, modifyAttribute } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../md";

const measures = [
    LdmExt.FranchiseFees,
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesInitialFranchiseFee,
    LdmExt.FranchiseFeesOngoingRoyalty,
];
const attributes = [
    Ldm.LocationState,
    Ldm.LocationName.Default,
    modifyAttribute(Ldm.MenuCategory, (a) => a.localId("menu")),
];
const columns = [Ldm.DateQuarter, Ldm.DateMonth.Short];
const sortBy = [newAttributeSort("menu", "asc")];

const style = { height: 300 };

export const PivotTableSortingExample: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table-sorting">
            <PivotTable
                measures={measures}
                rows={attributes}
                columns={columns}
                pageSize={20}
                sortBy={sortBy}
            />
        </div>
    );
};

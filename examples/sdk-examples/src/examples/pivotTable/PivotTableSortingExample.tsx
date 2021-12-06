// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAttributeSort, modifyAttribute } from "@gooddata/sdk-model";
import { Md, MdExt } from "../../md";

const measures = [
    MdExt.FranchiseFees,
    MdExt.FranchiseFeesAdRoyalty,
    MdExt.FranchiseFeesInitialFranchiseFee,
    MdExt.FranchiseFeesOngoingRoyalty,
];
const attributes = [
    Md.LocationState,
    Md.LocationName.Default,
    modifyAttribute(Md.MenuCategory, (a) => a.localId("menu")),
];
const columns = [Md.DateQuarter, Md.DateMonth.Short];
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

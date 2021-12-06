// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { ITotal } from "@gooddata/sdk-model";
import { Md, MdExt } from "../../md";

const measures = [
    MdExt.FranchiseFees,
    MdExt.FranchiseFeesAdRoyalty,
    MdExt.FranchiseFeesInitialFranchiseFee,
    MdExt.FranchiseFeesOngoingRoyalty,
];
const attributes = [Md.LocationState, MdExt.LocationName, MdExt.MenuCategory];
const totals: ITotal[] = [
    {
        measureIdentifier: "franchiseFees",
        type: "sum",
        attributeIdentifier: "locationName",
    },
    {
        measureIdentifier: "franchiseFees",
        type: "avg",
        attributeIdentifier: "locationName",
    },
    {
        measureIdentifier: "franchiseFeesOngoingRoyalty",
        type: "sum",
        attributeIdentifier: "menu",
    },
    {
        measureIdentifier: "franchiseFees",
        type: "max",
        attributeIdentifier: "menu",
    },
];
const columns = [Md.DateQuarter, Md.DateMonth.Short];
const config = {
    menu: {
        aggregations: true,
        aggregationsSubMenu: true,
    },
};
const style = { height: 500 };

export const PivotTableSubtotalsExample: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table-row-grouping">
            <PivotTable
                measures={measures}
                config={config}
                rows={attributes}
                columns={columns}
                totals={totals}
                pageSize={20}
            />
        </div>
    );
};

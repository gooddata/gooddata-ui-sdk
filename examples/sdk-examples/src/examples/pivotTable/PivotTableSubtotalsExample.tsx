// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { ITotal } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../md";

const measures = [
    LdmExt.FranchiseFees,
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesInitialFranchiseFee,
    LdmExt.FranchiseFeesOngoingRoyalty,
];
const attributes = [Ldm.LocationState, LdmExt.LocationName, LdmExt.MenuCategory];
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
const columns = [Ldm.DateQuarter, Ldm.DateMonth.Short];
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

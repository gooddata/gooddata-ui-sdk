// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { ITotal } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../ldm";

const measures = [
    LdmExt.FranchiseFees,
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesInitialFranchiseFee,
    LdmExt.FranchiseFeesOngoingRoyalty,
];

const attributes = [LdmExt.LocationState, Ldm.LocationName.Default, Ldm.MenuCategory];

const columns = [Ldm.DateQuarter, Ldm.DateMonth.Short];
const totals: ITotal[] = [
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "sum",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "avg",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "franchiseFeesAdRoyaltyIdentifier",
        type: "sum",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "max",
        attributeIdentifier: "state",
    },
];
const style = { height: 300 };
const config = {
    menu: {
        aggregations: true,
    },
};

export const PivotTableTotalsExample: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table-totals">
            <PivotTable
                config={config}
                measures={measures}
                rows={attributes}
                columns={columns}
                pageSize={20}
                totals={totals}
            />
        </div>
    );
};

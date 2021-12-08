// (C) 2007-2021 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { ITotal, modifyAttribute, modifyMeasure } from "@gooddata/sdk-model";
import { Md } from "../../md";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) =>
    m.format("#,##0").localId("franchiseFees").title("Franchise Fees"),
);
const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesAdRoyalty"),
);
const FranchiseFeesInitialFranchiseFee = modifyMeasure(Md.$FranchiseFeesInitialFranchiseFee, (m) =>
    m.format("#,##0").localId("franchiseFeesInitialFranchiseFee"),
);
const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesOngoingRoyalty"),
);
const LocationName = modifyAttribute(Md.LocationName.Default, (a) => a.localId("locationName"));
const MenuCategory = modifyAttribute(Md.MenuCategory, (a) => a.localId("menuCategory"));

const measures = [
    FranchiseFees,
    FranchiseFeesAdRoyalty,
    FranchiseFeesInitialFranchiseFee,
    FranchiseFeesOngoingRoyalty,
];
const attributes = [Md.LocationState, LocationName, MenuCategory];
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

// (C) 2007-2021 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { ITotal, modifyAttribute, modifyMeasure, newTotal } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

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
const LocationState = modifyAttribute(Md.LocationState, (a) => a.localId("locationState"));

const measures = [
    FranchiseFees,
    FranchiseFeesAdRoyalty,
    FranchiseFeesInitialFranchiseFee,
    FranchiseFeesOngoingRoyalty,
];

const attributes = [LocationState, Md.LocationName.Default, Md.MenuCategory];

const columns = [Md.DateQuarter, Md.DateMonth.Short];
const totals: ITotal[] = [
    newTotal("sum", FranchiseFees, LocationState),
    newTotal("avg", FranchiseFees, LocationState),
    newTotal("sum", FranchiseFeesAdRoyalty, LocationState),
    newTotal("max", FranchiseFees, LocationState),
];

const style = { height: 600 };
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

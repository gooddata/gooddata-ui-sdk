// (C) 2007-2022 GoodData Corporation
import React from "react";
import { IPivotTableConfig, PivotTable } from "@gooddata/sdk-ui-pivot";
import { modifyMeasure, newTotal } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) => m.format("#,##0").title("Franchise Fees"));
const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) => m.format("#,##0"));
const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) => m.format("#,##0"));
const FranchiseFeesInitialFranchiseFee = modifyMeasure(Md.$FranchiseFeesInitialFranchiseFee, (m) =>
    m.format("#,##0"),
);

const measures = [
    FranchiseFees,
    FranchiseFeesAdRoyalty,
    FranchiseFeesInitialFranchiseFee,
    FranchiseFeesOngoingRoyalty,
];

const attributes = [Md.LocationState, Md.LocationName.Default, Md.MenuCategory];

const columns = [Md.DateQuarter, Md.DateMonth.Short];
const totals = [
    newTotal("sum", FranchiseFees, Md.LocationState),
    newTotal("avg", FranchiseFees, Md.LocationState),
    newTotal("sum", FranchiseFeesAdRoyalty, Md.LocationState),
    newTotal("max", FranchiseFees, Md.LocationState),
];

const style: React.CSSProperties = { height: 600 };
const config: IPivotTableConfig = {
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

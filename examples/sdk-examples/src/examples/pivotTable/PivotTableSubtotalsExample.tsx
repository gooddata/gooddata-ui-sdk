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
const totals = [
    newTotal("sum", FranchiseFees, Md.LocationName.Default),
    newTotal("avg", FranchiseFees, Md.LocationName.Default),
    newTotal("sum", FranchiseFeesOngoingRoyalty, Md.MenuCategory),
    newTotal("max", FranchiseFees, Md.MenuCategory),
];
const columns = [Md.DateQuarter, Md.DateMonth.Short];
const config: IPivotTableConfig = {
    menu: {
        aggregations: true,
        aggregationsSubMenu: true,
    },
};
const style: React.CSSProperties = { height: 500 };

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

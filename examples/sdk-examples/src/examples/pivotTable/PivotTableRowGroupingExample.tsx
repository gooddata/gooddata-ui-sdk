// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { modifyMeasure } from "@gooddata/sdk-model";
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

const measures = [
    FranchiseFees,
    FranchiseFeesAdRoyalty,
    FranchiseFeesInitialFranchiseFee,
    FranchiseFeesOngoingRoyalty,
];
const attributes = [Md.LocationState, Md.LocationName.Default, Md.MenuCategory];
const columns = [Md.DateQuarter, Md.DateMonth.Short];
const style = { height: 500 };
const config = { groupRows: true };

export const PivotTableRowGroupingExample: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table-row-grouping">
            <PivotTable
                measures={measures}
                rows={attributes}
                columns={columns}
                config={config}
                pageSize={20}
            />
        </div>
    );
};

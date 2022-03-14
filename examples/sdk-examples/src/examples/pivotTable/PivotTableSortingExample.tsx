// (C) 2007-2022 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAttributeSort, modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) => m.format("#,##0").title("Franchise Fees"));
const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) => m.format("#,##0"));
const FranchiseFeesInitialFranchiseFee = modifyMeasure(Md.$FranchiseFeesInitialFranchiseFee, (m) =>
    m.format("#,##0"),
);
const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) => m.format("#,##0"));

const measures = [
    FranchiseFees,
    FranchiseFeesAdRoyalty,
    FranchiseFeesInitialFranchiseFee,
    FranchiseFeesOngoingRoyalty,
];
const attributes = [Md.LocationState, Md.LocationName.Default, Md.MenuCategory];
const columns = [Md.DateDatasets.Date.Quarter.Default, Md.DateDatasets.Date.Month.Short];
const sortBy = [newAttributeSort(Md.MenuCategory, "asc")];

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

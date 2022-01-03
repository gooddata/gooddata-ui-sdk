// (C) 2007-2022 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAttributeSort, newAbsoluteDateFilter, modifyMeasure } from "@gooddata/sdk-model";
import { ExampleWithExport } from "./ExampleWithExport";
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

const columns = [Md.DateQuarter, Md.DateMonth.Short];

const sortBy = [newAttributeSort("menu", "asc")];

const filters = [newAbsoluteDateFilter(Md.DateDatasets.Date, "2017-01-01", "2017-12-31")];

const style = { height: 300 };

export const PivotTableExportExample: React.FC = () => {
    return (
        <ExampleWithExport filters={filters}>
            {(onExportReady) => (
                <div style={style} className="s-pivot-table-sorting">
                    <PivotTable
                        measures={measures}
                        rows={attributes}
                        columns={columns}
                        pageSize={20}
                        sortBy={sortBy}
                        filters={filters}
                        onExportReady={onExportReady}
                    />
                </div>
            )}
        </ExampleWithExport>
    );
};

// (C) 2007-2021 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAttributeSort, newAbsoluteDateFilter, modifyAttribute, modifyMeasure } from "@gooddata/sdk-model";
import { ExampleWithExport } from "./ExampleWithExport";
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
const MenuCategory = modifyAttribute(Md.MenuCategory, (a) => a.localId("menuCategory"));

const measures = [
    FranchiseFees,
    FranchiseFeesAdRoyalty,
    FranchiseFeesInitialFranchiseFee,
    FranchiseFeesOngoingRoyalty,
];

const attributes = [Md.LocationState, Md.LocationName.Default, MenuCategory];

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

// (C) 2007-2021 GoodData Corporation
import React from "react";
import { PivotTable, IPivotTableConfig } from "@gooddata/sdk-ui-pivot";
import { modifyAttribute, modifyMeasure } from "@gooddata/sdk-model";
import { Md } from "../../md";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) =>
    m.format("#,##0").localId("franchiseFees").title("Franchise Fees"),
);
const EmployeeName = modifyAttribute(Md.EmployeeName.Default, (a) => a.localId("employeeName"));
const LocationName = modifyAttribute(Md.LocationName.Default, (a) => a.localId("locationName"));

const measures = [FranchiseFees];

const attributes = [EmployeeName];

const columns = [LocationName];

const config: IPivotTableConfig = {
    columnSizing: {
        defaultWidth: "viewport",
        growToFit: true,
    },
};

export const PivotTableColumnsGrowToFitExample: React.FC = () => {
    return (
        <div
            style={{ height: 300, resize: "both", overflow: "auto" }}
            className="s-pivot-table-columns-grow-to-fit"
        >
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

export default PivotTableColumnsGrowToFitExample;

// (C) 2007-2021 GoodData Corporation
import React from "react";
import { PivotTable, DefaultColumnWidth } from "@gooddata/sdk-ui-pivot";

import { Md } from "../../md";
import { modifyAttribute, modifyMeasure } from "@gooddata/sdk-model";

const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) =>
    m.format("#,##0").title("Franchise Sales").localId("franchiseSales"),
);
const EmployeeName = modifyAttribute(Md.EmployeeName.Default, (a) => a.localId("EmployeeName"));
const LocationName = modifyAttribute(Md.LocationName.Default, (a) => a.localId("LocationName"));

const measures = [FranchisedSales];

const attributes = [EmployeeName];

const columns = [LocationName];

const config = {
    columnSizing: {
        defaultWidth: "viewport" as DefaultColumnWidth,
    },
};

export const PivotTableSizingExample: React.FC = () => {
    return (
        <div style={{ height: 300 }} className="s-pivot-table-sizing">
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

export default PivotTableSizingExample;

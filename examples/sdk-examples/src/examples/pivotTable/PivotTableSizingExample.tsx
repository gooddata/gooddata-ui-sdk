// (C) 2007-2022 GoodData Corporation
import React from "react";
import { PivotTable, DefaultColumnWidth } from "@gooddata/sdk-ui-pivot";

import * as Md from "../../md/full";
import { modifyMeasure } from "@gooddata/sdk-model";

const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) => m.format("#,##0").title("Franchise Sales"));

const measures = [FranchisedSales];

const attributes = [Md.EmployeeName.Default];

const columns = [Md.LocationName.Default];

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

// (C) 2007-2020 GoodData Corporation
import React from "react";
import { PivotTable, DefaultColumnWidth } from "@gooddata/sdk-ui-pivot";

import { MdExt } from "../../md";

const measures = [MdExt.FranchisedSales];

const attributes = [MdExt.EmployeeName];

const columns = [MdExt.LocationName];

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

// (C) 2007-2020 GoodData Corporation
import React from "react";
import { PivotTable, DefaultColumnWidth } from "@gooddata/sdk-ui-pivot";

import { LdmExt } from "../../md";

const measures = [LdmExt.FranchisedSales];

const attributes = [LdmExt.EmployeeName];

const columns = [LdmExt.LocationName];

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

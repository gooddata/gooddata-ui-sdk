// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { LdmExt } from "../../md";

const style = { height: 300 };

export const ColumnChartExample: React.FC = () => {
    return (
        <div style={style} className="s-column-chart">
            <ColumnChart measures={[LdmExt.TotalSales1]} viewBy={LdmExt.monthDate} />
        </div>
    );
};

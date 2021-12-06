// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { MdExt } from "../../md";

const style = { height: 300 };

export const ColumnChartExample: React.FC = () => {
    return (
        <div style={style} className="s-column-chart">
            <ColumnChart measures={[MdExt.TotalSales1]} viewBy={MdExt.monthDate} />
        </div>
    );
};

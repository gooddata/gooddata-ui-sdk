// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { Ldm, LdmExt } from "../../md";

const style = { height: 300 };

export const BarChartExample: React.FC = () => {
    return (
        <div style={style} className="s-bar-chart">
            <BarChart measures={[LdmExt.TotalSales1]} viewBy={Ldm.LocationResort} />
        </div>
    );
};

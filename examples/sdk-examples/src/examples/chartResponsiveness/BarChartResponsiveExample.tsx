// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { Ldm, LdmExt } from "../../ldm";

const config = {
    enableCompactSize: true,
};

export const BarChartResponsiveExample: React.FC = () => {
    return (
        <div className="s-bar-chart" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ height: 100 }}>
                <BarChart measures={[LdmExt.TotalSales1]} viewBy={Ldm.LocationResort} config={config} />
            </div>
            <div style={{ height: 200 }}>
                <BarChart measures={[LdmExt.TotalSales1]} viewBy={Ldm.LocationResort} config={config} />
            </div>
            <div style={{ height: 300 }}>
                <BarChart measures={[LdmExt.TotalSales1]} viewBy={Ldm.LocationResort} config={config} />
            </div>
        </div>
    );
};

// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { MdExt } from "../../../md";
import { measureLocalId } from "@gooddata/sdk-model";

const config = {
    secondary_yaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto",
        min: "-75000000",
        max: "75000000",
        measures: [measureLocalId(MdExt.TotalCosts)],
    },
    yaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto",
        min: "-75000000",
        max: "75000000",
        measures: [measureLocalId(MdExt.TotalSales2)],
    },
};

export const DualAxisColumnChartExample: React.FC = () => {
    return (
        <div style={{ height: 300 }} className="s-dual-axis-column-chart">
            <ColumnChart
                measures={[MdExt.TotalCosts, MdExt.TotalSales2]}
                viewBy={MdExt.LocationState}
                config={config}
            />
        </div>
    );
};

// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { LdmExt } from "../../../md";
import { measureLocalId } from "@gooddata/sdk-model";

const config = {
    secondary_yaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto",
        min: "-75000000",
        max: "75000000",
        measures: [measureLocalId(LdmExt.TotalCosts)],
    },
    yaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto",
        min: "-75000000",
        max: "75000000",
        measures: [measureLocalId(LdmExt.TotalSales2)],
    },
};

export const DualAxisColumnChartExample: React.FC = () => {
    return (
        <div style={{ height: 300 }} className="s-dual-axis-column-chart">
            <ColumnChart
                measures={[LdmExt.TotalCosts, LdmExt.TotalSales2]}
                viewBy={LdmExt.LocationState}
                config={config}
            />
        </div>
    );
};

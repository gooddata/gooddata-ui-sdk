// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";

import { InsightView } from "@gooddata/sdk-ui-ext";
import { Md } from "../../../md";
import { totalCostsLocalId, totalSalesLocalIdentifier } from "../../../md/ext";

export class InsightViewDualAxisBarChartExample extends Component {
    public render(): React.ReactNode {
        const config = {
            secondary_xaxis: {
                visible: true,
                labelsEnabled: true,
                rotation: "auto",
                min: "-75000000",
                max: "75000000",
                measures: [totalSalesLocalIdentifier],
            },
            xaxis: {
                visible: true,
                labelsEnabled: true,
                rotation: "auto",
                min: "-75000000",
                max: "75000000",
                measures: [totalCostsLocalId],
            },
        };

        return (
            <div style={{ height: 300 }} className="s-insightView-dual-axis-bar">
                <InsightView insight={Md.Insights.DualAxisBarChart} config={config} />
            </div>
        );
    }
}

export default InsightViewDualAxisBarChartExample;

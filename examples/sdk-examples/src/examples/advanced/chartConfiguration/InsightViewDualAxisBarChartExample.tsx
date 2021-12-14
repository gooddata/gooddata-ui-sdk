// (C) 2007-2021 GoodData Corporation
import React, { Component } from "react";

import { InsightView } from "@gooddata/sdk-ui-ext";
import * as Md from "../../../md/full";

export class InsightViewDualAxisBarChartExample extends Component {
    public render(): React.ReactNode {
        const config = {
            secondary_xaxis: {
                visible: true,
                labelsEnabled: true,
                rotation: "auto",
                min: "-75000000",
                max: "75000000",
                measures: ["c11c27a0b0314a83bfe5b64ab9de7b89"],
            },
            xaxis: {
                visible: true,
                labelsEnabled: true,
                rotation: "auto",
                min: "-75000000",
                max: "75000000",
                measures: ["totalCosts"],
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

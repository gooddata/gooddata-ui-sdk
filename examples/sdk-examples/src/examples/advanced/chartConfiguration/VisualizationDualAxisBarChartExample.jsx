// (C) 2007-2018 GoodData Corporation
import React, { Component } from "react";

import { Visualization } from "@gooddata/sdk-ui";

import {
    projectId,
    dualAxisBarVisualizationIdentifier,
    totalSalesLocalIdentifier,
    totalCostsLocalIdentifier,
} from "../../../constants/fixtures";

export class VisualizationDualAxisBarChartExample extends Component {
    render() {
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
                measures: [totalCostsLocalIdentifier],
            },
        };

        return (
            <div style={{ height: 300 }} className="s-visualization-dual-axis-bar">
                <Visualization
                    projectId={projectId}
                    identifier={dualAxisBarVisualizationIdentifier}
                    config={config}
                />
            </div>
        );
    }
}

export default VisualizationDualAxisBarChartExample;

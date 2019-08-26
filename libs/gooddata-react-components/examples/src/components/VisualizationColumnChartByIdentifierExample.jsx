// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import "@gooddata/react-components/styles/css/main.css";
import { Visualization } from "@gooddata/react-components";

import { projectId, columnVisualizationIdentifier } from "../utils/fixtures";

export class VisualizationColumnChartByIdentifierExample extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-visualization-chart">
                <Visualization projectId={projectId} identifier={columnVisualizationIdentifier} />
            </div>
        );
    }
}

export default VisualizationColumnChartByIdentifierExample;

// (C) 2007-2018 GoodData Corporation
import React, { Component } from "react";
import "@gooddata/react-components/styles/css/main.css";
import { Visualization } from "@gooddata/react-components";

import { projectId, heatmapVisualizationUri } from "../utils/fixtures";

export class VisualizationTable extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-visualization-heatmap">
                <Visualization projectId={projectId} uri={heatmapVisualizationUri} />
            </div>
        );
    }
}

export default VisualizationTable;

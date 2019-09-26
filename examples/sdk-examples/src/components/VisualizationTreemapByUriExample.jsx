// (C) 2007-2018 GoodData Corporation
import React, { Component } from "react";
import "@gooddata/sdk-ui/styles/css/main.css";
import { Visualization } from "@gooddata/sdk-ui";

import { projectId, treemapVisualizationUri } from "../utils/fixtures";

export class VisualizationTable extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-visualization-treemap">
                <Visualization projectId={projectId} uri={treemapVisualizationUri} />
            </div>
        );
    }
}

export default VisualizationTable;

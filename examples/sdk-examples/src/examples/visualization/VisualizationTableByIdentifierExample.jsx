// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import "@gooddata/sdk-ui/styles/css/main.css";
import { Visualization } from "@gooddata/sdk-ui";

import { projectId, tableVisualizationIdentifier } from "../../constants/fixtures";

export class VisualizationTable extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-visualization-table">
                <Visualization
                    projectId={projectId}
                    identifier={tableVisualizationIdentifier}
                    config={{
                        menu: {
                            aggregations: true,
                        },
                    }}
                />
            </div>
        );
    }
}

export default VisualizationTable;

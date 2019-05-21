// (C) 2007-2018 GoodData Corporation
import React, { Component } from "react";
import "@gooddata/react-components/styles/css/main.css";
import { Visualization } from "@gooddata/react-components";
import ExampleWithExport from "./utils/ExampleWithExport";

import { projectId, columnVisualizationIdentifier } from "../utils/fixtures";

export class VisualizationColumnChartExportExample extends Component {
    render() {
        return (
            <ExampleWithExport>
                {onExportReady => (
                    <div style={{ height: 300 }} className="s-visualization-chart">
                        <Visualization
                            projectId={projectId}
                            identifier={columnVisualizationIdentifier}
                            onExportReady={onExportReady}
                        />
                    </div>
                )}
            </ExampleWithExport>
        );
    }
}

export default VisualizationColumnChartExportExample;

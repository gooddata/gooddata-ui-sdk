// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import "@gooddata/react-components/styles/css/main.css";
import { Model, Visualization } from "@gooddata/react-components";
import ExampleWithExport from "./utils/ExampleWithExport";

import { columnVisualizationIdentifier, dateDataSetUri, projectId } from "../utils/fixtures";

export class VisualizationColumnChartExportExample extends Component {
    render() {
        const filters = [Model.absoluteDateFilter(dateDataSetUri, "2017-01-01", "2017-12-31")];

        return (
            <ExampleWithExport>
                {onExportReady => (
                    <div style={{ height: 300 }} className="s-visualization-chart">
                        <Visualization
                            projectId={projectId}
                            identifier={columnVisualizationIdentifier}
                            filters={filters}
                            onExportReady={onExportReady}
                        />
                    </div>
                )}
            </ExampleWithExport>
        );
    }
}

export default VisualizationColumnChartExportExample;

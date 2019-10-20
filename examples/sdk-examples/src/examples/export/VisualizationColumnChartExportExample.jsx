// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import "@gooddata/sdk-ui/styles/css/main.css";
import { Visualization } from "@gooddata/sdk-ui";
import { newAbsoluteDateFilter } from "@gooddata/sdk-model";
import ExampleWithExport from "../../components/ExampleWithExport";

import { columnVisualizationIdentifier, dateDataSetUri, projectId } from "../../constants/fixtures";

export class VisualizationColumnChartExportExample extends Component {
    render() {
        const filters = [newAbsoluteDateFilter(dateDataSetUri, "2017-01-01", "2017-12-31")];

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

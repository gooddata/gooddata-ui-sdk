// (C) 2007-2019 GoodData Corporation
import React from "react";

import { InsightView } from "@gooddata/sdk-ui-ext";
import { newAbsoluteDateFilter } from "@gooddata/sdk-model";
import { ExampleWithExport } from "./ExampleWithExport";

import { pieVisualizationIdentifier, dateDatasetIdentifier, projectId } from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const filters = [newAbsoluteDateFilter(dateDatasetIdentifier, "2017-01-01", "2017-12-31")];

const style = { height: 300 };
// const visualizationProps = {
//     custom: {
//         drillableItems: [],
//     },
//     dimensions: {
//         height: 300,
//     },
// };

export const VisualizationColumnChartExportExample = () => {
    const backend = useBackend();
    return (
        <ExampleWithExport>
            {onExportReady => (
                <div style={style} className="s-visualization-chart">
                    <InsightView
                        backend={backend}
                        workspace={projectId}
                        insight={pieVisualizationIdentifier}
                        filters={filters}
                        onExportReady={onExportReady}
                        drillableItems={[]}
                    />
                </div>
            )}
        </ExampleWithExport>
    );
};

export default VisualizationColumnChartExportExample;

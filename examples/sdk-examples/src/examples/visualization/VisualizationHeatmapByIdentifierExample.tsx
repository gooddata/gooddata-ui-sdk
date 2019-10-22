// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui";

import { projectId, heatmapVisualizationIdentifier } from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const style = { height: 300 };
const visualizationProps = {
    custom: {
        drillableItems: [],
    },
    dimensions: {
        height: 300,
    },
};

export const VisualizationHeatmapByIdentifierExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-visualization-heatmap">
            <InsightView
                backend={backend}
                workspace={projectId}
                id={heatmapVisualizationIdentifier}
                visualizationProps={visualizationProps}
            />
        </div>
    );
};

// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui";
import "@gooddata/sdk-ui/styles/css/main.css";

import { projectId, treemapVisualizationIdentifier } from "../../constants/fixtures";
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

export const VisualizationTreemapByIdentifierExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-visualization-treemap">
            <InsightView
                backend={backend}
                workspace={projectId}
                id={treemapVisualizationIdentifier}
                visualizationProps={visualizationProps}
            />
        </div>
    );
};

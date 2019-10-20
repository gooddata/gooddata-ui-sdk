// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui";
import "@gooddata/sdk-ui/styles/css/main.css";

import { projectId, lineVisualizationIdentifier } from "../../constants/fixtures";
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

export const VisualizationLineByIdentifierExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-visualization-line">
            <InsightView
                backend={backend}
                workspace={projectId}
                id={lineVisualizationIdentifier}
                visualizationProps={visualizationProps}
            />
        </div>
    );
};

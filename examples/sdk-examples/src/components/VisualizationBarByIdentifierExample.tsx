// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui";
import "@gooddata/sdk-ui/styles/css/main.css";

import { projectId, barVisualizationIdentifier } from "../utils/fixtures";
import { useBackend } from "../context/auth";

const style = { height: 300 };
const visualizationProps = {
    custom: {
        drillableItems: [],
    },
    dimensions: {
        height: 300,
    },
};

export const VisualizationBarByIdentifierExample: React.FC = () => {
    const backend = useBackend();
    return (
        <div style={style} className="s-visualization-bar">
            <InsightView
                backend={backend}
                workspace={projectId}
                id={barVisualizationIdentifier}
                visualizationProps={visualizationProps}
            />
        </div>
    );
};

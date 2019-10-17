// (C) 2007-2018 GoodData Corporation
import React, { Component } from "react";
import "@gooddata/sdk-ui/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui";

import { projectId, donutVisualizationIdentifier } from "../utils/fixtures";
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

export const VisualizationDonutByIdentifierExample: React.FC = () => {
    const backend = useBackend();
    return (
        <div style={style} className="s-visualization-chart">
            <InsightView
                backend={backend}
                workspace={projectId}
                id={donutVisualizationIdentifier}
                visualizationProps={visualizationProps}
            />
        </div>
    );
};

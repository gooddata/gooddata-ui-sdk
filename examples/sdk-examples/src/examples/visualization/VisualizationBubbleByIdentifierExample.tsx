// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui";

import { projectId, bubbleVisualizationIdentifier } from "../../constants/fixtures";
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

export const VisualizationBubbleByIdentifierExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-visualization-bubble">
            <InsightView
                backend={backend}
                workspace={projectId}
                id={bubbleVisualizationIdentifier}
                visualizationProps={visualizationProps}
            />
        </div>
    );
};

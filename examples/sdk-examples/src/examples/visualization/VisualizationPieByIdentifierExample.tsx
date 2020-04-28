// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { projectId, pieVisualizationIdentifier } from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const style = { height: 300 };
// const visualizationProps = {
//     custom: {
//         drillableItems: [],
//     },
//     dimensions: {
//         height: 300,
//     },
// };

export const VisualizationPieByIdentifierExample: React.FC = () => {
    const backend = useBackend();
    return (
        <div style={style} className="s-visualization-pie">
            <InsightView
                backend={backend}
                workspace={projectId}
                insight={pieVisualizationIdentifier}
                drillableItems={[]}
            />
        </div>
    );
};

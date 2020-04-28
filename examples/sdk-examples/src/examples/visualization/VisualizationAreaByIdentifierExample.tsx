// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { projectId, areaVisualizationIdentifier } from "../../constants/fixtures";
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

export const VisualizationAreaByIdentifierExample: React.FC = () => {
    const backend = useBackend();
    return (
        <div style={style} className="s-visualization-area">
            <InsightView
                backend={backend}
                workspace={projectId}
                insight={areaVisualizationIdentifier}
                drillableItems={[]}
            />
        </div>
    );
};

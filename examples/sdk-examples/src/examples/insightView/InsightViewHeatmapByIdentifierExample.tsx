// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { Ldm } from "../../md";

const style = { height: 300 };

export const InsightViewHeatmapByIdentifierExample: React.FC = () => {
    return (
        <div style={style} className="s-insightView-heatmap">
            <InsightView insight={Ldm.Insights.HeatmapChart} />
        </div>
    );
};

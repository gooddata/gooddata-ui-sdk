// (C) 2007-2021 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import * as Md from "../../md/full";

const style = { height: 300 };

export const InsightViewHeatmapByIdentifierExample: React.FC = () => {
    return (
        <div style={style} className="s-insightView-heatmap">
            <InsightView insight={Md.Insights.HeatmapChart} />
        </div>
    );
};

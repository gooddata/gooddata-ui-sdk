// (C) 2007-2018 GoodData Corporation
import React from "react";

import { InsightView } from "@gooddata/sdk-ui-ext";

import { Md } from "../../md";

const style = { height: 300 };

export const InsightViewScatterByIdentifierExample: React.FC = () => {
    return (
        <div style={style} className="s-insightView-scatter">
            <InsightView insight={Md.Insights.ScatterChart} />
        </div>
    );
};

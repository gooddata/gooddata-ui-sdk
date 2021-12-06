// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { Md } from "../../md";

const style = { height: 300 };

export const InsightViewWithCustomTitle: React.FC = () => {
    return (
        <div style={style} className="s-insightView-area">
            <InsightView showTitle="Custom Insight Title" insight={Md.Insights.AreaChart} />
        </div>
    );
};

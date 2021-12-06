// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { Md } from "../../md";

const style = { height: 300 };

export const InsightViewWithTitle: React.FC = () => {
    return (
        <div style={style} className="s-insightView-area">
            <InsightView showTitle insight={Md.Insights.AreaChart} />
        </div>
    );
};

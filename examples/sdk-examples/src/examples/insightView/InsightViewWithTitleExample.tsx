// (C) 2007-2021 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import * as Md from "../../md/full";

const style = { height: 300 };

export const InsightViewWithTitle: React.FC = () => {
    return (
        <div style={style} className="s-insightView-area">
            <InsightView showTitle insight={Md.Insights.AreaChart} />
        </div>
    );
};

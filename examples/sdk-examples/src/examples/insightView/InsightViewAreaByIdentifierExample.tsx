// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { Ldm } from "../../md";

const style = { height: 300 };

export const InsightViewAreaByIdentifierExample: React.FC = () => {
    return (
        <div style={style} className="s-insightView-area">
            <InsightView insight={Ldm.Insights.AreaChart} />
        </div>
    );
};

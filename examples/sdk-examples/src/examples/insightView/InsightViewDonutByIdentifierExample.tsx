// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { Md } from "../../md";

const style = { height: 300 };

export const InsightViewDonutByIdentifierExample: React.FC = () => {
    return (
        <div style={style} className="s-insightView-donut">
            <InsightView insight={Md.Insights.DonutChart} />
        </div>
    );
};

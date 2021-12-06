// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { Md } from "../../md";

const style = { height: 300 };

export const InsightViewBarByIdentifierExample: React.FC = () => {
    return (
        <div style={style} className="s-insightView-bar">
            <InsightView insight={Md.Insights.BarChart} />
        </div>
    );
};

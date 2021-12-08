// (C) 2007-2021 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { Md } from "../../md";

const style = { height: 300 };

export const InsightViewColumnChartByIdentifierExample: React.FC = () => {
    return (
        <div style={style} className="s-insightView-chart">
            <InsightView insight={Md.Insights.SalesOverTime} />
        </div>
    );
};

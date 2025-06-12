// (C) 2024 GoodData Corporation
import React from "react";
import { PieChart } from "@gooddata/sdk-ui-charts";
import { idRef } from "@gooddata/sdk-model";
import { InsightView } from "@gooddata/sdk-ui-ext";
import {
    AmountBOP,
    Account,
    Insights,
} from "../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
const insightsRef = idRef(Insights.ManyData);
const style = { height: 300 };

export const ChartTooManyDataScenario: React.FC = () => {
    return (
        <div style={style} className="s-pie-chart">
            <PieChart measures={[AmountBOP]} viewBy={Account.Default} />
        </div>
    );
};

export const TooManyDataInsightViewScenario: React.FC = () => {
    return (
        <div style={style} className="s-column-chart">
            <InsightView insight={insightsRef} />
        </div>
    );
};

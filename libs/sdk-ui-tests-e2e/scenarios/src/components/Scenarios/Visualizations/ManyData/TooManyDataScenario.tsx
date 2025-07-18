// (C) 2024-2025 GoodData Corporation
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

export function ChartTooManyDataScenario() {
    return (
        <div style={style} className="s-pie-chart">
            <PieChart measures={[AmountBOP]} viewBy={Account.Default} />
        </div>
    );
}

export function TooManyDataInsightViewScenario() {
    return (
        <div style={style} className="s-column-chart">
            <InsightView insight={insightsRef} />
        </div>
    );
}

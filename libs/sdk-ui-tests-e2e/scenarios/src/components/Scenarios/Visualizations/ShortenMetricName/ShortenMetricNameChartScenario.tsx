// (C) 2023-2025 GoodData Corporation
import { InsightView } from "@gooddata/sdk-ui-ext";
import { idRef } from "@gooddata/sdk-model";
import { Insights } from "../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
const insightsRef = idRef(Insights.InsightUsingLongNameMetric);
const style = { height: 300 };

export function ShortenMetricNameChartScenario() {
    return (
        <div style={style} className="s-column-chart">
            <InsightView insight={insightsRef} />
        </div>
    );
}

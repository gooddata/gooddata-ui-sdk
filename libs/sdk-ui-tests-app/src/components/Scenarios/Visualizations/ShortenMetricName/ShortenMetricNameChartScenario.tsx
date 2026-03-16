// (C) 2023-2026 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { InsightView } from "@gooddata/sdk-ui-ext";
import { Insights } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";
const insightsRef = idRef(Insights.InsightUsingLongNameMetric);
const style = { height: 300 };

export function ShortenMetricNameChartScenario() {
    return (
        <div style={style} className="s-column-chart">
            <InsightView insight={insightsRef} />
        </div>
    );
}

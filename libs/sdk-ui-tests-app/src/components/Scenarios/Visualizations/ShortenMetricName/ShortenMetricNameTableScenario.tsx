// (C) 2023-2026 GoodData Corporation

import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { idRef } from "@gooddata/sdk-model";
import { InsightView } from "@gooddata/sdk-ui-ext";
import { Insights } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";
const insightsRef = idRef(Insights.TableUsingLongNameMetric);
const style = { height: 300 };

export function ShortenMetricNameTableScenario() {
    return (
        <div style={style} className="s-pivot-table">
            <InsightView insight={insightsRef} />
        </div>
    );
}

// (C) 2023-2025 GoodData Corporation
import React from "react";

import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { idRef } from "@gooddata/sdk-model";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { Insights } from "../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
const insightsRef = idRef(Insights.TableUsingLongNameMetric);
const style = { height: 300 };

export const ShortenMetricNameTableScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <InsightView insight={insightsRef} />
        </div>
    );
};

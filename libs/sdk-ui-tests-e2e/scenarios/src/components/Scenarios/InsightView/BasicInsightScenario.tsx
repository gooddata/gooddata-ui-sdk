// (C) 2021-2023 GoodData Corporation
import React from "react";
import { idRef } from "@gooddata/sdk-model";
import { Insights } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { InsightView } from "@gooddata/sdk-ui-ext";

const insightRef = idRef(Insights.BarChartWithDateAttribute);
const style = { height: 300 };

export const BasicInsightScenario: React.FC = () => {
    return (
        <div style={style}>
            <InsightView insight={insightRef} />;
        </div>
    );
};

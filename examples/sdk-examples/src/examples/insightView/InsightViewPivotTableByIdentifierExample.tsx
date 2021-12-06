// (C) 2007-2020 GoodData Corporation
import React from "react";

import { InsightView } from "@gooddata/sdk-ui-ext";

import { Ldm } from "../../md";

const style = { height: 500 };
export const InsightViewPivotTableByIdentifierExample: React.FC = () => {
    return (
        <div style={style} className="s-insightView-pivot">
            <InsightView insight={Ldm.Insights.TableReportLaborCostsVsScheduledCosts} />
        </div>
    );
};

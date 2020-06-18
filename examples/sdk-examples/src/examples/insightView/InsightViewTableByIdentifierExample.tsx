// (C) 2007-2020 GoodData Corporation
import React from "react";

import { InsightView } from "@gooddata/sdk-ui-ext";

import { Ldm } from "../../ldm";

const style = { height: 500 };
export const InsightViewTableByIdentifierExample: React.FC = () => {
    return (
        <div style={style} className="s-insightView-scatter">
            <InsightView insight={Ldm.Insights.TableReportLaborCostsVsScheduledCosts} />
        </div>
    );
};

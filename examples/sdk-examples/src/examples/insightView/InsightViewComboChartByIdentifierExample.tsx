// (C) 2007-2019 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { comboInsightViewIdentifier } from "../../constants/fixtures";

export const InsightViewComboChartByIdentifierExample: React.FC = () => {
    return (
        <div className="s-insightView-chart">
            <InsightView insight={comboInsightViewIdentifier} />
        </div>
    );
};

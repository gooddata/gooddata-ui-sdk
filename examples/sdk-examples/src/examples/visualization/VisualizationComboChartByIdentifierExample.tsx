// (C) 2007-2019 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui";

import { comboVisualizationIdentifier } from "../../constants/fixtures";

export const VisualizationComboChartByIdentifierExample: React.FC = () => {
    return (
        <div className="s-visualization-chart">
            <InsightView id={comboVisualizationIdentifier} />
        </div>
    );
};

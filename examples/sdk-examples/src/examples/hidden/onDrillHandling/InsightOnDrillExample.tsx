// (C) 2007-2019 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { columnInsightViewIdentifier, totalSalesIdentifier } from "../../../constants/fixtures";
import { useOnDrillExample } from "./useOnDrillExample";

const drillableItems = [
    {
        identifier: totalSalesIdentifier,
    },
];

const style = { height: 300 };

export const InsightOnDrillExample: React.FC = () => {
    const { onDrill, renderDrillEvent } = useOnDrillExample();

    return (
        <div className="s-insightView-on-drill">
            <div style={style} className="s-insightView-chart">
                <InsightView
                    insight={columnInsightViewIdentifier}
                    onDrill={onDrill}
                    drillableItems={drillableItems}
                />
            </div>
            {renderDrillEvent}
        </div>
    );
};

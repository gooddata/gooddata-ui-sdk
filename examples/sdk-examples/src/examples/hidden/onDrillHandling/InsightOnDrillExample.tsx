// (C) 2007-2019 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui";

import { columnVisualizationIdentifier, totalSalesIdentifier } from "../../../constants/fixtures";
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
        <div className="s-visualization-on-drill">
            <div style={style} className="s-visualization-chart">
                <InsightView
                    id={columnVisualizationIdentifier}
                    onDrill={onDrill}
                    visualizationProps={{
                        custom: {
                            drillableItems,
                        },
                    }}
                />
            </div>
            {renderDrillEvent}
        </div>
    );
};

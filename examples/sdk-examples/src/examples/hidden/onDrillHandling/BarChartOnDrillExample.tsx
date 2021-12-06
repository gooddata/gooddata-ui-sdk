// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { measureIdentifier } from "@gooddata/sdk-model";
import { IDrillableItemIdentifier } from "@gooddata/sdk-ui";
import { LdmExt } from "../../../md";
import { useOnDrillExample } from "./useOnDrillExample";

const measures = [LdmExt.TotalSales2];

const drillableItems: IDrillableItemIdentifier = { identifier: measureIdentifier(LdmExt.TotalSales2)! };

const style = { height: 300 };

export const BarChartOnDrillExample: React.FC = () => {
    const { onDrill, renderDrillEvent } = useOnDrillExample();

    return (
        <div className="s-bar-chart-on-drill">
            <div style={style} className="s-bar-chart">
                <BarChart
                    measures={measures}
                    viewBy={LdmExt.LocationResort}
                    onDrill={onDrill}
                    drillableItems={[drillableItems]}
                />
            </div>
            {renderDrillEvent}
        </div>
    );
};

export default BarChartOnDrillExample;

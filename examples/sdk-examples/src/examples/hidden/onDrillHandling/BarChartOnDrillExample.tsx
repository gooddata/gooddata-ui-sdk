// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { measureIdentifier } from "@gooddata/sdk-model";
import { IDrillableItemIdentifier } from "@gooddata/sdk-ui";
import { MdExt } from "../../../md";
import { useOnDrillExample } from "./useOnDrillExample";

const measures = [MdExt.TotalSales2];

const drillableItems: IDrillableItemIdentifier = { identifier: measureIdentifier(MdExt.TotalSales2)! };

const style = { height: 300 };

export const BarChartOnDrillExample: React.FC = () => {
    const { onDrill, renderDrillEvent } = useOnDrillExample();

    return (
        <div className="s-bar-chart-on-drill">
            <div style={style} className="s-bar-chart">
                <BarChart
                    measures={measures}
                    viewBy={MdExt.LocationResort}
                    onDrill={onDrill}
                    drillableItems={[drillableItems]}
                />
            </div>
            {renderDrillEvent}
        </div>
    );
};

export default BarChartOnDrillExample;

// (C) 2007-2022 GoodData Corporation
import React from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { measureIdentifier, modifyMeasure } from "@gooddata/sdk-model";
import { IDrillableItemIdentifier } from "@gooddata/sdk-ui";
import * as Md from "../../../md/full";
import { useOnDrillExample } from "./useOnDrillExample";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);

const measures = [TotalSales];

const drillableItems: IDrillableItemIdentifier = { identifier: measureIdentifier(TotalSales)! };

const style = { height: 300 };

export const BarChartOnDrillExample: React.FC = () => {
    const { onDrill, renderDrillEvent } = useOnDrillExample();

    return (
        <div className="s-bar-chart-on-drill">
            <div style={style} className="s-bar-chart">
                <BarChart
                    measures={measures}
                    viewBy={Md.LocationResort}
                    onDrill={onDrill}
                    drillableItems={[drillableItems]}
                />
            </div>
            {renderDrillEvent}
        </div>
    );
};

export default BarChartOnDrillExample;

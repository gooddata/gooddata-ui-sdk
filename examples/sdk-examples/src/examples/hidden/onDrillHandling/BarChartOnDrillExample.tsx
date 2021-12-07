// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { measureIdentifier, modifyAttribute, modifyMeasure } from "@gooddata/sdk-model";
import { IDrillableItemIdentifier } from "@gooddata/sdk-ui";
import { Md } from "../../../md";
import { useOnDrillExample } from "./useOnDrillExample";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales").localId("totalSales"),
);
const LocationResort = modifyAttribute(Md.LocationResort, (a) => a.localId("locationName"));

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
                    viewBy={LocationResort}
                    onDrill={onDrill}
                    drillableItems={[drillableItems]}
                />
            </div>
            {renderDrillEvent}
        </div>
    );
};

export default BarChartOnDrillExample;

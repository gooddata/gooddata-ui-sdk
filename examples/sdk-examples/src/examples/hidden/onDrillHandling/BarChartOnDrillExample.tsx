// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";

import { totalSalesIdentifier, locationResortIdentifier } from "../../../constants/fixtures";

import { useOnDrillExample } from "./useOnDrillExample";

const measures = [
    newMeasure(totalSalesIdentifier, m =>
        m
            .format("#,##0")
            .alias("$ Total Sales")
            .localId("m1"),
    ),
];

const locationResort = newAttribute(locationResortIdentifier, a => a.localId("a1"));

const drillableItems = [
    {
        identifier: totalSalesIdentifier,
    },
];

const style = { height: 300 };

export const BarChartOnDrillExample: React.FC = () => {
    const { onDrill, renderDrillEvent } = useOnDrillExample();

    return (
        <div className="s-bar-chart-on-drill">
            <div style={style} className="s-bar-chart">
                <BarChart
                    measures={measures}
                    viewBy={locationResort}
                    onDrill={onDrill}
                    drillableItems={drillableItems}
                />
            </div>
            {renderDrillEvent}
        </div>
    );
};

export default BarChartOnDrillExample;

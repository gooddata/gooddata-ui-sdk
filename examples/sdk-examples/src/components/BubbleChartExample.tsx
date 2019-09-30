// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BubbleChart, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    franchiseFeesIdentifier,
    franchisedSalesIdentifier,
    averageCheckSizeByServer,
    locationResortIdentifier,
} from "../utils/fixtures";
import { useBackend } from "../backend";

const xMeasure = Model.measure(franchiseFeesIdentifier)
    .format("#,##0")
    .localIdentifier("franchiseFees");

const yMeasure = Model.measure(franchisedSalesIdentifier)
    .format("#,##0")
    .localIdentifier("franchisedSales");

const size = Model.measure(averageCheckSizeByServer).localIdentifier("averageCheckSizeByServer");

const locationResort = Model.attribute(locationResortIdentifier).localIdentifier("locationResort");

const style = { height: 300 };

export const BubbleChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-bubble-chart">
            <BubbleChart
                backend={backend}
                workspace={projectId}
                xAxisMeasure={xMeasure}
                yAxisMeasure={yMeasure}
                viewBy={locationResort}
                size={size}
            />
        </div>
    );
};

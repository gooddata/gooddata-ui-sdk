// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ScatterPlot, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    franchiseFeesIdentifier,
    franchisedSalesIdentifier,
    locationResortIdentifier,
} from "../utils/fixtures";
import { useBackend } from "../backend";

const xMeasure = Model.measure(franchiseFeesIdentifier)
    .format("#,##0")
    .localIdentifier("franchiseFees");

const yMeasure = Model.measure(franchisedSalesIdentifier)
    .format("#,##0")
    .localIdentifier("franchisedSales");

const locationResort = Model.attribute(locationResortIdentifier).localIdentifier("locationResort");

const style = { height: 300 };

export const ScatterPlotExample: React.FC = () => {
    const backend = useBackend();
    return (
        <div style={style} className="s-scatter-plot">
            <ScatterPlot
                backend={backend}
                workspace={projectId}
                xAxisMeasure={xMeasure}
                yAxisMeasure={yMeasure}
                attribute={locationResort}
            />
        </div>
    );
};

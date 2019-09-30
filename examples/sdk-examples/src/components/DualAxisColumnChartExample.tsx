// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ColumnChart, Model } from "@gooddata/sdk-ui";
import "@gooddata/sdk-ui/styles/css/main.css";

import {
    totalSalesIdentifier,
    totalCostsIdentifier,
    locationStateDisplayFormIdentifier,
    projectId,
} from "../utils/fixtures";
import { useBackend } from "../backend";

const totalCostsLocalIdentifier = "totalCosts";
const totalSalesLocalIdentifier = "totalSales";
const locationStateLocalIdentifier = "locationState";

const totalCosts = Model.measure(totalCostsIdentifier)
    .format("#,##0")
    .alias("$ Total Costs")
    .localIdentifier(totalCostsLocalIdentifier);

const totalSales = Model.measure(totalSalesIdentifier)
    .format("#,##0")
    .alias("$ Total Sales")
    .localIdentifier(totalSalesLocalIdentifier);

const localState = Model.attribute(locationStateDisplayFormIdentifier).localIdentifier(
    locationStateLocalIdentifier,
);

const config = {
    secondary_yaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto",
        min: "-75000000",
        max: "75000000",
        measures: [totalCostsLocalIdentifier],
    },
    yaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto",
        min: "-75000000",
        max: "75000000",
        measures: [totalSalesLocalIdentifier],
    },
};

export const DualAxisColumnChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={{ height: 300 }} className="s-dual-axis-column-chart">
            <ColumnChart
                backend={backend}
                workspace={projectId}
                measures={[totalCosts, totalSales]}
                viewBy={localState}
                config={config}
            />
        </div>
    );
};

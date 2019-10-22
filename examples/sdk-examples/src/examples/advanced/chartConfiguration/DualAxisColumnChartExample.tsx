// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";

import {
    totalSalesIdentifier,
    totalCostsIdentifier,
    locationStateDisplayFormIdentifier,
    projectId,
} from "../../../constants/fixtures";
import { useBackend } from "../../../context/auth";

const totalCostsLocalIdentifier = "totalCosts";
const totalSalesLocalIdentifier = "totalSales";
const locationStateLocalIdentifier = "locationState";

const totalCosts = newMeasure(totalCostsIdentifier, m =>
    m
        .format("#,##0")
        .alias("$ Total Costs")
        .localId(totalCostsLocalIdentifier),
);

const totalSales = newMeasure(totalSalesIdentifier, m =>
    m
        .format("#,##0")
        .alias("$ Total Sales")
        .localId(totalSalesLocalIdentifier),
);

const localState = newAttribute(locationStateDisplayFormIdentifier, a =>
    a.localId(locationStateLocalIdentifier),
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

// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BarChart, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import { totalSalesIdentifier, locationResortIdentifier, projectId } from "../utils/fixtures";
import { useBackend } from "../backend";

const amount = Model.measure(totalSalesIdentifier)
    .format("#,##0")
    .alias("$ Total Sales")
    .localIdentifier("totalSales");

const locationResort = Model.attribute(locationResortIdentifier).localIdentifier("locationResort");

const style = { height: 300 };

export const BarChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-bar-chart">
            <BarChart backend={backend} workspace={projectId} measures={[amount]} viewBy={locationResort} />
        </div>
    );
};

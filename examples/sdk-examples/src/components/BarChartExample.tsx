// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BarChart } from "@gooddata/sdk-ui";
import { newAttribute, newMeasure } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import { totalSalesIdentifier, locationResortIdentifier, projectId } from "../utils/fixtures";
import { useBackend } from "../context/auth";

const amount = newMeasure(totalSalesIdentifier, m => m.format("#,##0").alias("$ Total Sales"));

const locationResort = newAttribute(locationResortIdentifier);

const style = { height: 300 };

export const BarChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-bar-chart">
            <BarChart backend={backend} workspace={projectId} measures={[amount]} viewBy={locationResort} />
        </div>
    );
};

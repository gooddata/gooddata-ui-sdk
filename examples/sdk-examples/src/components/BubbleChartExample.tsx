// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BubbleChart } from "@gooddata/sdk-ui";
import { newAttribute, newMeasure } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    franchiseFeesIdentifier,
    franchisedSalesIdentifier,
    averageCheckSizeByServer,
    locationResortIdentifier,
} from "../utils/fixtures";
import { useBackend } from "../context/auth";

const xMeasure = newMeasure(franchiseFeesIdentifier, m => m.format("#,##0"));

const yMeasure = newMeasure(franchisedSalesIdentifier, m => m.format("#,##0"));

const size = newMeasure(averageCheckSizeByServer);

const locationResort = newAttribute(locationResortIdentifier);

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

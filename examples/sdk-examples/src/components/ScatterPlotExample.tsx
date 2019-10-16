// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ScatterPlot } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    franchiseFeesIdentifier,
    franchisedSalesIdentifier,
    locationResortIdentifier,
} from "../utils/fixtures";
import { useBackend } from "../context/auth";

const xMeasure = newMeasure(franchiseFeesIdentifier, m => m.format("#,##0"));

const yMeasure = newMeasure(franchisedSalesIdentifier, m => m.format("#,##0"));

const locationResort = newAttribute(locationResortIdentifier);

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

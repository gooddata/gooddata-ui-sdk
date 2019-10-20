// (C) 2007-2019 GoodData Corporation
import React from "react";
import { AreaChart } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const measures = [
    newMeasure(franchiseFeesIdentifier, m => m.format("#,##0")),
    newMeasure(franchiseFeesAdRoyaltyIdentifier, m => m.format("#,##0")),
    newMeasure(franchiseFeesInitialFranchiseFeeIdentifier, m => m.format("#,##0")),
    newMeasure(franchiseFeesIdentifierOngoingRoyalty, m => m.format("#,##0")),
];

const viewBy = newAttribute(monthDateIdentifier);

const chartConfig = {
    stacking: true,
};

const style = { height: 300 };

export const StackedAreaChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-area-chart">
            <AreaChart
                backend={backend}
                workspace={projectId}
                measures={measures}
                viewBy={viewBy}
                config={chartConfig}
            />
        </div>
    );
};

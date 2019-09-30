// (C) 2007-2019 GoodData Corporation
import React from "react";
import { LineChart, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../utils/fixtures";

import { CUSTOM_COLOR_PALETTE } from "../utils/colors";
import { useBackend } from "../backend";

const measures = [
    Model.measure(franchiseFeesIdentifier)
        .format("#,##0")
        .localIdentifier("franchiseFees"),
    Model.measure(franchiseFeesAdRoyaltyIdentifier)
        .format("#,##0")
        .localIdentifier("franchiseFeesAdRoyalty"),
    Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
        .format("#,##0")
        .localIdentifier("franchiseFeesInitialFranchiseFee"),
    Model.measure(franchiseFeesIdentifierOngoingRoyalty)
        .format("#,##0")
        .localIdentifier("franchiseFeesOngoingRoyalty"),
];

const trendBy = Model.attribute(monthDateIdentifier).localIdentifier("a1");

const chartConfig = { colorPalette: CUSTOM_COLOR_PALETTE };

const style = { height: 300 };

export const LineChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-line-chart">
            <LineChart
                backend={backend}
                workspace={projectId}
                measures={measures}
                trendBy={trendBy}
                config={chartConfig}
            />
        </div>
    );
};

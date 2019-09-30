// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PieChart, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../utils/fixtures";
import { useBackend } from "../backend";

const measures = [
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

const style = { height: 300 };

export const PieChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-pie-chart">
            <PieChart backend={backend} workspace={projectId} measures={measures} />
        </div>
    );
};

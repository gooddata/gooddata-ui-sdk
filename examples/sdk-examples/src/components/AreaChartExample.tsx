// (C) 2007-2019 GoodData Corporation
import React from "react";
import { AreaChart, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../utils/fixtures";
import { useBackend } from "../backend";

const localIdentifiers = {
    franchiseFees: "franchiseFees",
    franchiseFeesAdRoyalty: "franchiseFeesAdRoyalty",
    franchiseFeesInitialFranchiseFee: "franchiseFeesInitialFranchiseFee",
    franchiseFeesIdentifierOngoingRoyalty: "franchiseFeesIdentifierOngoingRoyalty",
    monthDate: "monthDate",
};
const measures = [
    Model.measure(franchiseFeesIdentifier)
        .format("#,##0")
        .localIdentifier(localIdentifiers.franchiseFees),
    Model.measure(franchiseFeesAdRoyaltyIdentifier)
        .format("#,##0")
        .localIdentifier(localIdentifiers.franchiseFeesAdRoyalty),
    Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
        .format("#,##0")
        .localIdentifier(localIdentifiers.franchiseFeesInitialFranchiseFee),
    Model.measure(franchiseFeesIdentifierOngoingRoyalty)
        .format("#,##0")
        .localIdentifier(localIdentifiers.franchiseFeesIdentifierOngoingRoyalty),
];

const viewBy = Model.attribute(monthDateIdentifier).localIdentifier(localIdentifiers.monthDate);

const style = { height: 300 };

const chartConfig = {
    stacking: false,
};

export const AreaChartExample: React.FC = () => {
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

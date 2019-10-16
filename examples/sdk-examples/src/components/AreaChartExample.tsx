// (C) 2007-2019 GoodData Corporation
import React from "react";
import { AreaChart } from "@gooddata/sdk-ui";
import { newAttribute, newMeasure } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../utils/fixtures";
import { useBackend } from "../context/auth";

const localIdentifiers = {
    franchiseFees: "franchiseFees",
    franchiseFeesAdRoyalty: "franchiseFeesAdRoyalty",
    franchiseFeesInitialFranchiseFee: "franchiseFeesInitialFranchiseFee",
    franchiseFeesIdentifierOngoingRoyalty: "franchiseFeesIdentifierOngoingRoyalty",
    monthDate: "monthDate",
};
const measures = [
    newMeasure(franchiseFeesIdentifier, m => m.format("#,##0").localId(localIdentifiers.franchiseFees)),
    newMeasure(franchiseFeesAdRoyaltyIdentifier, m =>
        m.format("#,##0").localId(localIdentifiers.franchiseFeesAdRoyalty),
    ),
    newMeasure(franchiseFeesInitialFranchiseFeeIdentifier, m =>
        m.format("#,##0").localId(localIdentifiers.franchiseFeesInitialFranchiseFee),
    ),
    newMeasure(franchiseFeesIdentifierOngoingRoyalty, m =>
        m.format("#,##0").localId(localIdentifiers.franchiseFeesIdentifierOngoingRoyalty),
    ),
];

const viewBy = newAttribute(monthDateIdentifier, a => a.localId(localIdentifiers.monthDate));

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

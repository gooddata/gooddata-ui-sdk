// (C) 2007-2019 GoodData Corporation

import React from "react";
import { PivotTable } from "@gooddata/sdk-ui";
import { newAttribute, newMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
    locationStateDisplayFormIdentifier,
} from "../utils/fixtures";
import { useBackend } from "../context/auth";

const localIdentifiers = {
    franchiseFeesAdRoyalty: "franchiseFeesAdRoyalty",
    franchiseFeesOngoingRoyalty: "franchiseFeesOngoingRoyalty",
    franchiseFeesSum: "franchiseFeesSum",
    franchiseFeesDifference: "franchiseFeesDifference",
};

const measures = [
    newMeasure(franchiseFeesAdRoyaltyIdentifier, m =>
        m.format("#,##0").localId(localIdentifiers.franchiseFeesAdRoyalty),
    ),
    newMeasure(franchiseFeesIdentifierOngoingRoyalty, m =>
        m.format("#,##0").localId(localIdentifiers.franchiseFeesOngoingRoyalty),
    ),
    newArithmeticMeasure(
        [localIdentifiers.franchiseFeesOngoingRoyalty, localIdentifiers.franchiseFeesAdRoyalty],
        "sum",
        m =>
            m
                .format("#,##0")
                .title("$ Ongoing / Ad Royalty Sum")
                .localId(localIdentifiers.franchiseFeesSum),
    ),
    newArithmeticMeasure(
        [localIdentifiers.franchiseFeesOngoingRoyalty, localIdentifiers.franchiseFeesAdRoyalty],
        "difference",
        m =>
            m
                .format("#,##0")
                .title("$ Ongoing / Ad Royalty Difference")
                .localId(localIdentifiers.franchiseFeesDifference),
    ),
];

const rows = [newAttribute(locationStateDisplayFormIdentifier)];

const style = { height: 200 };

export const ArithmeticMeasureSumExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-table">
            <PivotTable backend={backend} workspace={projectId} measures={measures} rows={rows} />
        </div>
    );
};

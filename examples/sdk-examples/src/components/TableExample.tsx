// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute, ITotal } from "@gooddata/sdk-model";

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

const measures = [
    newMeasure(franchiseFeesIdentifier, m => m.format("#,##0").localId("franchiseFeesIdentifier")),
    newMeasure(franchiseFeesAdRoyaltyIdentifier, m =>
        m.format("#,##0").localId("franchiseFeesAdRoyaltyIdentifier"),
    ),
    newMeasure(franchiseFeesInitialFranchiseFeeIdentifier, m =>
        m.format("#,##0").localId("franchiseFeesInitialFranchiseFeeIdentifier"),
    ),
    newMeasure(franchiseFeesIdentifierOngoingRoyalty, m =>
        m.format("#,##0").localId("franchiseFeesIdentifierOngoingRoyalty"),
    ),
];

const totals: ITotal[] = [
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "avg",
        attributeIdentifier: "month",
    },
    {
        measureIdentifier: "franchiseFeesAdRoyaltyIdentifier",
        type: "avg",
        attributeIdentifier: "month",
    },
    {
        measureIdentifier: "franchiseFeesInitialFranchiseFeeIdentifier",
        type: "avg",
        attributeIdentifier: "month",
    },
    {
        measureIdentifier: "franchiseFeesIdentifierOngoingRoyalty",
        type: "avg",
        attributeIdentifier: "month",
    },
];

const attributes = [newAttribute(monthDateIdentifier, a => a.localId("month"))];

const style = { height: 300 };

export const TableExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-table">
            <PivotTable
                backend={backend}
                workspace={projectId}
                measures={measures}
                rows={attributes}
                totals={totals}
            />
        </div>
    );
};

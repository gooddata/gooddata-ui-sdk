// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newMeasure, newAttribute, ITotal } from "@gooddata/sdk-model";

import {
    projectId,
    quarterDateIdentifier,
    monthDateIdentifier,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
    menuCategoryAttributeDFIdentifier,
} from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

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

const attributes = [
    newAttribute(locationStateDisplayFormIdentifier, a => a.localId("state")),
    newAttribute(locationNameDisplayFormIdentifier),
    newAttribute(menuCategoryAttributeDFIdentifier),
];

const columns = [newAttribute(quarterDateIdentifier), newAttribute(monthDateIdentifier)];
const totals: ITotal[] = [
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "sum",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "avg",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "franchiseFeesAdRoyaltyIdentifier",
        type: "sum",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "max",
        attributeIdentifier: "state",
    },
];
const style = { height: 300 };
const config = {
    menu: {
        aggregations: true,
    },
};

export const PivotTableTotalsExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-pivot-table-totals">
            <PivotTable
                backend={backend}
                config={config}
                workspace={projectId}
                measures={measures}
                rows={attributes}
                columns={columns}
                pageSize={20}
                totals={totals}
            />
        </div>
    );
};

// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute, ITotal } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

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
const attributes = [
    newAttribute(locationStateDisplayFormIdentifier),
    newAttribute(locationNameDisplayFormIdentifier, a => a.localId("locationName")),
    newAttribute(menuCategoryAttributeDFIdentifier, a => a.localId("menu")),
];
const totals: ITotal[] = [
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "sum",
        attributeIdentifier: "locationName",
    },
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "avg",
        attributeIdentifier: "locationName",
    },
    {
        measureIdentifier: "franchiseFeesAdRoyaltyIdentifier",
        type: "sum",
        attributeIdentifier: "menu",
    },
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "max",
        attributeIdentifier: "menu",
    },
];
const columns = [newAttribute(quarterDateIdentifier), newAttribute(monthDateIdentifier)];
const config = {
    menu: {
        aggregations: true,
        aggregationsSubMenu: true,
    },
};
const style = { height: 500 };

export const PivotTableSubtotalsExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-pivot-table-row-grouping">
            <PivotTable
                backend={backend}
                workspace={projectId}
                measures={measures}
                config={config}
                rows={attributes}
                columns={columns}
                totals={totals}
                pageSize={20}
                groupRows={true}
            />
        </div>
    );
};

export default PivotTableSubtotalsExample;

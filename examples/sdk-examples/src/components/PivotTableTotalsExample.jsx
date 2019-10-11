// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { PivotTable } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";

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

export class PivotTableTotalsExample extends Component {
    render() {
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

        const totals = [
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

        return (
            <div style={{ height: 300 }} className="s-pivot-table-totals">
                <PivotTable
                    config={{
                        menu: {
                            aggregations: true,
                        },
                    }}
                    projectId={projectId}
                    measures={measures}
                    rows={attributes}
                    columns={columns}
                    pageSize={20}
                    totals={totals}
                />
            </div>
        );
    }
}

export default PivotTableTotalsExample;

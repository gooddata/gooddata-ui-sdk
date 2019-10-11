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

export class PivotTableSubtotalsExample extends Component {
    render() {
        const measures = [
            newMeasure(franchiseFeesIdentifier, m => m.format("#,##0"), "franchiseFeesIdentifier"),
            newMeasure(
                franchiseFeesAdRoyaltyIdentifier,
                m => m.format("#,##0"),
                "franchiseFeesAdRoyaltyIdentifier",
            ),
            newMeasure(
                franchiseFeesInitialFranchiseFeeIdentifier,
                m => m.format("#,##0"),
                "franchiseFeesInitialFranchiseFeeIdentifier",
            ),
            newMeasure(
                franchiseFeesIdentifierOngoingRoyalty,
                m => m.format("#,##0"),
                "franchiseFeesIdentifierOngoingRoyalty",
            ),
        ];

        const attributes = [
            newAttribute(locationStateDisplayFormIdentifier),
            newAttribute(locationNameDisplayFormIdentifier, undefined, "locationName"),
            newAttribute(menuCategoryAttributeDFIdentifier, undefined, "menu"),
        ];

        const totals = [
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

        return (
            <div style={{ height: 500 }} className="s-pivot-table-row-grouping">
                <PivotTable
                    projectId={projectId}
                    measures={measures}
                    config={{
                        menu: {
                            aggregations: true,
                            aggregationsSubMenu: true,
                        },
                    }}
                    rows={attributes}
                    columns={columns}
                    totals={totals}
                    pageSize={20}
                    groupRows
                />
            </div>
        );
    }
}

export default PivotTableSubtotalsExample;

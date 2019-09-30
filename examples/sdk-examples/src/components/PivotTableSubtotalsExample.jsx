// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { PivotTable, Model } from "@gooddata/sdk-ui";

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
            Model.measure(franchiseFeesIdentifier)
                .format("#,##0")
                .localIdentifier("franchiseFeesIdentifier"),
            Model.measure(franchiseFeesAdRoyaltyIdentifier)
                .format("#,##0")
                .localIdentifier("franchiseFeesAdRoyaltyIdentifier"),
            Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
                .format("#,##0")
                .localIdentifier("franchiseFeesInitialFranchiseFeeIdentifier"),
            Model.measure(franchiseFeesIdentifierOngoingRoyalty)
                .format("#,##0")
                .localIdentifier("franchiseFeesIdentifierOngoingRoyalty"),
        ];

        const attributes = [
            Model.attribute(locationStateDisplayFormIdentifier).localIdentifier("locationState"),
            Model.attribute(locationNameDisplayFormIdentifier).localIdentifier("locationName"),
            Model.attribute(menuCategoryAttributeDFIdentifier).localIdentifier("menu"),
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

        const columns = [
            Model.attribute(quarterDateIdentifier).localIdentifier("quarter"),
            Model.attribute(monthDateIdentifier).localIdentifier("month"),
        ];

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

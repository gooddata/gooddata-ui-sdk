// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { PivotTable, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

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
            Model.attribute(locationStateDisplayFormIdentifier).localIdentifier("state"),
            Model.attribute(locationNameDisplayFormIdentifier),
            Model.attribute(menuCategoryAttributeDFIdentifier),
        ];

        const columns = [Model.attribute(quarterDateIdentifier), Model.attribute(monthDateIdentifier)];

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

// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { PivotTable, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import {
    projectId,
    locationStateDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
} from "../utils/fixtures";

export class PivotTableXssExample extends Component {
    render() {
        const measures = [
            Model.measure(franchiseFeesIdentifier)
                .localIdentifier("franchiseFeesIdentifier")
                .format("#,##0 <img />"),
            Model.measure(franchiseFeesAdRoyaltyIdentifier).format("#,##0"),
        ];

        const attributes = [Model.attribute(locationStateDisplayFormIdentifier).localIdentifier("state")];

        const totals = [
            {
                measureIdentifier: "franchiseFeesIdentifier",
                type: "sum",
                attributeIdentifier: "state",
            },
        ];

        return (
            <div style={{ height: 300 }} className="s-pivot-table-xss">
                <PivotTable
                    projectId={projectId}
                    measures={measures}
                    rows={attributes}
                    pageSize={20}
                    totals={totals}
                />
            </div>
        );
    }
}

export default PivotTableXssExample;

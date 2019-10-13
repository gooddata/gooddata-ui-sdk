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

export class PivotTableRowGroupingExample extends Component {
    render() {
        const measures = [
            newMeasure(franchiseFeesIdentifier, m => m.format("#,##0")),
            newMeasure(franchiseFeesAdRoyaltyIdentifier, m => m.format("#,##0")),
            newMeasure(franchiseFeesInitialFranchiseFeeIdentifier, m => m.format("#,##0")),
            newMeasure(franchiseFeesIdentifierOngoingRoyalty, m => m.format("#,##0")),
        ];

        const attributes = [
            newAttribute(locationStateDisplayFormIdentifier),
            newAttribute(locationNameDisplayFormIdentifier),
            newAttribute(menuCategoryAttributeDFIdentifier),
        ];

        const columns = [newAttribute(quarterDateIdentifier), newAttribute(monthDateIdentifier)];

        return (
            <div style={{ height: 500 }} className="s-pivot-table-row-grouping">
                <PivotTable
                    projectId={projectId}
                    measures={measures}
                    rows={attributes}
                    columns={columns}
                    pageSize={20}
                    groupRows
                />
            </div>
        );
    }
}

export default PivotTableRowGroupingExample;

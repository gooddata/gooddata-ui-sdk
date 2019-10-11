// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { Table } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../utils/fixtures";

export class TableExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("ColumnChartExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("ColumnChartExample onError", ...params);
    }

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

        const totals = [
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

        const attributes = [newAttribute(monthDateIdentifier, undefined, "month")];

        return (
            <div style={{ height: 300 }} className="s-table">
                <Table
                    projectId={projectId}
                    measures={measures}
                    attributes={attributes}
                    totals={totals}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default TableExample;

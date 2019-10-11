// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { Table } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute, newAbsoluteDateFilter } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import ExampleWithExport from "./utils/ExampleWithExport";

import {
    dateDataSetUri,
    projectId,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../utils/fixtures";

export class TableExportExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("TableExportExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("TableExportExample onError", ...params);
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

        const filters = [newAbsoluteDateFilter(dateDataSetUri, "2017-01-01", "2017-12-31")];

        return (
            <ExampleWithExport>
                {onExportReady => (
                    <div style={{ height: 300 }} className="s-table">
                        <Table
                            projectId={projectId}
                            measures={measures}
                            attributes={attributes}
                            filters={filters}
                            totals={totals}
                            onExportReady={onExportReady}
                            onLoadingChanged={this.onLoadingChanged}
                            onError={this.onError}
                        />
                    </div>
                )}
            </ExampleWithExport>
        );
    }
}

export default TableExportExample;

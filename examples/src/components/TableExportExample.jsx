// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { Table, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

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

        const attributes = [Model.attribute(monthDateIdentifier).localIdentifier("month")];

        const filters = [Model.absoluteDateFilter(dateDataSetUri, "2017-01-01", "2017-12-31")];

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

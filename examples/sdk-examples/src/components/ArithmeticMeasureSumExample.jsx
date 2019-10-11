// (C) 2007-2019 GoodData Corporation

import React, { Component } from "react";
import { Table } from "@gooddata/sdk-ui";
import { newAttribute, newMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
    locationStateDisplayFormIdentifier,
} from "../utils/fixtures";

export class ArithmeticMeasureSumExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("ArithmeticMeasureSumExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("ArithmeticMeasureSumExample onError", ...params);
    }

    render() {
        const localIdentifiers = {
            franchiseFeesAdRoyalty: "franchiseFeesAdRoyalty",
            franchiseFeesOngoingRoyalty: "franchiseFeesOngoingRoyalty",
            franchiseFeesSum: "franchiseFeesSum",
            franchiseFeesDifference: "franchiseFeesDifference",
        };

        const measures = [
            newMeasure(franchiseFeesAdRoyaltyIdentifier, m =>
                m.format("#,##0").localId(localIdentifiers.franchiseFeesAdRoyalty),
            ),
            newMeasure(franchiseFeesIdentifierOngoingRoyalty, m =>
                m.format("#,##0").localId(localIdentifiers.franchiseFeesOngoingRoyalty),
            ),
            newArithmeticMeasure(
                [localIdentifiers.franchiseFeesOngoingRoyalty, localIdentifiers.franchiseFeesAdRoyalty],
                "sum",
                m =>
                    m
                        .format("#,##0")
                        .title("$ Ongoing / Ad Royalty Sum")
                        .localId(localIdentifiers.franchiseFeesSum),
            ),
            newArithmeticMeasure(
                [localIdentifiers.franchiseFeesOngoingRoyalty, localIdentifiers.franchiseFeesAdRoyalty],
                "sum",
                m =>
                    m
                        .format("#,##0")
                        .title("$ Ongoing / Ad Royalty Sum")
                        .localId(localIdentifiers.franchiseFeesSum),
            ),
            newArithmeticMeasure(
                [localIdentifiers.franchiseFeesOngoingRoyalty, localIdentifiers.franchiseFeesAdRoyalty],
                "difference",
                m =>
                    m
                        .format("#,##0")
                        .title("$ Ongoing / Ad Royalty Difference")
                        .localId(localIdentifiers.franchiseFeesDifference),
            ),
        ];

        const attributes = [newAttribute(locationStateDisplayFormIdentifier)];

        return (
            <div style={{ height: 200 }} className="s-table">
                <Table
                    projectId={projectId}
                    measures={measures}
                    attributes={attributes}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default ArithmeticMeasureSumExample;

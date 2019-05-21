// (C) 2007-2019 GoodData Corporation

import React, { Component } from "react";
import { Table, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

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
            Model.measure(franchiseFeesAdRoyaltyIdentifier)
                .localIdentifier(localIdentifiers.franchiseFeesAdRoyalty)
                .format("#,##0"),
            Model.measure(franchiseFeesIdentifierOngoingRoyalty)
                .localIdentifier(localIdentifiers.franchiseFeesOngoingRoyalty)
                .format("#,##0"),
            Model.arithmeticMeasure(
                [localIdentifiers.franchiseFeesOngoingRoyalty, localIdentifiers.franchiseFeesAdRoyalty],
                "sum",
            )
                .localIdentifier(localIdentifiers.franchiseFeesSum)
                .format("#,##0")
                .title("$ Ongoing / Ad Royalty Sum"),
            Model.arithmeticMeasure(
                [localIdentifiers.franchiseFeesOngoingRoyalty, localIdentifiers.franchiseFeesAdRoyalty],
                "difference",
            )
                .localIdentifier(localIdentifiers.franchiseFeesDifference)
                .format("#,##0")
                .title("$ Ongoing / Ad Royalty Difference"),
        ];

        const attributes = [Model.attribute(locationStateDisplayFormIdentifier).localIdentifier("month")];

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

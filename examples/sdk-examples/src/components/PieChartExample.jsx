// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { PieChart, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../utils/fixtures";

export class PieChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("PieChartExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("PieChartExample onError", ...params);
    }

    render() {
        const measures = [
            Model.measure(franchiseFeesAdRoyaltyIdentifier)
                .format("#,##0")
                .localIdentifier("franchiseFeesAdRoyalty"),
            Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
                .format("#,##0")
                .localIdentifier("franchiseFeesInitialFranchiseFee"),
            Model.measure(franchiseFeesIdentifierOngoingRoyalty)
                .format("#,##0")
                .localIdentifier("franchiseFeesOngoingRoyalty"),
        ];

        return (
            <div style={{ height: 300 }} className="s-pie-chart">
                <PieChart
                    projectId={projectId}
                    measures={measures}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default PieChartExample;

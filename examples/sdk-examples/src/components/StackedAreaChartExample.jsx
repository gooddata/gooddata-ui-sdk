// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { AreaChart, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import {
    projectId,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../utils/fixtures";

export class StackedAreaChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("StackedAreaChartExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("StackedAreaChartExample onError", ...params);
    }

    render() {
        const measures = [
            Model.measure(franchiseFeesIdentifier)
                .format("#,##0")
                .localIdentifier("franchiseFees"),
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

        const viewBy = Model.attribute(monthDateIdentifier).localIdentifier("month");

        return (
            <div style={{ height: 300 }} className="s-area-chart">
                <AreaChart
                    projectId={projectId}
                    measures={measures}
                    viewBy={viewBy}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                    config={{
                        stacking: true,
                    }}
                />
            </div>
        );
    }
}

export default StackedAreaChartExample;

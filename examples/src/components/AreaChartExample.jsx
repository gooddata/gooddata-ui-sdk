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

export class AreaChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("AreaChartExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("AreaChartExample onError", ...params);
    }

    render() {
        const localIdentifiers = {
            franchiseFees: "franchiseFees",
            franchiseFeesAdRoyalty: "franchiseFeesAdRoyalty",
            franchiseFeesInitialFranchiseFee: "franchiseFeesInitialFranchiseFee",
            franchiseFeesIdentifierOngoingRoyalty: "franchiseFeesIdentifierOngoingRoyalty",
            monthDate: "monthDate",
        };
        const measures = [
            Model.measure(franchiseFeesIdentifier)
                .format("#,##0")
                .localIdentifier(localIdentifiers.franchiseFees),
            Model.measure(franchiseFeesAdRoyaltyIdentifier)
                .format("#,##0")
                .localIdentifier(localIdentifiers.franchiseFeesAdRoyalty),
            Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
                .format("#,##0")
                .localIdentifier(localIdentifiers.franchiseFeesInitialFranchiseFee),
            Model.measure(franchiseFeesIdentifierOngoingRoyalty)
                .format("#,##0")
                .localIdentifier(localIdentifiers.franchiseFeesIdentifierOngoingRoyalty),
        ];

        const viewBy = Model.attribute(monthDateIdentifier).localIdentifier(localIdentifiers.monthDate);

        return (
            <div style={{ height: 300 }} className="s-area-chart">
                <AreaChart
                    projectId={projectId}
                    measures={measures}
                    viewBy={viewBy}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                    config={{
                        stacking: false,
                    }}
                />
            </div>
        );
    }
}

export default AreaChartExample;

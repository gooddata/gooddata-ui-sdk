// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { PieChart } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../utils/fixtures";

export class PieChartColorMappingExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("PieChartColorMappingExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("PieChartColorMappingExample onError", ...params);
    }

    render() {
        const measures = [
            {
                measure: {
                    localIdentifier: "franchiseFeesAdRoyaltyIdentifier",
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: franchiseFeesAdRoyaltyIdentifier,
                            },
                        },
                    },
                    format: "#,##0",
                },
            },
            {
                measure: {
                    localIdentifier: "franchiseFeesInitialFranchiseFeeIdentifier",
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: franchiseFeesInitialFranchiseFeeIdentifier,
                            },
                        },
                    },
                    format: "#,##0",
                },
            },
            {
                measure: {
                    localIdentifier: "franchiseFeesIdentifierOngoingRoyalty",
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: franchiseFeesIdentifierOngoingRoyalty,
                            },
                        },
                    },
                    format: "#,##0",
                },
            },
        ];

        return (
            <div style={{ height: 300 }} className="s-pie-chart">
                <PieChart
                    projectId={projectId}
                    measures={measures}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                    config={{
                        colorMapping: [
                            {
                                predicate: headerItem => {
                                    return headerItem.measureHeaderItem
                                        ? headerItem.measureHeaderItem &&
                                              headerItem.measureHeaderItem.localIdentifier ===
                                                  "franchiseFeesAdRoyaltyIdentifier"
                                        : false;
                                },
                                color: {
                                    type: "guid",
                                    value: "5",
                                },
                            },
                            {
                                predicate: headerItem => {
                                    return headerItem.measureHeaderItem
                                        ? headerItem.measureHeaderItem &&
                                              headerItem.measureHeaderItem.localIdentifier ===
                                                  "franchiseFeesIdentifierOngoingRoyalty"
                                        : false;
                                },
                                color: {
                                    type: "rgb",
                                    value: {
                                        r: 0,
                                        g: 0,
                                        b: 0,
                                    },
                                },
                            },
                        ],
                    }}
                />
            </div>
        );
    }
}

export default PieChartColorMappingExample;

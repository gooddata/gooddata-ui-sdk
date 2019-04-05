// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { AfmComponents } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../utils/fixtures";

export class CustomChartExample extends Component {
    constructor(props) {
        super(props);

        this.onLegendReady = this.onLegendReady.bind(this);

        this.state = {
            legendItems: [],
        };
    }

    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("CustomLegendExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("CustomLegendExample onError", ...params);
    }

    onLegendReady(data) {
        this.setState({
            legendItems: data.legendItems,
        });
    }

    renderTriangle(color) {
        const style = {
            width: 0,
            height: 0,
            borderTop: "10px solid transparent",
            borderLeft: `20px solid ${color}`,
            borderBottom: "10px solid transparent",
            marginRight: "5px",
        };
        return <div style={style} />;
    }

    renderCustomLegend() {
        const { legendItems } = this.state;

        if (!legendItems.length) {
            return null;
        }

        return (
            <div className="s-custom-legend">
                {legendItems.map((item, idx) => {
                    return (
                        <div
                            key={idx} // eslint-disable-line react/no-array-index-key
                            onClick={item.onClick}
                            style={{ display: "flex", margin: "10px 0", cursor: "pointer" }}
                        >
                            {this.renderTriangle(item.color)}
                            {item.name}
                        </div>
                    );
                })}
            </div>
        );
    }

    render() {
        const afm = {
            measures: [
                {
                    localIdentifier: "franchiseFeesAdRoyaltyIdentifier",
                    definition: {
                        measure: {
                            item: {
                                identifier: franchiseFeesAdRoyaltyIdentifier,
                            },
                        },
                    },
                    format: "#,##0",
                },
                {
                    localIdentifier: "franchiseFeesInitialFranchiseFeeIdentifier",
                    definition: {
                        measure: {
                            item: {
                                identifier: franchiseFeesInitialFranchiseFeeIdentifier,
                            },
                        },
                    },
                    format: "#,##0",
                },
                {
                    localIdentifier: "franchiseFeesIdentifierOngoingRoyalty",
                    definition: {
                        measure: {
                            item: {
                                identifier: franchiseFeesIdentifierOngoingRoyalty,
                            },
                        },
                    },
                    format: "#,##0",
                },
            ],
        };

        return (
            <div>
                {this.renderCustomLegend()}
                <div style={{ height: 300 }} className="s-pie-chart">
                    <AfmComponents.PieChart
                        projectId={projectId}
                        afm={afm}
                        onLoadingChanged={this.onLoadingChanged}
                        config={{
                            legend: {
                                enabled: false,
                            },
                        }}
                        onError={this.onError}
                        onLegendReady={this.onLegendReady}
                    />
                </div>
            </div>
        );
    }
}

export default CustomChartExample;

// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { Headline } from "@gooddata/sdk-ui";
import { newMeasure } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import { projectId, franchiseFeesIdentifier, franchiseFeesAdRoyaltyIdentifier } from "../utils/fixtures";

export class HeadlineExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("ColumnChartExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("ColumnChartExample onError", ...params);
    }

    render() {
        const primaryMeasure = newMeasure(franchiseFeesIdentifier, m => m.format("#,##0"));

        const secondaryMeasure = newMeasure(franchiseFeesAdRoyaltyIdentifier, m => m.format("#,##0"));

        return (
            <div className="s-headline" style={{ display: "flex" }}>
                <style jsx>
                    {`
                        .column {
                            flex: "1 1 50%";
                        }
                    `}
                </style>
                <div className="column">
                    <Headline
                        projectId={projectId}
                        primaryMeasure={primaryMeasure}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                    />
                </div>
                <div className="column">
                    <Headline
                        projectId={projectId}
                        primaryMeasure={primaryMeasure}
                        secondaryMeasure={secondaryMeasure}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                    />
                </div>
            </div>
        );
    }
}

export default HeadlineExample;

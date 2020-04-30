// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { Headline } from "@gooddata/sdk-ui";
import { newMeasure } from "@gooddata/sdk-model";

import {
    workspace,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
} from "../../constants/fixtures";

export class HeadlineExample extends Component {
    onLoadingChanged(...params) {
        return console.log("ColumnChartExample onLoadingChanged", ...params);
    }

    onError(...params) {
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
                        workspace={workspace}
                        primaryMeasure={primaryMeasure}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                    />
                </div>
                <div className="column">
                    <Headline
                        workspace={workspace}
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

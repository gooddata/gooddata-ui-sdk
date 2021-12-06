// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { OnLoadingChanged, OnError } from "@gooddata/sdk-ui";
import { Headline } from "@gooddata/sdk-ui-charts";
import { MdExt } from "../../md";

export class HeadlineExample extends Component {
    public onLoadingChanged: OnLoadingChanged = (...params) => {
        // eslint-disable-next-line no-console
        return console.log("ColumnChartExample onLoadingChanged", ...params);
    };

    public onError: OnError = (...params) => {
        // eslint-disable-next-line no-console
        return console.log("ColumnChartExample onError", ...params);
    };

    public render(): React.ReactNode {
        const primaryMeasure = MdExt.FranchiseFees;

        const secondaryMeasure = MdExt.FranchiseFeesAdRoyalty;

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
                        primaryMeasure={primaryMeasure}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                    />
                </div>
                <div className="column">
                    <Headline
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

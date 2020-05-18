// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { Headline } from "@gooddata/sdk-ui-charts";
import { LdmExt } from "../../ldm";

export class HeadlineExample extends Component {
    public onLoadingChanged(...params: any) {
        // tslint:disable-next-line:no-console
        return console.log("ColumnChartExample onLoadingChanged", ...params);
    }

    public onError(...params: any) {
        // tslint:disable-next-line:no-console
        return console.log("ColumnChartExample onError", ...params);
    }

    public render() {
        const primaryMeasure = LdmExt.FranchiseFees;

        const secondaryMeasure = LdmExt.FranchiseFeesAdRoyalty;

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

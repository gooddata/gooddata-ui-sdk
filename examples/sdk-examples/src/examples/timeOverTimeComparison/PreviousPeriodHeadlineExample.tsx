// (C) 2007-2020 GoodData Corporation

import React, { Component } from "react";
import { Headline } from "@gooddata/sdk-ui-charts";
import { newPreviousPeriodMeasure, newRelativeDateFilter } from "@gooddata/sdk-model";
import { Md, MdExt } from "../../md";
import { OnLoadingChanged, OnError } from "@gooddata/sdk-ui";

export class PreviousPeriodHeadlineExample extends Component {
    public onLoadingChanged: OnLoadingChanged = (...params) => {
        // eslint-disable-next-line no-console
        return console.log("PreviousPeriodHeadlineExample onLoadingChanged", ...params);
    };

    public onError: OnError = (...params): void => {
        // eslint-disable-next-line no-console
        return console.log("PreviousPeriodHeadlineExample onError", ...params);
    };

    public render(): React.ReactNode {
        const primaryMeasure = MdExt.TotalSales2;
        const secondaryMeasure = newPreviousPeriodMeasure(
            MdExt.TotalSales2,
            [{ dataSet: Md.DateDatasets.Date.identifier, periodsAgo: 1 }],
            (m) => m.alias("$ Total Sales - period ago"),
        );

        return (
            <div style={{ height: 125 }} className="s-headline">
                <Headline
                    primaryMeasure={primaryMeasure}
                    secondaryMeasure={secondaryMeasure}
                    filters={[newRelativeDateFilter(Md.DateDatasets.Date.ref, "GDC.time.year", -4, -3)]}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default PreviousPeriodHeadlineExample;

// (C) 2007-2020 GoodData Corporation

import React, { Component } from "react";
import { Headline } from "@gooddata/sdk-ui";
import { newPreviousPeriodMeasure, newRelativeDateFilter } from "@gooddata/sdk-model";

import { workspace } from "../../constants/fixtures";
import { LdmExt } from "../../ldm";

export class PreviousPeriodHeadlineExample extends Component {
    onLoadingChanged(...params) {
        return console.log("PreviousPeriodHeadlineExample onLoadingChanged", ...params);
    }

    onError(...params) {
        return console.log("PreviousPeriodHeadlineExample onError", ...params);
    }

    render() {
        const primaryMeasure = LdmExt.TotalSales2;
        const secondaryMeasure = newPreviousPeriodMeasure(
            "totalSales",
            [{ dataSet: LdmExt.dateDataSetUri, periodsAgo: 1 }],
            m => m.alias("$ Total Sales - period ago"),
        );
        return (
            <div style={{ height: 125 }} className="s-headline">
                <Headline
                    workspace={workspace}
                    primaryMeasure={primaryMeasure}
                    secondaryMeasure={secondaryMeasure}
                    filters={[newRelativeDateFilter(LdmExt.dateDataSetUri, "GDC.time.year", -2, -1)]}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default PreviousPeriodHeadlineExample;

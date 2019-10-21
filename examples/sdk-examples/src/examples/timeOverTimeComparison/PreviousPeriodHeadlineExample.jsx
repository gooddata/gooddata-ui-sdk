// (C) 2007-2019 GoodData Corporation

import React, { Component } from "react";
import { Headline } from "@gooddata/sdk-ui";
import { newMeasure, newPreviousPeriodMeasure, newRelativeDateFilter } from "@gooddata/sdk-model";

import { totalSalesIdentifier, dateDataSetUri, projectId } from "../../constants/fixtures";

export class PreviousPeriodHeadlineExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("PreviousPeriodHeadlineExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("PreviousPeriodHeadlineExample onError", ...params);
    }

    render() {
        const primaryMeasure = newMeasure(totalSalesIdentifier, m =>
            m.alias("$ Total Sales").localId("totalSales"),
        );
        const secondaryMeasure = newPreviousPeriodMeasure(
            "totalSales",
            [{ dataSet: dateDataSetUri, periodsAgo: 1 }],
            m => m.alias("$ Total Sales - period ago"),
        );
        return (
            <div style={{ height: 125 }} className="s-headline">
                <Headline
                    projectId={projectId}
                    primaryMeasure={primaryMeasure}
                    secondaryMeasure={secondaryMeasure}
                    filters={[newRelativeDateFilter(dateDataSetUri, "GDC.time.year", -2, -1)]}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default PreviousPeriodHeadlineExample;

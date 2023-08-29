// (C) 2007-2022 GoodData Corporation

import React from "react";
import { Headline, IChartConfig } from "@gooddata/sdk-ui-charts";
import { modifyMeasure, newPreviousPeriodMeasure, newAbsoluteDateFilter } from "@gooddata/sdk-model";
import * as Md from "../../md/full";
import { OnLoadingChanged, OnError } from "@gooddata/sdk-ui";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);

const secondaryMeasure = newPreviousPeriodMeasure(
    TotalSales,
    [{ dataSet: Md.DateDatasets.Date.identifier, periodsAgo: 1 }],
    (m) => m.alias("$ Total Sales - period ago"),
);

const filters = [newAbsoluteDateFilter(Md.DateDatasets.Date, "2017-01-01", "2017-12-31")];

const config: IChartConfig = {
    comparison: {
        enabled: true,
        calculationType: "ratio",
    },
};

export const PreviousPeriodHeadlineExample: React.FC = () => {
    const onLoadingChanged: OnLoadingChanged = () => {
        // handle the callback here
    };

    const onError: OnError = () => {
        // handle the callback here
    };

    return (
        <div style={{ height: 125 }} className="s-headline">
            <Headline
                primaryMeasure={TotalSales}
                secondaryMeasures={[secondaryMeasure]}
                config={config}
                filters={filters}
                onLoadingChanged={onLoadingChanged}
                onError={onError}
            />
        </div>
    );
};

export default PreviousPeriodHeadlineExample;

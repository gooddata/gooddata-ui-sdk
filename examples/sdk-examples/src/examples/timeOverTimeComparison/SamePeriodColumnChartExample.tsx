// (C) 2007-2021 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { newPopMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const totalSalesYearAgo = newPopMeasure(Md.$TotalSales, Md.DateDatasets.Date.Year.ref, (m) =>
    m.alias("$ Total Sales - SP year ago"),
);

const style = { height: 300 };

export const SamePeriodColumnChartExample: React.FC = () => {
    return (
        <div style={style} className="s-column-chart">
            <ColumnChart measures={[Md.$TotalSales, totalSalesYearAgo]} viewBy={Md.DateQuarter} />
        </div>
    );
};

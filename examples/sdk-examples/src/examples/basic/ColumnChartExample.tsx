// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { modifyAttribute, modifyMeasure } from "@gooddata/sdk-model";
import { Md } from "../../md";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"));
const monthDate = modifyAttribute(Md.DateDatasets.Date.Month.Short, (a) =>
    a.alias("Month").localId("monthDate"),
);

const style = { height: 300 };

export const ColumnChartExample: React.FC = () => {
    return (
        <div style={style} className="s-column-chart">
            <ColumnChart measures={[TotalSales]} viewBy={monthDate} />
        </div>
    );
};

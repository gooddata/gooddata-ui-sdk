// (C) 2007-2021 GoodData Corporation
import React from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import * as Md from "../../md/full";
import { modifyMeasure } from "@gooddata/sdk-model";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"));
const style = { height: 300 };

export const BarChartExample: React.FC = () => {
    return (
        <div style={style} className="s-bar-chart">
            <BarChart measures={[TotalSales]} viewBy={Md.LocationResort} />
        </div>
    );
};

// (C) 2007-2022 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { modifyMeasure, newMeasureSort } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);

const style = { height: 300 };

export const MeasureSortingExample: React.FC = () => {
    return (
        <div style={style} className="s-measure-sorting">
            <ColumnChart
                measures={[TotalSales]}
                viewBy={Md.DateMonth.Short}
                sortBy={[newMeasureSort(TotalSales, "desc")]}
            />
        </div>
    );
};

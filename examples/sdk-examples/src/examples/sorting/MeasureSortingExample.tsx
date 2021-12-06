// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { newMeasureSort } from "@gooddata/sdk-model";
import { Md, MdExt } from "../../md";

const style = { height: 300 };

export const MeasureSortingExample: React.FC = () => {
    return (
        <div style={style} className="s-measure-sorting">
            <ColumnChart
                measures={[MdExt.TotalSales2]}
                viewBy={Md.DateMonth.Short}
                sortBy={[newMeasureSort(MdExt.TotalSales2, "desc")]}
            />
        </div>
    );
};

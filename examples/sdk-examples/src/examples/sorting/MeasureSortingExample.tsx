// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { newMeasureSort } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../md";

const style = { height: 300 };

export const MeasureSortingExample: React.FC = () => {
    return (
        <div style={style} className="s-measure-sorting">
            <ColumnChart
                measures={[LdmExt.TotalSales2]}
                viewBy={Ldm.DateMonth.Short}
                sortBy={[newMeasureSort(LdmExt.TotalSales2, "desc")]}
            />
        </div>
    );
};

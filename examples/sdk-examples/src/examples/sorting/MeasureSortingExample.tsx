// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { newMeasureSort } from "@gooddata/sdk-model";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const style = { height: 300 };

export const MeasureSortingExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-measure-sorting">
            <ColumnChart
                backend={backend}
                workspace={workspace}
                measures={[LdmExt.TotalSales2]}
                viewBy={Ldm.DateMonth.Short}
                sortBy={[newMeasureSort(LdmExt.TotalSales2, "desc")]}
            />
        </div>
    );
};

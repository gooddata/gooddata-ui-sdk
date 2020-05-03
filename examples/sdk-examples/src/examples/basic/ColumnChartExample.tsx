// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const style = { height: 300 };

export const ColumnChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-column-chart">
            <ColumnChart
                backend={backend}
                workspace={workspace}
                measures={[LdmExt.TotalSales1]}
                viewBy={Ldm.DateMonth.Short}
            />
        </div>
    );
};

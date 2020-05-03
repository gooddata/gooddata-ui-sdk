// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const style = { height: 300 };

export const BarChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-bar-chart">
            <BarChart
                backend={backend}
                workspace={workspace}
                measures={[LdmExt.TotalSales1]}
                viewBy={Ldm.LocationResort}
            />
        </div>
    );
};

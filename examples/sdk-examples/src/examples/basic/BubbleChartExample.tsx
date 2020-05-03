// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BubbleChart } from "@gooddata/sdk-ui-charts";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const xMeasure = LdmExt.FranchiseFees;

const yMeasure = LdmExt.FranchisedSales;

const style = { height: 300 };

export const BubbleChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-bubble-chart">
            <BubbleChart
                backend={backend}
                workspace={workspace}
                xAxisMeasure={xMeasure}
                yAxisMeasure={yMeasure}
                viewBy={Ldm.LocationResort}
                size={Ldm.AvgCheckSizeByServer}
            />
        </div>
    );
};

// (C) 2007-2019 GoodData Corporation
import React from "react";
import { AreaChart } from "@gooddata/sdk-ui-charts";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const measures = [
    LdmExt.FranchiseFees,
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesInitialFranchiseFee,
    LdmExt.FranchiseFeesOngoingRoyalty,
];

const chartConfig = {
    stacking: true,
};

const style = { height: 300 };

export const StackedAreaChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-area-chart">
            <AreaChart
                backend={backend}
                workspace={workspace}
                measures={measures}
                viewBy={Ldm.DateMonth.Short}
                config={chartConfig}
            />
        </div>
    );
};

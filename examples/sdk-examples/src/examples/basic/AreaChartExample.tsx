// (C) 2007-2019 GoodData Corporation
import React from "react";
import { AreaChart } from "@gooddata/sdk-ui-charts";
import { workspace } from "../../constants/fixtures";
import { LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";
const measures = [
    LdmExt.FranchiseFees,
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesInitialFranchiseFee,
    LdmExt.FranchiseFeesOngoingRoyalty,
];

const style = { height: 300 };

const chartConfig = {
    stacking: false,
};

export const AreaChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-area-chart">
            <AreaChart
                backend={backend}
                workspace={workspace}
                measures={measures}
                viewBy={LdmExt.monthDate}
                config={chartConfig}
            />
        </div>
    );
};

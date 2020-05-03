// (C) 2007-2019 GoodData Corporation
import React from "react";
import { LineChart } from "@gooddata/sdk-ui-charts";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";

import { CUSTOM_COLOR_PALETTE } from "../../constants/colors";
import { useBackend } from "../../context/auth";

const measures = [
    LdmExt.FranchiseFees,
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesInitialFranchiseFee,
    LdmExt.FranchiseFeesOngoingRoyalty,
];

const chartConfig = { colorPalette: CUSTOM_COLOR_PALETTE };

const style = { height: 300 };

export const LineChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-line-chart">
            <LineChart
                backend={backend}
                workspace={workspace}
                measures={measures}
                trendBy={Ldm.DateMonth.Short}
                config={chartConfig}
            />
        </div>
    );
};

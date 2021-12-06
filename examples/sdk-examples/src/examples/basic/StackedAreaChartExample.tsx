// (C) 2007-2019 GoodData Corporation
import React from "react";
import { AreaChart } from "@gooddata/sdk-ui-charts";
import { Ldm, LdmExt } from "../../md";

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
    return (
        <div style={style} className="s-stacked-area-chart">
            <AreaChart measures={measures} viewBy={Ldm.DateMonth.Short} config={chartConfig} />
        </div>
    );
};

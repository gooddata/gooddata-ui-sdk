// (C) 2007-2019 GoodData Corporation
import React from "react";
import { AreaChart } from "@gooddata/sdk-ui-charts";
import { Md, MdExt } from "../../md";

const measures = [
    MdExt.FranchiseFees,
    MdExt.FranchiseFeesAdRoyalty,
    MdExt.FranchiseFeesInitialFranchiseFee,
    MdExt.FranchiseFeesOngoingRoyalty,
];

const chartConfig = {
    stacking: true,
};

const style = { height: 300 };

export const StackedAreaChartExample: React.FC = () => {
    return (
        <div style={style} className="s-stacked-area-chart">
            <AreaChart measures={measures} viewBy={Md.DateMonth.Short} config={chartConfig} />
        </div>
    );
};

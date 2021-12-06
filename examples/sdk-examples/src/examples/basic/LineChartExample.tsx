// (C) 2007-2019 GoodData Corporation
import React from "react";
import { LineChart, IChartConfig } from "@gooddata/sdk-ui-charts";

import { Md, MdExt } from "../../md";

import { CUSTOM_COLOR_PALETTE } from "../../constants/colors";

const measures = [
    MdExt.FranchiseFees,
    MdExt.FranchiseFeesAdRoyalty,
    MdExt.FranchiseFeesInitialFranchiseFee,
    MdExt.FranchiseFeesOngoingRoyalty,
];

const chartConfig: IChartConfig = { colorPalette: CUSTOM_COLOR_PALETTE, legend: { position: "left" } };

const style = { height: 300 };

export const LineChartExample: React.FC = () => {
    return (
        <div style={style} className="s-line-chart">
            <LineChart measures={measures} trendBy={Md.DateMonth.Short} config={chartConfig} />
        </div>
    );
};

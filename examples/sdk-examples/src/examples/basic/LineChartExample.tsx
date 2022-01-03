// (C) 2007-2022 GoodData Corporation
import React from "react";
import { LineChart, IChartConfig } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";

import * as Md from "../../md/full";

import { CUSTOM_COLOR_PALETTE } from "../../constants/colors";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) => m.format("#,##0").title("Franchise Fees"));
const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) => m.format("#,##0"));
const FranchiseFeesInitialFranchiseFee = modifyMeasure(Md.$FranchiseFeesInitialFranchiseFee, (m) =>
    m.format("#,##0"),
);
const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) => m.format("#,##0"));

const measures = [
    FranchiseFees,
    FranchiseFeesAdRoyalty,
    FranchiseFeesInitialFranchiseFee,
    FranchiseFeesOngoingRoyalty,
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

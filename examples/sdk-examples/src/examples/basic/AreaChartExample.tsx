// (C) 2007-2022 GoodData Corporation
import React from "react";
import { AreaChart } from "@gooddata/sdk-ui-charts";
import * as Md from "../../md/full";
import { modifyAttribute, modifyMeasure } from "@gooddata/sdk-model";

const monthDate = modifyAttribute(Md.DateDatasets.Date.Month.Short, (a) => a.alias("Month"));

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

const style = { height: 300 };

const chartConfig = {
    stacking: false,
};

export const AreaChartExample: React.FC = () => {
    return (
        <div style={style} className="s-area-chart">
            <AreaChart measures={measures} viewBy={monthDate} config={chartConfig} />
        </div>
    );
};

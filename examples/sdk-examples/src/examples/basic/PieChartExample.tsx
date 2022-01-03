// (C) 2007-2022 GoodData Corporation
import React from "react";
import { PieChart } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) => m.format("#,##0"));
const FranchiseFeesInitialFranchiseFee = modifyMeasure(Md.$FranchiseFeesInitialFranchiseFee, (m) =>
    m.format("#,##0"),
);
const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) => m.format("#,##0"));

const measures = [FranchiseFeesAdRoyalty, FranchiseFeesInitialFranchiseFee, FranchiseFeesOngoingRoyalty];

const style = { height: 300 };

export const PieChartExample: React.FC = () => {
    return (
        <div style={style} className="s-pie-chart">
            <PieChart measures={measures} />
        </div>
    );
};

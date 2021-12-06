// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PieChart } from "@gooddata/sdk-ui-charts";
import { MdExt } from "../../md";

const measures = [
    MdExt.FranchiseFeesAdRoyalty,
    MdExt.FranchiseFeesInitialFranchiseFee,
    MdExt.FranchiseFeesOngoingRoyalty,
];

const style = { height: 300 };

export const PieChartExample: React.FC = () => {
    return (
        <div style={style} className="s-pie-chart">
            <PieChart measures={measures} />
        </div>
    );
};

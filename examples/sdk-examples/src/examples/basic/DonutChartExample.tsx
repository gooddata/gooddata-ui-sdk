// (C) 2007-2019 GoodData Corporation
import React from "react";
import { DonutChart } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";
import { Md } from "../../md";

const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesAdRoyalty"),
);
export const FranchiseFeesInitialFranchiseFee = modifyMeasure(Md.$FranchiseFeesInitialFranchiseFee, (m) =>
    m.format("#,##0").localId("franchiseFeesInitialFranchiseFee"),
);
export const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesOngoingRoyalty"),
);

const measures = [FranchiseFeesAdRoyalty, FranchiseFeesInitialFranchiseFee, FranchiseFeesOngoingRoyalty];

const style = { height: 300 };

export const DonutChartExample: React.FC = () => {
    return (
        <div style={style} className="s-donut-chart">
            <DonutChart measures={measures} />
        </div>
    );
};

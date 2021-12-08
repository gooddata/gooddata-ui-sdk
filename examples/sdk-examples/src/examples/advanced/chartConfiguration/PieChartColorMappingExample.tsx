// (C) 2007-2021 GoodData Corporation
import React from "react";
import { PieChart, IChartConfig } from "@gooddata/sdk-ui-charts";
import { Md } from "../../../md";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { measureLocalId, modifyMeasure } from "@gooddata/sdk-model";

const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesAdRoyalty"),
);
const FranchiseFeesInitialFranchiseFee = modifyMeasure(Md.$FranchiseFeesInitialFranchiseFee, (m) =>
    m.format("#,##0").localId("franchiseFeesInitialFranchiseFee"),
);
const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesOngoingRoyalty"),
);

const measures = [FranchiseFeesAdRoyalty, FranchiseFeesInitialFranchiseFee, FranchiseFeesOngoingRoyalty];

const chartConfig: IChartConfig = {
    colorMapping: [
        {
            predicate: HeaderPredicates.localIdentifierMatch(measureLocalId(FranchiseFeesAdRoyalty)),
            color: {
                type: "guid",
                value: "5",
            },
        },
        {
            predicate: HeaderPredicates.localIdentifierMatch(measureLocalId(FranchiseFeesOngoingRoyalty)),
            color: {
                type: "rgb",
                value: {
                    r: 0,
                    g: 0,
                    b: 0,
                },
            },
        },
    ],
};

const style = { height: 300 };

export const PieChartColorMappingExample: React.FC = () => {
    return (
        <div style={style} className="s-pie-chart">
            <PieChart measures={measures} config={chartConfig} />
        </div>
    );
};

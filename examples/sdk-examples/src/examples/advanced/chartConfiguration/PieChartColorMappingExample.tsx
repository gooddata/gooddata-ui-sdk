// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PieChart, IChartConfig } from "@gooddata/sdk-ui";
import { newMeasure } from "@gooddata/sdk-model";
import { IMeasureHeaderItem } from "@gooddata/sdk-backend-spi";

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../../../constants/fixtures";
import { useBackend } from "../../../context/auth";

const measures = [
    newMeasure(franchiseFeesAdRoyaltyIdentifier, m =>
        m.format("#,##0").localId("franchiseFeesAdRoyaltyIdentifier"),
    ),
    newMeasure(franchiseFeesInitialFranchiseFeeIdentifier, m =>
        m.format("#,##0").localId("franchiseFeesInitialFranchiseFeeIdentifier"),
    ),
    newMeasure(franchiseFeesIdentifierOngoingRoyalty, m =>
        m.format("#,##0").localId("franchiseFeesIdentifierOngoingRoyalty"),
    ),
];

const chartConfig: IChartConfig = {
    colorMapping: [
        {
            predicate: (headerItem: IMeasureHeaderItem) => {
                return headerItem.measureHeaderItem
                    ? headerItem.measureHeaderItem &&
                          headerItem.measureHeaderItem.localIdentifier === "franchiseFeesAdRoyaltyIdentifier"
                    : false;
            },
            color: {
                type: "guid",
                value: "5",
            },
        },
        {
            predicate: (headerItem: IMeasureHeaderItem) => {
                return headerItem.measureHeaderItem
                    ? headerItem.measureHeaderItem &&
                          headerItem.measureHeaderItem.localIdentifier ===
                              "franchiseFeesIdentifierOngoingRoyalty"
                    : false;
            },
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
    const backend = useBackend();

    return (
        <div style={style} className="s-pie-chart">
            <PieChart backend={backend} workspace={projectId} measures={measures} config={chartConfig} />
        </div>
    );
};

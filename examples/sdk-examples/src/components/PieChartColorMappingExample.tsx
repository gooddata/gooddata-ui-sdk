// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PieChart, Model, IChartConfig } from "@gooddata/sdk-ui";
import { IMeasureHeaderItem } from "@gooddata/sdk-backend-spi";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../utils/fixtures";
import { useBackend } from "../backend";

const measures = [
    Model.measure(franchiseFeesAdRoyaltyIdentifier)
        .localIdentifier("franchiseFeesAdRoyaltyIdentifier")
        .format("#,##0"),
    Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
        .localIdentifier("franchiseFeesInitialFranchiseFeeIdentifier")
        .format("#,##0"),
    Model.measure(franchiseFeesIdentifierOngoingRoyalty)
        .localIdentifier("franchiseFeesIdentifierOngoingRoyalty")
        .format("#,##0"),
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

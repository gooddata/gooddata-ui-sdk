// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PieChart, IChartConfig } from "@gooddata/sdk-ui-charts";
import { IMeasureDescriptor } from "@gooddata/sdk-backend-spi";
import { workspace } from "../../../constants/fixtures";
import { LdmExt } from "../../../ldm";
import { useBackend } from "../../../context/auth";
import { modifyMeasure } from "@gooddata/sdk-model";

const measures = [
    modifyMeasure(LdmExt.FranchiseFeesAdRoyalty, m => m.localId("franchiseFeesAdRoyaltyIdentifier")),
    modifyMeasure(LdmExt.FranchiseFeesInitialFranchiseFee, m =>
        m.localId("franchiseFeesInitialFranchiseFeeIdentifier"),
    ),
    modifyMeasure(LdmExt.FranchiseFeesOngoingRoyalty, m =>
        m.localId("franchiseFeesIdentifierOngoingRoyalty"),
    ),
];

const chartConfig: IChartConfig = {
    colorMapping: [
        {
            predicate: (headerItem: IMeasureDescriptor) => {
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
            predicate: (headerItem: IMeasureDescriptor) => {
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
            <PieChart backend={backend} workspace={workspace} measures={measures} config={chartConfig} />
        </div>
    );
};

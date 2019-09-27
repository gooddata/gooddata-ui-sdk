// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { PieChart, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../utils/fixtures";
import { useBackend } from "../backend";

interface ICustomChartExampleState {
    legendItems: {
        color: string;
        name: string;
        onClick: () => void;
    }[];
}

const chartConfig = {
    legend: {
        enabled: false,
    },
};

const legendItemStyle = { display: "flex", margin: "10px 0", cursor: "pointer" };

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

const style = { height: 300 };

export const CustomLegendExample: React.FC = () => {
    const backend = useBackend();
    const [{ legendItems }, setState] = useState<ICustomChartExampleState>({
        legendItems: [],
    });
    const onLegendReady = ({ legendItems: _legendItems }) => {
        setState({
            legendItems: _legendItems,
        });
    };

    return (
        <div>
            {legendItems.length > 0 && (
                <div className="s-custom-legend">
                    {legendItems.map(({ color, name, onClick }, idx) => {
                        return (
                            <div
                                key={idx} // eslint-disable-line react/no-array-index-key
                                onClick={onClick}
                                style={legendItemStyle}
                            >
                                <div
                                    style={{
                                        width: 0,
                                        height: 0,
                                        borderTop: "10px solid transparent",
                                        borderLeft: `20px solid ${color}`,
                                        borderBottom: "10px solid transparent",
                                        marginRight: "5px",
                                    }}
                                />
                                {name}
                            </div>
                        );
                    })}
                </div>
            )}
            <div style={style} className="s-pie-chart">
                {/* 
                // @ts-ignore */}
                <PieChart
                    backend={backend}
                    workspace={projectId}
                    measures={measures}
                    config={chartConfig}
                    onLegendReady={onLegendReady}
                />
            </div>
        </div>
    );
};

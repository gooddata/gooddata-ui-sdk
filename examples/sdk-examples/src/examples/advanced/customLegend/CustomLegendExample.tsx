// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { PieChart } from "@gooddata/sdk-ui";
import { newMeasure } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
} from "../../../constants/fixtures";
import { useBackend } from "../../../context/auth";

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
    newMeasure(franchiseFeesAdRoyaltyIdentifier, m => m.format("#,##0")),
    newMeasure(franchiseFeesInitialFranchiseFeeIdentifier, m => m.format("#,##0")),
    newMeasure(franchiseFeesIdentifierOngoingRoyalty, m => m.format("#,##0")),
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

// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { PieChart } from "@gooddata/sdk-ui-charts";
import { LdmExt } from "../../../md";

interface ICustomChartExampleState {
    legendItems: Array<{
        color: string;
        name: string;
        onClick: () => void;
    }>;
}

const chartConfig = {
    legend: {
        enabled: false,
    },
};

const legendItemStyle = { display: "flex", margin: "10px 0", cursor: "pointer" };

const measures = [
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesInitialFranchiseFee,
    LdmExt.FranchiseFeesOngoingRoyalty,
];

const style = { height: 300 };

export const CustomLegendExample: React.FC = () => {
    const [{ legendItems }, setState] = useState<ICustomChartExampleState>({
        legendItems: [],
    });
    const onLegendReady = ({ legendItems: _legendItems }: ICustomChartExampleState) => {
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
                            <div key={idx} onClick={onClick} style={legendItemStyle}>
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
                <PieChart measures={measures} config={chartConfig} onLegendReady={onLegendReady} />
            </div>
        </div>
    );
};

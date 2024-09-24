// (C) 2024 GoodData Corporation

import React from "react";
import { GenAIChatCreatedVisualization } from "@gooddata/sdk-model";
import { BarChart, ColumnChart, Headline, LineChart, PieChart } from "@gooddata/sdk-ui-charts";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { Typography } from "@gooddata/sdk-ui-kit";
import { useExecution } from "./useExecution.js";

type VisualizationProps = {
    definition: GenAIChatCreatedVisualization;
};

export const Visualization: React.FC<VisualizationProps> = ({ definition }) => {
    const { metrics, dimensions } = useExecution(definition);

    return (
        <div className="gd-gen-ai-chat__messages__visualization">
            <div className="gd-gen-ai-chat__messages__visualization__wrapper">
                {(() => {
                    switch (definition.visualizationType) {
                        case "BAR":
                            return (
                                <BarChart
                                    height={300}
                                    measures={metrics}
                                    viewBy={[dimensions[0], dimensions[1]].filter(Boolean)}
                                    stackBy={metrics.length <= 1 ? dimensions[2] : undefined}
                                    config={{
                                        // Better visibility with stacked bars if there are multiple metrics and dimensions
                                        stackMeasures: metrics.length > 1 && dimensions.length === 2,
                                    }}
                                />
                            );
                        case "COLUMN":
                            return (
                                <ColumnChart
                                    height={300}
                                    measures={metrics}
                                    viewBy={[dimensions[0], dimensions[1]].filter(Boolean)}
                                    stackBy={metrics.length <= 1 ? dimensions[2] : undefined}
                                    config={{
                                        // Better visibility with stacked bars if there are multiple metrics and dimensions
                                        stackMeasures: metrics.length > 1 && dimensions.length === 2,
                                    }}
                                />
                            );
                        case "LINE":
                            return (
                                <LineChart
                                    height={300}
                                    measures={metrics}
                                    trendBy={dimensions[0]}
                                    segmentBy={metrics.length <= 1 ? dimensions[1] : undefined}
                                />
                            );
                        case "PIE":
                            return (
                                <PieChart
                                    height={300}
                                    measures={metrics}
                                    viewBy={metrics.length <= 1 ? dimensions[0] : undefined}
                                />
                            );
                        case "TABLE":
                            return <PivotTable measures={metrics} rows={dimensions} />;
                        case "HEADLINE":
                            return (
                                <Headline
                                    height={300}
                                    primaryMeasure={metrics[0]}
                                    secondaryMeasures={[metrics[1], metrics[2]].filter(Boolean)}
                                />
                            );
                        default:
                            return assertNever(definition.visualizationType);
                    }
                })()}
            </div>
            <Typography tagName="p" className="gd-gen-ai-chat__messages__visualization__title">
                {definition.title}
            </Typography>
        </div>
    );
};

const assertNever = (value: never): never => {
    throw new Error("Unknown visualization type: " + value);
};

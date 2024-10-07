// (C) 2024 GoodData Corporation

import React from "react";
import cx from "classnames";
import { IAttribute, IMeasure } from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { BarChart, ColumnChart, Headline, LineChart, PieChart } from "@gooddata/sdk-ui-charts";
import { VisualizationContents } from "../../../model.js";
import { useExecution } from "./useExecution.js";
import { VisualizationErrorBoundary } from "./VisualizationErrorBoundary.js";

export type VisualizationContentsProps = {
    content: VisualizationContents;
};

export const VisualizationContentsComponent: React.FC<VisualizationContentsProps> = ({ content }) => {
    const className = cx(
        "gd-gen-ai-chat__messages__content",
        "gd-gen-ai-chat__messages__content--visualization",
    );
    const visualization = content.createdVisualizations?.[0];
    const { metrics, dimensions } = useExecution(visualization);

    return (
        <div className={className}>
            <Typography tagName="p">{content.text}</Typography>
            {visualization ? (
                // TODO - wrap this into error boundary, as the chart components can throw
                <div className="gd-gen-ai-chat__visualization">
                    <div className="gd-gen-ai-chat__visualization__wrapper">
                        <VisualizationErrorBoundary>
                            {(() => {
                                switch (visualization.visualizationType) {
                                    case "BAR":
                                        return renderBarChart(metrics, dimensions);
                                    case "COLUMN":
                                        return renderColumnChart(metrics, dimensions);
                                    case "LINE":
                                        return renderLineChart(metrics, dimensions);
                                    case "PIE":
                                        return renderPieChart(metrics, dimensions);
                                    case "TABLE":
                                        return renderTable(metrics, dimensions);
                                    case "HEADLINE":
                                        return renderHeadline(metrics, dimensions);
                                    default:
                                        return assertNever(visualization.visualizationType);
                                }
                            })()}
                        </VisualizationErrorBoundary>
                    </div>
                    <Typography tagName="p" className="gd-gen-ai-chat__messages__visualization__title">
                        {visualization.title}
                    </Typography>
                </div>
            ) : null}
        </div>
    );
};

const assertNever = (value: never): never => {
    throw new Error("Unknown visualization type: " + value);
};

const renderBarChart = (metrics: IMeasure[], dimensions: IAttribute[]) => (
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

const renderColumnChart = (metrics: IMeasure[], dimensions: IAttribute[]) => (
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

const renderLineChart = (metrics: IMeasure[], dimensions: IAttribute[]) => (
    <LineChart
        height={300}
        measures={metrics}
        trendBy={dimensions[0]}
        segmentBy={metrics.length <= 1 ? dimensions[1] : undefined}
    />
);

const renderPieChart = (metrics: IMeasure[], dimensions: IAttribute[]) => (
    <PieChart height={300} measures={metrics} viewBy={metrics.length <= 1 ? dimensions[0] : undefined} />
);

const renderTable = (metrics: IMeasure[], dimensions: IAttribute[]) => (
    <PivotTable measures={metrics} rows={dimensions} />
);

const renderHeadline = (metrics: IMeasure[], _dimensions: IAttribute[]) => (
    <Headline
        height={300}
        primaryMeasure={metrics[0]}
        secondaryMeasures={[metrics[1], metrics[2]].filter(Boolean)}
    />
);

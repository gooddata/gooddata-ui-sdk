// (C) 2024 GoodData Corporation

import React from "react";
import cx from "classnames";
import { IAttribute, IFilter, IMeasure } from "@gooddata/sdk-model";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { BarChart, ColumnChart, Headline, LineChart, PieChart } from "@gooddata/sdk-ui-charts";
import { VisualizationContents } from "../../../model.js";
import { useExecution } from "./useExecution.js";
import { VisualizationErrorBoundary } from "./VisualizationErrorBoundary.js";
import { MarkdownComponent } from "./Markdown.js";

export type VisualizationContentsProps = {
    content: VisualizationContents;
    useMarkdown?: boolean;
};

export const VisualizationContentsComponent: React.FC<VisualizationContentsProps> = ({
    content,
    useMarkdown,
}) => {
    const className = cx(
        "gd-gen-ai-chat__messages__content",
        "gd-gen-ai-chat__messages__content--visualization",
    );
    const visualization = content.createdVisualizations?.[0];
    const { metrics, dimensions, filters } = useExecution(visualization);

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{content.text}</MarkdownComponent>
            {visualization ? (
                <div className="gd-gen-ai-chat__visualization">
                    <div className="gd-gen-ai-chat__visualization__wrapper">
                        <VisualizationErrorBoundary>
                            {(() => {
                                switch (visualization.visualizationType) {
                                    case "BAR":
                                        return renderBarChart(metrics, dimensions, filters);
                                    case "COLUMN":
                                        return renderColumnChart(metrics, dimensions, filters);
                                    case "LINE":
                                        return renderLineChart(metrics, dimensions, filters);
                                    case "PIE":
                                        return renderPieChart(metrics, dimensions, filters);
                                    case "TABLE":
                                        return renderTable(metrics, dimensions, filters);
                                    case "HEADLINE":
                                        return renderHeadline(metrics, dimensions, filters);
                                    default:
                                        return assertNever(visualization.visualizationType);
                                }
                            })()}
                        </VisualizationErrorBoundary>
                    </div>
                    <div className="gd-gen-ai-chat__messages__visualization__title">
                        <MarkdownComponent allowMarkdown={useMarkdown}>
                            {visualization.title}
                        </MarkdownComponent>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

const assertNever = (value: never): never => {
    throw new Error("Unknown visualization type: " + value);
};

const renderBarChart = (metrics: IMeasure[], dimensions: IAttribute[], filters: IFilter[]) => (
    <BarChart
        height={300}
        measures={metrics}
        viewBy={[dimensions[0], dimensions[1]].filter(Boolean)}
        stackBy={metrics.length <= 1 ? dimensions[2] : undefined}
        config={{
            // Better visibility with stacked bars if there are multiple metrics and dimensions
            stackMeasures: metrics.length > 1 && dimensions.length === 2,
        }}
        filters={filters}
    />
);

const renderColumnChart = (metrics: IMeasure[], dimensions: IAttribute[], filters: IFilter[]) => (
    <ColumnChart
        height={300}
        measures={metrics}
        viewBy={[dimensions[0], dimensions[1]].filter(Boolean)}
        stackBy={metrics.length <= 1 ? dimensions[2] : undefined}
        config={{
            // Better visibility with stacked bars if there are multiple metrics and dimensions
            stackMeasures: metrics.length > 1 && dimensions.length === 2,
        }}
        filters={filters}
    />
);

const renderLineChart = (metrics: IMeasure[], dimensions: IAttribute[], filters: IFilter[]) => (
    <LineChart
        height={300}
        measures={metrics}
        trendBy={dimensions[0]}
        segmentBy={metrics.length <= 1 ? dimensions[1] : undefined}
        filters={filters}
    />
);

const renderPieChart = (metrics: IMeasure[], dimensions: IAttribute[], filters: IFilter[]) => (
    <PieChart
        height={300}
        measures={metrics}
        viewBy={metrics.length <= 1 ? dimensions[0] : undefined}
        filters={filters}
    />
);

const renderTable = (metrics: IMeasure[], dimensions: IAttribute[], filters: IFilter[]) => (
    <PivotTable measures={metrics} rows={dimensions} filters={filters} />
);

const renderHeadline = (metrics: IMeasure[], _dimensions: IAttribute[], filters: IFilter[]) => (
    <Headline
        height={300}
        primaryMeasure={metrics[0]}
        secondaryMeasures={[metrics[1], metrics[2]].filter(Boolean)}
        filters={filters}
    />
);

// (C) 2024-2025 GoodData Corporation

import React from "react";
import cx from "classnames";
import { IAttribute, IFilter, IMeasure } from "@gooddata/sdk-model";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { BarChart, ColumnChart, Headline, LineChart, PieChart } from "@gooddata/sdk-ui-charts";
import { makeTextContents, makeUserMessage, VisualizationContents } from "../../../model.js";
import { useExecution } from "./useExecution.js";
import { VisualizationErrorBoundary } from "./VisualizationErrorBoundary.js";
import { MarkdownComponent } from "./Markdown.js";
import { Bubble, BubbleHoverTrigger, Button, Icon } from "@gooddata/sdk-ui-kit";
import { useDispatch } from "react-redux";
import { newMessageAction } from "../../../store/index.js";
import { useConfig } from "../../ConfigContext.js";
import { VisualizationSaveDialog } from "./VisualizationSaveDialog.js";
import { FormattedMessage } from "react-intl";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";

const VIS_HEIGHT = 250;

export type VisualizationContentsProps = {
    content: VisualizationContents;
    messageId: string;
    useMarkdown?: boolean;
    showSuggestions?: boolean;
};

export const VisualizationContentsComponent: React.FC<VisualizationContentsProps> = ({
    content,
    messageId,
    useMarkdown,
    showSuggestions = false,
}) => {
    const dispatch = useDispatch();
    const className = cx(
        "gd-gen-ai-chat__messages__content",
        "gd-gen-ai-chat__messages__content--visualization",
    );
    const visualization = content.createdVisualizations?.[0];
    const { metrics, dimensions, filters } = useExecution(visualization);
    const config = useConfig();
    const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
    const workspaceId = useWorkspaceStrict();

    const handleButtonClick = (e: any) => {
        if (visualization?.savedVisualizationId) {
            // TODO should instead trigger an event and let the hosting app do the redirect
            const url = `/analyze/#/${workspaceId}/${visualization.savedVisualizationId}/edit`;
            if (e.ctrlKey || e.metaKey) {
                // Open in a new tab
                window.open(url);
            } else {
                // Open in the same tab
                window.location.href = url;
            }
            e.preventDefault();
            e.stopPropagation();
        } else {
            setSaveDialogOpen(true);
        }
    };

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{content.text}</MarkdownComponent>
            {visualization ? (
                <div className="gd-gen-ai-chat__visualization">
                    <div
                        className={cx(
                            "gd-gen-ai-chat__visualization__wrapper",
                            `gd-gen-ai-chat__visualization__wrapper--${visualization.visualizationType.toLowerCase()}`,
                        )}
                    >
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
                    <div className="gd-gen-ai-chat__visualization__title">
                        <MarkdownComponent allowMarkdown={useMarkdown}>
                            {visualization.title}
                        </MarkdownComponent>
                    </div>
                    {config.allowCreateVisualization ? (
                        <div onClick={handleButtonClick} className="gd-gen-ai-chat__visualization__save">
                            <BubbleHoverTrigger
                                tagName="div"
                                className="gd-gen-ai-chat__visualization__save__bubble"
                            >
                                {visualization.savedVisualizationId ? (
                                    <Icon.Edit width={18} height={18} color="#fff" />
                                ) : (
                                    <Icon.Save width={18} height={18} color="#fff" />
                                )}
                                <Bubble alignPoints={[{ align: "bc tc", offset: { x: 0, y: 8 } }]}>
                                    {visualization.savedVisualizationId ? (
                                        <FormattedMessage id={"gd.gen-ai.button.edit"} />
                                    ) : (
                                        <FormattedMessage id={"gd.gen-ai.button.save"} />
                                    )}
                                </Bubble>
                            </BubbleHoverTrigger>
                        </div>
                    ) : null}
                    {saveDialogOpen ? (
                        <VisualizationSaveDialog
                            onClose={() => setSaveDialogOpen(false)}
                            visualization={visualization}
                            messageId={messageId}
                        />
                    ) : null}
                </div>
            ) : null}
            {showSuggestions && visualization?.suggestions?.length ? (
                <div className="gd-gen-ai-chat__visualization__suggestions">
                    {visualization.suggestions.map((suggestion) => (
                        <Button
                            key={suggestion.label}
                            variant="secondary"
                            title={suggestion.query}
                            onClick={() => {
                                dispatch(
                                    newMessageAction(makeUserMessage([makeTextContents(suggestion.query)])),
                                );
                            }}
                        >
                            {suggestion.label}
                        </Button>
                    ))}
                </div>
            ) : null}
        </div>
    );
};

const assertNever = (value: never): never => {
    throw new Error("Unknown visualization type: " + value);
};

const visualizationTooltipOptions = {
    tooltip: {
        className: "gd-gen-ai-chat__vis_tooltip",
    },
};

const legendTooltipOptions = {
    legend: {
        responsive: "autoPositionWithPopup" as const,
    },
};

const renderBarChart = (metrics: IMeasure[], dimensions: IAttribute[], filters: IFilter[]) => (
    <BarChart
        height={VIS_HEIGHT}
        measures={metrics}
        viewBy={[dimensions[0], dimensions[1]].filter(Boolean)}
        stackBy={metrics.length <= 1 ? dimensions[2] : undefined}
        config={{
            ...visualizationTooltipOptions,
            ...legendTooltipOptions,
            // Better visibility with stacked bars if there are multiple metrics and dimensions
            stackMeasures: metrics.length > 1 && dimensions.length === 2,
        }}
        filters={filters}
    />
);

const renderColumnChart = (metrics: IMeasure[], dimensions: IAttribute[], filters: IFilter[]) => (
    <ColumnChart
        height={VIS_HEIGHT}
        measures={metrics}
        viewBy={[dimensions[0], dimensions[1]].filter(Boolean)}
        stackBy={metrics.length <= 1 ? dimensions[2] : undefined}
        config={{
            ...visualizationTooltipOptions,
            ...legendTooltipOptions,
            // Better visibility with stacked bars if there are multiple metrics and dimensions
            stackMeasures: metrics.length > 1 && dimensions.length === 2,
        }}
        filters={filters}
    />
);

const renderLineChart = (metrics: IMeasure[], dimensions: IAttribute[], filters: IFilter[]) => (
    <LineChart
        height={VIS_HEIGHT}
        measures={metrics}
        trendBy={dimensions[0]}
        segmentBy={metrics.length <= 1 ? dimensions[1] : undefined}
        filters={filters}
        config={{
            ...visualizationTooltipOptions,
            ...legendTooltipOptions,
        }}
    />
);

const renderPieChart = (metrics: IMeasure[], dimensions: IAttribute[], filters: IFilter[]) => (
    <PieChart
        height={VIS_HEIGHT}
        measures={metrics}
        viewBy={metrics.length <= 1 ? dimensions[0] : undefined}
        filters={filters}
        config={{
            ...visualizationTooltipOptions,
        }}
    />
);

const renderTable = (metrics: IMeasure[], dimensions: IAttribute[], filters: IFilter[]) => (
    <PivotTable measures={metrics} rows={dimensions} filters={filters} />
);

const renderHeadline = (metrics: IMeasure[], _dimensions: IAttribute[], filters: IFilter[]) => (
    <Headline
        primaryMeasure={metrics[0]}
        secondaryMeasures={[metrics[1], metrics[2]].filter(Boolean)}
        filters={filters}
        config={{
            ...visualizationTooltipOptions,
        }}
    />
);

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
import { newMessageAction, visualizationErrorAction } from "../../../store/index.js";
import { useConfig } from "../../ConfigContext.js";
import { VisualizationSaveDialog } from "./VisualizationSaveDialog.js";
import { FormattedMessage } from "react-intl";
import { GoodDataSdkError, OnError, OnLoadingChanged, useWorkspaceStrict } from "@gooddata/sdk-ui";

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
    const [hasVisError, setHasVisError] = React.useState(false);
    const [visLoading, setVisLoading] = React.useState(true);
    const workspaceId = useWorkspaceStrict();
    const href = `/analyze/#/${workspaceId}/${visualization.savedVisualizationId}/edit`;

    const handleButtonClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) => {
        if (visualization?.savedVisualizationId) {
            config.linkHandler?.({
                id: visualization.id,
                type: "visualization",
                workspaceId,
                newTab: e.metaKey,
                preventDefault: e.preventDefault.bind(e),
                itemUrl: href,
            });
            e.stopPropagation();
        } else {
            setSaveDialogOpen(true);
        }
    };

    const handleSdkError = (error: GoodDataSdkError) => {
        // Error callback may be triggered from render method in SDK,
        // have to move the state update to the next tick to keep render pure
        setTimeout(() => {
            setHasVisError(true);
            dispatch(
                visualizationErrorAction({
                    errorType: error.seType,
                    errorMessage: error.getMessage(),
                }),
            );
        });
    };

    const handleLoadingChanged: OnLoadingChanged = ({ isLoading }) => {
        // Loading callback is triggered from render method, have to move
        // the state update to the next tick to keep render pure
        setTimeout(() => {
            setVisLoading(isLoading);
        });
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
                                        return renderBarChart(
                                            metrics,
                                            dimensions,
                                            filters,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
                                    case "COLUMN":
                                        return renderColumnChart(
                                            metrics,
                                            dimensions,
                                            filters,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
                                    case "LINE":
                                        return renderLineChart(
                                            metrics,
                                            dimensions,
                                            filters,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
                                    case "PIE":
                                        return renderPieChart(
                                            metrics,
                                            dimensions,
                                            filters,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
                                    case "TABLE":
                                        return renderTable(
                                            metrics,
                                            dimensions,
                                            filters,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
                                    case "HEADLINE":
                                        return renderHeadline(
                                            metrics,
                                            dimensions,
                                            filters,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
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
                    {config.allowCreateVisualization && !hasVisError && !visLoading
                        ? (() => {
                              const trigger = (
                                  <BubbleHoverTrigger
                                      tagName="span"
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
                              );

                              return visualization.savedVisualizationId && config.allowNativeLinks ? (
                                  <a
                                      href={href}
                                      onClick={handleButtonClick}
                                      className="gd-gen-ai-chat__visualization__save"
                                  >
                                      {trigger}
                                  </a>
                              ) : (
                                  <div
                                      onClick={handleButtonClick}
                                      className="gd-gen-ai-chat__visualization__save"
                                  >
                                      {trigger}
                                  </div>
                              );
                          })()
                        : null}
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

const renderBarChart = (
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
) => (
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
        onError={onError}
        onLoadingChanged={onLoadingChanged}
    />
);

const renderColumnChart = (
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
) => (
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
        onError={onError}
        onLoadingChanged={onLoadingChanged}
    />
);

const renderLineChart = (
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
) => (
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
        onError={onError}
        onLoadingChanged={onLoadingChanged}
    />
);

const renderPieChart = (
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
) => (
    <PieChart
        height={VIS_HEIGHT}
        measures={metrics}
        viewBy={metrics.length <= 1 ? dimensions[0] : undefined}
        filters={filters}
        config={{
            ...visualizationTooltipOptions,
        }}
        onError={onError}
        onLoadingChanged={onLoadingChanged}
    />
);

const renderTable = (
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
) => (
    <PivotTable
        measures={metrics}
        rows={dimensions}
        filters={filters}
        onError={onError}
        onLoadingChanged={onLoadingChanged}
    />
);

const renderHeadline = (
    metrics: IMeasure[],
    _dimensions: IAttribute[],
    filters: IFilter[],
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
) => (
    <Headline
        primaryMeasure={metrics[0]}
        secondaryMeasures={[metrics[1], metrics[2]].filter(Boolean)}
        filters={filters}
        config={{
            ...visualizationTooltipOptions,
        }}
        onError={onError}
        onLoadingChanged={onLoadingChanged}
    />
);

// (C) 2024-2025 GoodData Corporation

import React from "react";
import cx from "classnames";
import { IAttribute, IColorPalette, IFilter, IGenAIVisualization, IMeasure } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Button, Icon } from "@gooddata/sdk-ui-kit";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { connect, useDispatch } from "react-redux";
import { BarChart, ColumnChart, Headline, LineChart, PieChart } from "@gooddata/sdk-ui-charts";
import { FormattedMessage } from "react-intl";
import {
    GoodDataSdkError,
    isNoDataSdkError,
    OnError,
    OnLoadingChanged,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import { makeTextContents, makeUserMessage, VisualizationContents } from "../../../model.js";
import { useConfig } from "../../ConfigContext.js";
import {
    RootState,
    newMessageAction,
    visualizationErrorAction,
    colorPaletteSelector,
} from "../../../store/index.js";

import { VisualizationErrorBoundary } from "./VisualizationErrorBoundary.js";
import { VisualizationSaveDialog } from "./VisualizationSaveDialog.js";
import { useExecution } from "./useExecution.js";
import { MarkdownComponent } from "./Markdown.js";

const VIS_HEIGHT = 250;

const getVisualizationHref = (wsId: string, visId: string) => {
    return `/analyze/#/${wsId}/${visId}/edit`;
};

export type VisualizationContentsProps = {
    content: VisualizationContents;
    messageId: string;
    useMarkdown?: boolean;
    showSuggestions?: boolean;
    colorPalette?: IColorPalette;
};

const VisualizationContentsComponentCore: React.FC<VisualizationContentsProps> = ({
    content,
    messageId,
    useMarkdown,
    colorPalette,
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

    const handleOpen = (e: React.MouseEvent, vis: IGenAIVisualization) => {
        if (!vis?.savedVisualizationId) {
            return;
        }
        config.linkHandler?.({
            id: vis.id,
            type: "visualization",
            workspaceId,
            newTab: e.metaKey,
            preventDefault: e.preventDefault.bind(e),
            itemUrl: getVisualizationHref(workspaceId, vis.savedVisualizationId),
        });
        e.stopPropagation();
    };

    const handleButtonClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) => {
        if (visualization?.savedVisualizationId) {
            handleOpen(e, visualization);
        } else {
            setSaveDialogOpen(true);
        }
    };

    const handleSdkError = (error: GoodDataSdkError) => {
        // Ignore NO_DATA error, we still want an option to save the visualization
        if (!isNoDataSdkError(error)) {
            setHasVisError(true);
        }
        dispatch(
            visualizationErrorAction({
                errorType: error.seType,
                errorMessage: error.getMessage(),
            }),
        );
    };

    const handleLoadingChanged: OnLoadingChanged = ({ isLoading }) => {
        setVisLoading(isLoading);
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
                                            colorPalette,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
                                    case "COLUMN":
                                        return renderColumnChart(
                                            metrics,
                                            dimensions,
                                            filters,
                                            colorPalette,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
                                    case "LINE":
                                        return renderLineChart(
                                            metrics,
                                            dimensions,
                                            filters,
                                            colorPalette,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
                                    case "PIE":
                                        return renderPieChart(
                                            metrics,
                                            dimensions,
                                            filters,
                                            colorPalette,
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
                                            colorPalette,
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
                                      href={getVisualizationHref(
                                          workspaceId,
                                          visualization.savedVisualizationId,
                                      )}
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
    colorPalette: IColorPalette | undefined,
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
            colorPalette,
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
    colorPalette: IColorPalette | undefined,
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
            colorPalette,
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
    colorPalette: IColorPalette | undefined,
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
            colorPalette,
        }}
        onError={onError}
        onLoadingChanged={onLoadingChanged}
    />
);

const renderPieChart = (
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    colorPalette: IColorPalette | undefined,
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
            colorPalette,
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
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
) => (
    <Headline
        primaryMeasure={metrics[0]}
        secondaryMeasures={[metrics[1], metrics[2]].filter(Boolean)}
        filters={filters}
        config={{
            ...visualizationTooltipOptions,
            colorPalette,
        }}
        onError={onError}
        onLoadingChanged={onLoadingChanged}
    />
);

const mapStateToProps = (state: RootState): Pick<VisualizationContentsProps, "colorPalette"> => ({
    colorPalette: colorPaletteSelector(state),
});

export const VisualizationContentsComponent = connect(
    mapStateToProps,
    undefined,
)(VisualizationContentsComponentCore);

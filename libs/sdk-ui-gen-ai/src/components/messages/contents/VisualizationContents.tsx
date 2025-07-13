// (C) 2024-2025 GoodData Corporation

import React, { ReactNode, useMemo } from "react";
import cx from "classnames";
import copy from "copy-to-clipboard";
import { IAttribute, IColorPalette, IFilter, IGenAIVisualization, IMeasure } from "@gooddata/sdk-model";
import {
    Button,
    UiFocusManager,
    IAlignPoint,
    Icon,
    ItemsWrapper,
    makeMenuKeyboardNavigation,
    Overlay,
    SingleSelectListItem,
    useId,
} from "@gooddata/sdk-ui-kit";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { connect, useDispatch } from "react-redux";
import { BarChart, ColumnChart, Headline, LineChart, PieChart } from "@gooddata/sdk-ui-charts";
import { useIntl } from "react-intl";
import {
    GoodDataSdkError,
    isNoDataSdkError,
    OnError,
    OnLoadingChanged,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import { makeTextContents, makeUserMessage, VisualizationContents } from "../../../model.js";
import { getAbsoluteVisualizationHref, getHeadlineComparison, getVisualizationHref } from "../../../utils.js";
import { useConfig } from "../../ConfigContext.js";
import {
    RootState,
    newMessageAction,
    visualizationErrorAction,
    copyToClipboardAction,
    colorPaletteSelector,
} from "../../../store/index.js";

import { VisualizationErrorBoundary } from "./VisualizationErrorBoundary.js";
import { VisualizationSaveDialog } from "./VisualizationSaveDialog.js";
import { useExecution } from "./useExecution.js";
import { MarkdownComponent } from "./Markdown.js";

const VIS_HEIGHT = 250;
const MORE_MENU_BUTTON_ID = "gd-gen-ai-chat__visualization__save__more-menu-button";
const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

interface IMenuButtonItem {
    id: string;
    title: string;
    icon: ReactNode;
}

export type VisualizationContentsProps = {
    content: VisualizationContents;
    messageId: string;
    useMarkdown?: boolean;
    showSuggestions?: boolean;
    colorPalette?: IColorPalette;
    onCopyToClipboard?: (data: { content: string }) => void;
};

const VisualizationContentsComponentCore: React.FC<VisualizationContentsProps> = ({
    content,
    messageId,
    useMarkdown,
    colorPalette,
    showSuggestions = false,
    onCopyToClipboard,
}) => {
    const dispatch = useDispatch();
    const className = cx(
        "gd-gen-ai-chat__messages__content",
        "gd-gen-ai-chat__messages__content--visualization",
    );
    const visualization = content.createdVisualizations?.[0];
    const { metrics, dimensions, filters } = useExecution(visualization);
    const config = useConfig();
    const [saveDialogOpen, setSaveDialogOpen] = React.useState<"save" | "explore" | null>(null);
    const [hasVisError, setHasVisError] = React.useState(false);
    const [visLoading, setVisLoading] = React.useState(true);
    const workspaceId = useWorkspaceStrict();
    const [isMenuButtonOpen, setMenuButtonOpen] = React.useState(false);
    const [isHovered, setHovered] = React.useState(false);

    const intl = useIntl();
    const tooltipText = intl.formatMessage(
        { id: "gd.gen-ai.visualisation.menu" },
        {
            name: visualization?.title || "",
        },
    );

    // generate unique IDs for accessibility and dropdown positioning
    const id = useId();
    const menuId = `menu-${id}`;
    const dropdownAnchorClassName = `${MORE_MENU_BUTTON_ID}-${id}`;

    const menuItems = useMemo(
        () =>
            visualization?.savedVisualizationId
                ? ([
                      {
                          id: "button-save",
                          title: intl.formatMessage({
                              id: "gd.gen-ai.visualisation.menu.button.save_as_new_visualisation",
                          }),
                          icon: <Icon.Save width={16} height={16} />,
                      },
                      {
                          id: "button-open",
                          title: intl.formatMessage({
                              id: "gd.gen-ai.visualisation.menu.button.open_in_analyze",
                          }),
                          icon: <Icon.ExternalLink width={16} height={16} />,
                      },
                      {
                          id: "button-copy",
                          title: intl.formatMessage({
                              id: "gd.gen-ai.visualisation.menu.button.copy_visualisation_link",
                          }),
                          icon: <Icon.Copy width={16} height={16} />,
                      },
                  ] as IMenuButtonItem[])
                : ([
                      {
                          id: "button-save",
                          title: intl.formatMessage({
                              id: "gd.gen-ai.visualisation.menu.button.save_as_visualisation",
                          }),
                          icon: <Icon.Save width={16} height={16} />,
                      },
                      {
                          id: "button-open",
                          title: intl.formatMessage({
                              id: "gd.gen-ai.visualisation.menu.button.open_in_analyze",
                          }),
                          icon: <Icon.ExternalLink width={16} height={16} />,
                      },
                  ] as IMenuButtonItem[]),
        [intl, visualization?.savedVisualizationId],
    );

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

    const handleButtonClick = (e: React.MouseEvent<HTMLElement>, item: IMenuButtonItem) => {
        switch (item.id) {
            case "button-save":
                setSaveDialogOpen("save");
                setMenuButtonOpen(false);
                break;
            case "button-open":
                if (visualization?.savedVisualizationId) {
                    if (config.allowNativeLinks) {
                        window.location.href = getVisualizationHref(
                            workspaceId,
                            visualization.savedVisualizationId,
                        );
                    } else {
                        handleOpen(e, visualization);
                    }
                } else {
                    setSaveDialogOpen("explore");
                }
                setMenuButtonOpen(false);
                break;
            case "button-copy":
                if (visualization?.savedVisualizationId) {
                    const link = getAbsoluteVisualizationHref(
                        workspaceId,
                        visualization.savedVisualizationId,
                    );
                    copy(link);
                    onCopyToClipboard?.({ content: link });
                }
                setMenuButtonOpen(false);
                break;
            default:
                // No action needed for other items
                break;
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

    const handleKeyDown = React.useMemo(
        () =>
            makeMenuKeyboardNavigation({
                onClose: () => setMenuButtonOpen(false),
            }),
        [],
    );

    const renderMenuItems = () => {
        return (
            <Overlay
                key={"saveVisualisationMenuButton"}
                alignTo={`.${dropdownAnchorClassName}`}
                alignPoints={overlayAlignPoints}
                className="gd-gen-ai-chat__visualization__menu_overlay"
                closeOnMouseDrag={true}
                closeOnOutsideClick={true}
                onClose={() => setMenuButtonOpen(false)}
            >
                <UiFocusManager enableAutofocus enableReturnFocusOnUnmount enableFocusTrap>
                    <div style={{ display: "contents" }} tabIndex={-1} onKeyDown={handleKeyDown}>
                        <ItemsWrapper smallItemsSpacing className="gd-menu">
                            <div role={"menu"} id={menuId} aria-labelledby={MORE_MENU_BUTTON_ID}>
                                {menuItems.map((menuItem) => {
                                    return (
                                        <SingleSelectListItem
                                            className="gd-menu-item"
                                            elementType="button"
                                            key={menuItem.id}
                                            title={menuItem.title}
                                            icon={menuItem.icon}
                                            onClick={(e) => {
                                                handleButtonClick(e, menuItem);
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </ItemsWrapper>
                    </div>
                </UiFocusManager>
            </Overlay>
        );
    };

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{content.text}</MarkdownComponent>
            {visualization ? (
                <div
                    className={cx(
                        "gd-gen-ai-chat__visualization",
                        `gd-gen-ai-chat__visualization--${visualization.visualizationType.toLowerCase()}`,
                        {
                            active: isMenuButtonOpen || isHovered,
                        },
                    )}
                    onPointerEnter={() => setHovered(true)}
                    onPointerLeave={() => setHovered(false)}
                >
                    {config.canAnalyze && !hasVisError && !visLoading
                        ? (() => {
                              return (
                                  <>
                                      <Button
                                          dataTestId="gen-ai-visualization-menu-button"
                                          onClick={() => setMenuButtonOpen(!isMenuButtonOpen)}
                                          value="&#8943;"
                                          id={MORE_MENU_BUTTON_ID}
                                          className={cx(
                                              "gd-button-primary gd-button",
                                              "gd-gen-ai-chat__visualization__save",
                                              dropdownAnchorClassName,
                                              {
                                                  hidden: !(isMenuButtonOpen || isHovered),
                                              },
                                          )}
                                          accessibilityConfig={{
                                              ariaLabel: tooltipText,
                                              role: "button",
                                              isExpanded: isMenuButtonOpen,
                                              popupId: menuId,
                                          }}
                                      />
                                      {isMenuButtonOpen ? renderMenuItems() : null}
                                  </>
                              );
                          })()
                        : null}
                    <div className="gd-gen-ai-chat__visualization__title">
                        <MarkdownComponent allowMarkdown={useMarkdown}>
                            {visualization.title}
                        </MarkdownComponent>
                    </div>
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
                                            intl.locale,
                                            metrics,
                                            dimensions,
                                            filters,
                                            colorPalette,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
                                    case "COLUMN":
                                        return renderColumnChart(
                                            intl.locale,
                                            metrics,
                                            dimensions,
                                            filters,
                                            colorPalette,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
                                    case "LINE":
                                        return renderLineChart(
                                            intl.locale,
                                            metrics,
                                            dimensions,
                                            filters,
                                            colorPalette,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
                                    case "PIE":
                                        return renderPieChart(
                                            intl.locale,
                                            metrics,
                                            dimensions,
                                            filters,
                                            colorPalette,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
                                    case "TABLE":
                                        return renderTable(
                                            intl.locale,
                                            metrics,
                                            dimensions,
                                            filters,
                                            handleSdkError,
                                            handleLoadingChanged,
                                        );
                                    case "HEADLINE":
                                        return renderHeadline(
                                            intl.locale,
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
                    {saveDialogOpen ? (
                        <VisualizationSaveDialog
                            onClose={() => setSaveDialogOpen(null)}
                            visualization={visualization}
                            type={saveDialogOpen}
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
                                    newMessageAction(
                                        makeUserMessage([makeTextContents(suggestion.query, [])]),
                                    ),
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
    locale: string,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
) => (
    <BarChart
        locale={locale}
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
    locale: string,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
) => (
    <ColumnChart
        locale={locale}
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
    locale: string,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
) => (
    <LineChart
        locale={locale}
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
    locale: string,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
) => (
    <PieChart
        locale={locale}
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
    locale: string,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
) => (
    <PivotTable
        locale={locale}
        measures={metrics}
        rows={dimensions}
        filters={filters}
        onError={onError}
        onLoadingChanged={onLoadingChanged}
    />
);

const renderHeadline = (
    locale: string,
    metrics: IMeasure[],
    _dimensions: IAttribute[],
    filters: IFilter[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
) => (
    <Headline
        locale={locale}
        primaryMeasure={metrics[0]}
        secondaryMeasures={[metrics[1], metrics[2]].filter(Boolean)}
        filters={filters}
        config={{
            ...visualizationTooltipOptions,
            ...getHeadlineComparison(metrics),
            colorPalette,
        }}
        onError={onError}
        onLoadingChanged={onLoadingChanged}
    />
);

const mapDispatchToProps = {
    onCopyToClipboard: copyToClipboardAction,
};

const mapStateToProps = (state: RootState): Pick<VisualizationContentsProps, "colorPalette"> => ({
    colorPalette: colorPaletteSelector(state),
});

export const VisualizationContentsComponent: any = connect(
    mapStateToProps,
    mapDispatchToProps,
)(VisualizationContentsComponentCore);

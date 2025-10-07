// (C) 2024-2025 GoodData Corporation

import { AriaAttributes, KeyboardEvent, MouseEvent, ReactNode, useCallback, useMemo, useState } from "react";

import cx from "classnames";
import copy from "copy-to-clipboard";
import { useIntl } from "react-intl";
import { connect, useDispatch } from "react-redux";

import {
    IAttribute,
    IColorPalette,
    IFilter,
    IGenAIVisualization,
    IMeasure,
    ISortItem,
} from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    OnError,
    OnExportReady,
    OnLoadingChanged,
    isNoDataSdkError,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { BarChart, ColumnChart, Headline, LineChart, PieChart } from "@gooddata/sdk-ui-charts";
import {
    IAlignPoint,
    Icon,
    Overlay,
    UiButton,
    UiFocusManager,
    UiIconButton,
    UiMenu,
    UiTooltip,
    useId,
} from "@gooddata/sdk-ui-kit";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { PivotTableNext } from "@gooddata/sdk-ui-pivot/next";

import { MarkdownComponent } from "./Markdown.js";
import { useExecution } from "./useExecution.js";
import { VisualizationErrorBoundary } from "./VisualizationErrorBoundary.js";
import { VisualizationSaveDialog } from "./VisualizationSaveDialog.js";
import { VisualizationContents, makeTextContents, makeUserMessage } from "../../../model.js";
import {
    RootState,
    colorPaletteSelector,
    copyToClipboardAction,
    newMessageAction,
    saveVisualisationRenderStatusAction,
    settingsSelector,
    visualizationErrorAction,
} from "../../../store/index.js";
import { getAbsoluteVisualizationHref, getHeadlineComparison, getVisualizationHref } from "../../../utils.js";
import { useConfig } from "../../ConfigContext.js";

const { Save: SaveIcon, ExternalLink: ExternalLinkIcon, Copy: CopyIcon } = Icon;

const VIS_HEIGHT = 250;
const MORE_MENU_BUTTON_ID = "gd-gen-ai-chat__visualization__save__more-menu-button";
const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

interface IMenuButtonItem {
    id: string;
    title: string;
    icon: ReactNode;
    ariaAttributes: AriaAttributes;
}

export type VisualizationContentsProps = {
    content: VisualizationContents;
    messageId: string;
    useMarkdown?: boolean;
    showSuggestions?: boolean;
    colorPalette?: IColorPalette;
    enableNewPivotTable?: boolean;
    onCopyToClipboard?: (data: { content: string }) => void;
};

function VisualizationContentsComponentCore({
    content,
    messageId,
    useMarkdown,
    colorPalette,
    enableNewPivotTable = false,
    showSuggestions = false,
    onCopyToClipboard,
}: VisualizationContentsProps) {
    const dispatch = useDispatch();
    const className = cx(
        "gd-gen-ai-chat__messages__content",
        "gd-gen-ai-chat__messages__content--visualization",
    );
    const visualization = content.createdVisualizations?.[0];
    const { metrics, dimensions, filters, sorts } = useExecution(visualization);
    const config = useConfig();
    const [saveDialogOpen, setSaveDialogOpen] = useState<"save" | "explore" | null>(null);
    const [hasVisError, setHasVisError] = useState(false);
    const [visLoading, setVisLoading] = useState(true);
    const workspaceId = useWorkspaceStrict();
    const [isMenuButtonOpen, setMenuButtonOpen] = useState(false);
    const [isTable, setIsTable] = useState(false);

    const intl = useIntl();
    const moreButtonTooltipText = intl.formatMessage({ id: "gd.gen-ai.visualisation.menu" });
    const toggleButtonTableTooltipText = intl.formatMessage({ id: "gd.gen-ai.visualisation.toggle.table" });
    const toggleButtonOriginalTooltipText = intl.formatMessage({
        id: "gd.gen-ai.visualisation.toggle.original",
    });

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
                          icon: <SaveIcon width={16} height={16} ariaHidden color="currentColor" />,
                          ariaAttributes: {
                              "aria-haspopup": "dialog",
                          },
                      },
                      {
                          id: "button-open",
                          title: intl.formatMessage({
                              id: "gd.gen-ai.visualisation.menu.button.open_in_analyze",
                          }),
                          icon: <ExternalLinkIcon width={16} height={16} ariaHidden color="currentColor" />,
                          ariaAttributes: {
                              "aria-description": intl.formatMessage({
                                  id: "gd.gen-ai.visualisation.menu.button.open_in_analyze.description",
                              }),
                          },
                      },
                      {
                          id: "button-copy",
                          title: intl.formatMessage({
                              id: "gd.gen-ai.visualisation.menu.button.copy_visualisation_link",
                          }),
                          icon: <CopyIcon width={16} height={16} ariaHidden color="currentColor" />,
                      },
                  ] as IMenuButtonItem[])
                : ([
                      {
                          id: "button-save",
                          title: intl.formatMessage({
                              id: "gd.gen-ai.visualisation.menu.button.save_as_visualisation",
                          }),
                          icon: <SaveIcon width={16} height={16} ariaHidden color="currentColor" />,
                          ariaAttributes: {
                              "aria-haspopup": "dialog",
                          },
                      },
                      {
                          id: "button-open",
                          title: intl.formatMessage({
                              id: "gd.gen-ai.visualisation.menu.button.open_in_analyze",
                          }),
                          icon: <ExternalLinkIcon width={16} height={16} ariaHidden color="currentColor" />,
                          ariaAttributes: {
                              "aria-description": intl.formatMessage({
                                  id: "gd.gen-ai.visualisation.menu.button.open_in_analyze.description",
                              }),
                          },
                      },
                  ] as IMenuButtonItem[]),
        [intl, visualization?.savedVisualizationId],
    );

    const handleOpen = (e: MouseEvent | KeyboardEvent, vis: IGenAIVisualization) => {
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

    const handleButtonClick = (e: MouseEvent | KeyboardEvent, item: IMenuButtonItem) => {
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

    const handleSuccess = useCallback(() => {
        dispatch(
            saveVisualisationRenderStatusAction({
                visualizationId: visualization.id,
                assistantMessageId: messageId,
                status: "SUCCESSFUL",
            }),
        );
    }, [dispatch, visualization?.id, messageId]);

    const handleSdkError = useCallback(
        (error: GoodDataSdkError) => {
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

            switch (error.seType) {
                case "NO_DATA":
                    dispatch(
                        saveVisualisationRenderStatusAction({
                            visualizationId: visualization.id,
                            assistantMessageId: messageId,
                            status: "NO_DATA",
                        }),
                    );
                    break;
                case "DATA_TOO_LARGE_TO_COMPUTE":
                case "DATA_TOO_LARGE_TO_DISPLAY":
                    dispatch(
                        saveVisualisationRenderStatusAction({
                            visualizationId: visualization.id,
                            assistantMessageId: messageId,
                            status: "TOO_MANY_DATA_POINTS",
                        }),
                    );
                    break;
                default:
                    dispatch(
                        saveVisualisationRenderStatusAction({
                            visualizationId: visualization.id,
                            assistantMessageId: messageId,
                            status: "UNEXPECTED_ERROR",
                        }),
                    );
                    break;
            }
        },
        [dispatch, visualization?.id, messageId],
    );

    const handleLoadingChanged: OnLoadingChanged = useCallback(({ isLoading }) => {
        setVisLoading(isLoading);
    }, []);

    const renderMenuItems = () => {
        return (
            <Overlay
                key={"saveVisualisationMenuButton"}
                alignTo={`.${dropdownAnchorClassName}`}
                alignPoints={overlayAlignPoints}
                className="gd-gen-ai-chat__visualization__menu_overlay"
                closeOnMouseDrag
                closeOnOutsideClick
                onClose={() => setMenuButtonOpen(false)}
            >
                <UiFocusManager enableAutofocus enableReturnFocusOnUnmount enableFocusTrap>
                    <UiMenu
                        dataTestId="gen-ai-visualization-menu-list"
                        items={menuItems.map((item) => ({
                            type: "interactive",
                            stringTitle: item.title,
                            data: item,
                            iconLeft: item.icon,
                            id: item.id,
                            isDisabled: false,
                            ariaAttributes: item.ariaAttributes,
                        }))}
                        ariaAttributes={{
                            id: menuId,
                        }}
                        onSelect={(item, e) => {
                            handleButtonClick(e, item.data as IMenuButtonItem);
                        }}
                        onClose={() => setMenuButtonOpen(false)}
                    />
                </UiFocusManager>
            </Overlay>
        );
    };

    const moreButtonDescId = useId();

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{content.text}</MarkdownComponent>
            {visualization ? (
                <div
                    className={cx(
                        "gd-gen-ai-chat__visualization",
                        `gd-gen-ai-chat__visualization--${visualization.visualizationType.toLowerCase()}`,
                        {
                            active: isMenuButtonOpen,
                        },
                    )}
                >
                    {config.canAnalyze && !hasVisError
                        ? (() => {
                              return (
                                  <div className={cx("gd-gen-ai-chat__visualization__buttons")}>
                                      {visualization.visualizationType === "TABLE" ? null : (
                                          <div className={cx("gd-gen-ai-chat__visualization__table")}>
                                              <UiTooltip
                                                  triggerBy={["focus", "hover"]}
                                                  arrowPlacement="bottom"
                                                  anchor={
                                                      <UiIconButton
                                                          dataTestId="gen-ai-visualization-toggle-button"
                                                          onClick={() => {
                                                              setIsTable(!isTable);
                                                          }}
                                                          icon={isTable ? "visualization" : "table"}
                                                          accessibilityConfig={{
                                                              role: "button",
                                                              ariaLabel: isTable
                                                                  ? toggleButtonOriginalTooltipText
                                                                  : toggleButtonTableTooltipText,
                                                          }}
                                                      />
                                                  }
                                                  content={
                                                      isTable
                                                          ? toggleButtonOriginalTooltipText
                                                          : toggleButtonTableTooltipText
                                                  }
                                              />
                                          </div>
                                      )}
                                      <div
                                          id={MORE_MENU_BUTTON_ID}
                                          className={cx(
                                              "gd-gen-ai-chat__visualization__save",
                                              dropdownAnchorClassName,
                                          )}
                                      >
                                          <UiTooltip
                                              disabled={!moreButtonTooltipText}
                                              triggerBy={["focus", "hover"]}
                                              arrowPlacement="bottom"
                                              anchor={
                                                  <UiIconButton
                                                      dataTestId="gen-ai-visualization-menu-button"
                                                      onClick={() => setMenuButtonOpen(!isMenuButtonOpen)}
                                                      icon="ellipsis"
                                                      isDisabled={visLoading}
                                                      accessibilityConfig={{
                                                          role: "button",
                                                          ariaLabel: moreButtonTooltipText,
                                                          ariaDescribedBy: moreButtonDescId,
                                                          isExpanded: isMenuButtonOpen,
                                                          popupId: menuId,
                                                          ariaHaspopup: "menu",
                                                      }}
                                                      isActive={isMenuButtonOpen}
                                                  />
                                              }
                                              content={moreButtonTooltipText}
                                          />
                                          {isMenuButtonOpen ? renderMenuItems() : null}
                                      </div>
                                  </div>
                              );
                          })()
                        : null}
                    <div className="gd-gen-ai-chat__visualization__title" id={moreButtonDescId}>
                        <MarkdownComponent allowMarkdown={useMarkdown}>
                            {visualization.title}
                        </MarkdownComponent>
                    </div>
                    <div
                        className={cx(
                            "gd-gen-ai-chat__visualization__wrapper",
                            `gd-gen-ai-chat__visualization__wrapper--${isTable ? "table" : visualization.visualizationType.toLowerCase()}`,
                        )}
                    >
                        <VisualizationErrorBoundary>
                            {(() => {
                                if (isTable) {
                                    return renderTable(
                                        intl.locale,
                                        metrics,
                                        dimensions,
                                        filters,
                                        sorts,
                                        enableNewPivotTable,
                                        handleSdkError,
                                        handleLoadingChanged,
                                        handleSuccess,
                                    );
                                }

                                switch (visualization.visualizationType) {
                                    case "BAR":
                                        return renderBarChart(
                                            intl.locale,
                                            metrics,
                                            dimensions,
                                            filters,
                                            sorts,
                                            colorPalette,
                                            handleSdkError,
                                            handleLoadingChanged,
                                            handleSuccess,
                                        );
                                    case "COLUMN":
                                        return renderColumnChart(
                                            intl.locale,
                                            metrics,
                                            dimensions,
                                            filters,
                                            sorts,
                                            colorPalette,
                                            handleSdkError,
                                            handleLoadingChanged,
                                            handleSuccess,
                                        );
                                    case "LINE":
                                        return renderLineChart(
                                            intl.locale,
                                            metrics,
                                            dimensions,
                                            filters,
                                            sorts,
                                            colorPalette,
                                            handleSdkError,
                                            handleLoadingChanged,
                                            handleSuccess,
                                        );
                                    case "PIE":
                                        return renderPieChart(
                                            intl.locale,
                                            metrics,
                                            dimensions,
                                            filters,
                                            sorts,
                                            colorPalette,
                                            handleSdkError,
                                            handleLoadingChanged,
                                            handleSuccess,
                                        );
                                    case "TABLE":
                                        return renderTable(
                                            intl.locale,
                                            metrics,
                                            dimensions,
                                            filters,
                                            sorts,
                                            enableNewPivotTable,
                                            handleSdkError,
                                            handleLoadingChanged,
                                            handleSuccess,
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
                                            handleSuccess,
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
                        <UiButton
                            key={suggestion.label}
                            label={suggestion.label}
                            variant="secondary"
                            onClick={() => {
                                dispatch(
                                    newMessageAction(
                                        makeUserMessage([makeTextContents(suggestion.query, [])]),
                                    ),
                                );
                            }}
                            tooltip={suggestion.query}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

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
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
) => (
    <BarChart
        locale={locale}
        height={VIS_HEIGHT}
        measures={metrics}
        viewBy={[dimensions[0], dimensions[1]].filter(Boolean)}
        stackBy={metrics.length <= 1 ? dimensions[2] : undefined}
        sortBy={sortBy}
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
        onExportReady={onSuccess}
    />
);

const renderColumnChart = (
    locale: string,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
) => (
    <ColumnChart
        locale={locale}
        height={VIS_HEIGHT}
        measures={metrics}
        viewBy={[dimensions[0], dimensions[1]].filter(Boolean)}
        stackBy={metrics.length <= 1 ? dimensions[2] : undefined}
        sortBy={sortBy}
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
        onExportReady={onSuccess}
    />
);

const renderLineChart = (
    locale: string,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
) => (
    <LineChart
        locale={locale}
        height={VIS_HEIGHT}
        measures={metrics}
        trendBy={dimensions[0]}
        segmentBy={metrics.length <= 1 ? dimensions[1] : undefined}
        filters={filters}
        sortBy={sortBy}
        config={{
            ...visualizationTooltipOptions,
            ...legendTooltipOptions,
            colorPalette,
        }}
        onError={onError}
        onLoadingChanged={onLoadingChanged}
        onExportReady={onSuccess}
    />
);

const renderPieChart = (
    locale: string,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
) => (
    <PieChart
        locale={locale}
        height={VIS_HEIGHT}
        measures={metrics}
        viewBy={metrics.length <= 1 ? dimensions[0] : undefined}
        filters={filters}
        sortBy={sortBy}
        config={{
            ...visualizationTooltipOptions,
            colorPalette,
        }}
        onError={onError}
        onLoadingChanged={onLoadingChanged}
        onExportReady={onSuccess}
    />
);

const renderTable = (
    locale: string,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    sortBy: ISortItem[],
    enableNewPivotTable: boolean,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
) => {
    const TableComponent = enableNewPivotTable ? PivotTableNext : PivotTable;
    return (
        <TableComponent
            locale={locale}
            measures={metrics}
            rows={dimensions}
            filters={filters}
            sortBy={sortBy}
            onError={onError}
            onLoadingChanged={onLoadingChanged}
            onExportReady={onSuccess}
        />
    );
};

const renderHeadline = (
    locale: string,
    metrics: IMeasure[],
    _dimensions: IAttribute[],
    filters: IFilter[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
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
        onExportReady={onSuccess}
    />
);

const mapDispatchToProps = {
    onCopyToClipboard: copyToClipboardAction,
};

const mapStateToProps = (
    state: RootState,
): Pick<VisualizationContentsProps, "colorPalette" | "enableNewPivotTable"> => {
    const settings = settingsSelector(state);
    return {
        colorPalette: colorPaletteSelector(state),
        enableNewPivotTable: settings?.enableNewPivotTable,
    };
};

export const VisualizationContentsComponent: any = connect(
    mapStateToProps,
    mapDispatchToProps,
)(VisualizationContentsComponentCore);

// (C) 2024-2026 GoodData Corporation

import {
    type AriaAttributes,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";

import cx from "classnames";
import copy from "copy-to-clipboard";
import { useIntl } from "react-intl";
import { connect, useDispatch } from "react-redux";

import {
    type IAttribute,
    type IColorPalette,
    type IDashboardAttributeFilter,
    type IDrillOrigin,
    type IFilter,
    type IGenAIVisualization,
    type IKeyDriveAnalysis,
    type IMeasure,
    type ISortItem,
    type ITheme,
    isMeasureDescriptor,
} from "@gooddata/sdk-model";
import {
    type ExplicitDrill,
    type GoodDataSdkError,
    type IDrillEvent,
    type IHeaderPredicate,
    type OnError,
    type OnExportReady,
    type OnFiredDrillEvent,
    type OnLoadingChanged,
    isNoDataSdkError,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { BarChart, ColumnChart, Headline, LineChart, PieChart } from "@gooddata/sdk-ui-charts";
import {
    type DashboardKeyDriverCombinationItem,
    getKdaKeyDriverCombinations,
} from "@gooddata/sdk-ui-dashboard";
import {
    Dropdown,
    type IAlignPoint,
    IconCopy,
    IconExternalLink,
    IconSave,
    Overlay,
    UiButton,
    UiFocusManager,
    UiIconButton,
    UiMenu,
    UiTooltip,
    useId,
} from "@gooddata/sdk-ui-kit";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { PivotTableNext, useAgGridToken } from "@gooddata/sdk-ui-pivot/next";
import { ScopedThemeProvider, useTheme } from "@gooddata/sdk-ui-theme-provider";

import { MarkdownComponent } from "./Markdown.js";
import { useExecution } from "./useExecution.js";
import { VisualizationErrorBoundary } from "./VisualizationErrorBoundary.js";
import { VisualizationSaveDialog } from "./VisualizationSaveDialog.js";
import { type VisualizationContents, makeTextContents, makeUserMessage } from "../../../model.js";
import {
    type RootState,
    colorPaletteSelector,
    copyToClipboardAction,
    newMessageAction,
    saveVisualisationRenderStatusAction,
    setKeyDriverAnalysisAction,
    settingsSelector,
    visualizationErrorAction,
} from "../../../store/index.js";
import { getAbsoluteVisualizationHref, getHeadlineComparison, getVisualizationHref } from "../../../utils.js";
import { useConfig } from "../../ConfigContext.js";
import { DrillSelectDropdownMenu } from "./drill/DrillSelectDropdownMenu.js";
import { createKdaDefinitionFromDrill, getDashboardAttributeFilter } from "../../hooks/useKdaDefinition.js";
import { convertIntersectionToAttributeFilters, mergeFilters } from "../../utils/intersectionUtils.js";

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
    enableChangeAnalysis?: boolean;
    enableAccessibleChartTooltip?: boolean;
    agGridToken?: string;
    onCopyToClipboard?: (data: { content: string }) => void;
    setKeyDriverAnalysis?: typeof setKeyDriverAnalysisAction;
};

function VisualizationContentsComponentCore({
    content,
    messageId,
    useMarkdown,
    colorPalette,
    enableNewPivotTable = true,
    enableAccessibleChartTooltip = false,
    enableChangeAnalysis = false,
    agGridToken,
    showSuggestions = false,
    onCopyToClipboard,
    setKeyDriverAnalysis,
}: VisualizationContentsProps) {
    const dispatch = useDispatch();
    // Resolve agGridToken from context if provided via AgGridTokenProvider, otherwise use prop from Redux
    const resolvedAgGridToken = useAgGridToken(agGridToken);
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
    const theme = useTheme();
    const kpiTheme = useMemo(
        () => ({
            ...theme,
            kpi: {
                ...theme?.kpi,
                primaryMeasureColor:
                    theme?.dashboards?.content?.widget?.title?.color ?? theme?.palette?.complementary?.c8,
                secondaryInfoColor:
                    theme?.dashboards?.content?.widget?.title?.color ?? theme?.palette?.complementary?.c8,
            },
        }),
        [theme],
    );
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
                          icon: <IconSave width={16} height={16} ariaHidden color="currentColor" />,
                          ariaAttributes: {
                              "aria-haspopup": "dialog",
                          },
                      },
                      {
                          id: "button-open",
                          title: intl.formatMessage({
                              id: "gd.gen-ai.visualisation.menu.button.open_in_analyze",
                          }),
                          icon: <IconExternalLink width={16} height={16} ariaHidden color="currentColor" />,
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
                          icon: <IconCopy width={16} height={16} ariaHidden color="currentColor" />,
                      },
                  ] as IMenuButtonItem[])
                : ([
                      {
                          id: "button-save",
                          title: intl.formatMessage({
                              id: "gd.gen-ai.visualisation.menu.button.save_as_visualisation",
                          }),
                          icon: <IconSave width={16} height={16} ariaHidden color="currentColor" />,
                          ariaAttributes: {
                              "aria-haspopup": "dialog",
                          },
                      },
                      {
                          id: "button-open",
                          title: intl.formatMessage({
                              id: "gd.gen-ai.visualisation.menu.button.open_in_analyze",
                          }),
                          icon: <IconExternalLink width={16} height={16} ariaHidden color="currentColor" />,
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

    const visualizationContainerRef = useRef<HTMLDivElement>(null);
    const [drillState, setDrillState] = useState<{
        keyDriverData: DashboardKeyDriverCombinationItem[];
        event: IDrillEvent;
    } | null>(null);
    const handlerDrill = useCallback((event: IDrillEvent) => {
        const keyDriverData = getKdaKeyDriverCombinations(
            {
                type: "keyDriveAnalysis",
                transition: "in-place",
                origin: {} as IDrillOrigin,
            } as IKeyDriveAnalysis,
            event,
        );
        if (keyDriverData.length === 0) {
            setDrillState(null);
        } else {
            setDrillState({ keyDriverData, event });
        }
    }, []);

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

    const drillableItems = useMemo(() => {
        if (visualization && enableChangeAnalysis) {
            if (visualization.visualizationType === "TABLE") {
                return metrics.filter(Boolean).map(headerPredicate);
            }
            return [dimensions[0], dimensions[1]].filter(Boolean).map((x) => x.attribute.displayForm);
        }
        return undefined;
    }, [dimensions, enableChangeAnalysis, metrics, visualization]);

    return (
        <div className={className}>
            <MarkdownComponent allowMarkdown={useMarkdown}>{content.text}</MarkdownComponent>
            {visualization ? (
                <Dropdown
                    isOpen={Boolean(drillState)}
                    onToggle={(state) => {
                        if (!state) {
                            setDrillState(null);
                        }
                    }}
                    closeOnEscape
                    closeOnParentScroll
                    alignPoints={[
                        {
                            align: "tl tl",
                            offset: calculateOffset(visualizationContainerRef.current, drillState?.event),
                        },
                        {
                            align: "tl tr",
                            offset: calculateOffset(visualizationContainerRef.current, drillState?.event),
                        },
                    ]}
                    renderBody={() => {
                        return (
                            <DrillSelectDropdownMenu
                                drillState={drillState}
                                onSelect={(item) => {
                                    const data = item.data.context as DashboardKeyDriverCombinationItem;
                                    const event = drillState?.event;

                                    if (!event) {
                                        return;
                                    }

                                    const allFilters = mergeFilters(
                                        convertIntersectionToAttributeFilters(
                                            event.drillContext.intersection ?? [],
                                        ),
                                        filters
                                            .map(getDashboardAttributeFilter)
                                            .filter(Boolean) as IDashboardAttributeFilter[],
                                    );

                                    const definition = createKdaDefinitionFromDrill(
                                        intl.locale,
                                        data,
                                        event,
                                        allFilters,
                                    );
                                    setKeyDriverAnalysis?.({ keyDriverAnalysis: definition });
                                }}
                                onClose={() => {
                                    setDrillState(null);
                                }}
                            />
                        );
                    }}
                    renderButton={() => {
                        return (
                            <div
                                ref={visualizationContainerRef}
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
                                                      <div
                                                          className={cx(
                                                              "gd-gen-ai-chat__visualization__table",
                                                          )}
                                                      >
                                                          <UiTooltip
                                                              triggerBy={["focus", "hover"]}
                                                              arrowPlacement="bottom"
                                                              anchor={
                                                                  <UiIconButton
                                                                      dataTestId="gen-ai-visualization-toggle-button"
                                                                      onClick={() => {
                                                                          setIsTable(!isTable);
                                                                      }}
                                                                      icon={
                                                                          isTable ? "visualization" : "table"
                                                                      }
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
                                                                  onClick={() =>
                                                                      setMenuButtonOpen(!isMenuButtonOpen)
                                                                  }
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
                                                    handleSdkError,
                                                    handleLoadingChanged,
                                                    handleSuccess,
                                                    handlerDrill,
                                                    {
                                                        drillableItems,
                                                        enableChangeAnalysis,
                                                        enableNewPivotTable,
                                                        enableAccessibleChartTooltip,
                                                        agGridToken: resolvedAgGridToken,
                                                    },
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
                                                        handlerDrill,
                                                        {
                                                            enableChangeAnalysis,
                                                            enableAccessibleChartTooltip,
                                                        },
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
                                                        handlerDrill,
                                                        {
                                                            drillableItems,
                                                            enableChangeAnalysis,
                                                            enableAccessibleChartTooltip,
                                                        },
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
                                                        handlerDrill,
                                                        {
                                                            drillableItems,
                                                            enableChangeAnalysis,
                                                            enableAccessibleChartTooltip,
                                                        },
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
                                                        handlerDrill,
                                                        {
                                                            drillableItems,
                                                            enableChangeAnalysis,
                                                            enableAccessibleChartTooltip,
                                                        },
                                                    );
                                                case "TABLE":
                                                    return renderTable(
                                                        intl.locale,
                                                        metrics,
                                                        dimensions,
                                                        filters,
                                                        sorts,
                                                        handleSdkError,
                                                        handleLoadingChanged,
                                                        handleSuccess,
                                                        handlerDrill,
                                                        {
                                                            drillableItems,
                                                            enableChangeAnalysis,
                                                            enableNewPivotTable,
                                                            enableAccessibleChartTooltip,
                                                            agGridToken: resolvedAgGridToken,
                                                        },
                                                    );
                                                case "HEADLINE":
                                                    return renderHeadline(
                                                        intl.locale,
                                                        kpiTheme,
                                                        metrics,
                                                        dimensions,
                                                        filters,
                                                        colorPalette,
                                                        handleSdkError,
                                                        handleLoadingChanged,
                                                        handleSuccess,
                                                        handlerDrill,
                                                        {
                                                            drillableItems,
                                                            enableChangeAnalysis,
                                                        },
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
                                {drillState ? (
                                    <div className="gd-gen-ai-chat__visualization__drill_overlay" />
                                ) : null}
                            </div>
                        );
                    }}
                />
            ) : null}
            {showSuggestions && visualization?.suggestions?.length ? (
                <div className="gd-gen-ai-chat__visualization__suggestions">
                    {visualization.suggestions.map((suggestion) => (
                        <UiButton
                            key={suggestion.label}
                            label={suggestion.label}
                            variant="secondary"
                            size="small"
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
    throw new Error("Unknown visualization type:", value);
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
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableChangeAnalysis?: boolean;
    },
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
            enableAccessibleTooltip: props.enableAccessibleChartTooltip,
        }}
        drillableItems={props.drillableItems}
        onDrill={onDrill}
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
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableChangeAnalysis?: boolean;
    },
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
            enableAccessibleTooltip: props.enableAccessibleChartTooltip,
        }}
        drillableItems={props.drillableItems}
        onDrill={onDrill}
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
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableChangeAnalysis?: boolean;
    },
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
            enableAccessibleTooltip: props.enableAccessibleChartTooltip,
        }}
        drillableItems={props.drillableItems}
        onDrill={onDrill}
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
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableChangeAnalysis?: boolean;
    },
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
            enableAccessibleTooltip: props.enableAccessibleChartTooltip,
        }}
        drillableItems={props.drillableItems}
        onDrill={onDrill}
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
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableNewPivotTable?: boolean;
        enableChangeAnalysis?: boolean;
        agGridToken?: string;
    },
) => {
    const TableComponent = props.enableNewPivotTable ? PivotTableNext : PivotTable;
    return (
        <TableComponent
            locale={locale}
            measures={metrics}
            rows={dimensions}
            filters={filters}
            sortBy={sortBy}
            config={props.enableNewPivotTable ? { agGridToken: props.agGridToken } : undefined}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onLoadingChanged={onLoadingChanged}
            onExportReady={onSuccess}
        />
    );
};

const renderHeadline = (
    locale: string,
    theme: ITheme | undefined,
    metrics: IMeasure[],
    _dimensions: IAttribute[],
    filters: IFilter[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableChangeAnalysis?: boolean;
    },
) => {
    return (
        <ScopedThemeProvider theme={theme}>
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
                drillableItems={props.drillableItems}
                onDrill={onDrill}
                onError={onError}
                onLoadingChanged={onLoadingChanged}
                onExportReady={onSuccess}
            />
        </ScopedThemeProvider>
    );
};

function calculateOffset(container?: HTMLDivElement | null, drillEvent?: IDrillEvent) {
    const offest = getRelativeOffset(drillEvent?.target, container);

    return {
        y: offest.y + (drillEvent?.chartY ?? 0),
        x: offest.x + (drillEvent?.chartX ?? 0),
    };
}

function getRelativeOffset(child?: HTMLElement, ancestor?: HTMLDivElement | null) {
    if (!child || !ancestor) {
        return { x: 0, y: 0 };
    }

    const c = child.getBoundingClientRect();
    const a = ancestor.getBoundingClientRect();
    return {
        x: c.left - a.left,
        y: c.top - a.top,
    };
}

function headerPredicate(m: IMeasure): IHeaderPredicate {
    return (header) => {
        if (isMeasureDescriptor(header)) {
            return header.measureHeaderItem.localIdentifier === m.measure.localIdentifier;
        }
        return false;
    };
}

const mapDispatchToProps = {
    onCopyToClipboard: copyToClipboardAction,
    setKeyDriverAnalysis: setKeyDriverAnalysisAction,
};

const mapStateToProps = (
    state: RootState,
): Pick<
    VisualizationContentsProps,
    | "colorPalette"
    | "enableNewPivotTable"
    | "enableAccessibleChartTooltip"
    | "enableChangeAnalysis"
    | "agGridToken"
> => {
    const settings = settingsSelector(state);
    return {
        colorPalette: colorPaletteSelector(state),
        enableNewPivotTable: settings?.enableNewPivotTable,
        enableAccessibleChartTooltip: settings?.enableAccessibleChartTooltip,
        enableChangeAnalysis: settings?.enableChangeAnalysis,
        agGridToken: settings?.agGridToken,
    };
};

export const VisualizationContentsComponent = connect(
    mapStateToProps,
    mapDispatchToProps,
)(VisualizationContentsComponentCore);

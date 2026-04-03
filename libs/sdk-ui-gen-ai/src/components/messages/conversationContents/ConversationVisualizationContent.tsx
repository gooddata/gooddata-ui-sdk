// (C) 2024-2026 GoodData Corporation

import {
    type AriaAttributes,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    type RefObject,
    useCallback,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";

import cx from "classnames";
import copy from "copy-to-clipboard";
import { useIntl } from "react-intl";
import { connect, useDispatch } from "react-redux";

import { type IChatConversationVisualisationContent, type IChatSuggestion } from "@gooddata/sdk-backend-spi";
import { type IColorPalette, type IDashboardAttributeFilter, type IFilter } from "@gooddata/sdk-model";
import { type IDrillEvent, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { type IDashboardKeyDriverCombinationItem } from "@gooddata/sdk-ui-dashboard";
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
} from "@gooddata/sdk-ui-kit";

import {
    ConversationVisualisation,
    type ConversationVisualisationProps,
} from "./ConversationVisualisation.js";
import { SaveVisualizationDialog } from "./SaveVisualizationDialog.js";
import { createKdaDefinitionFromDrill, getDashboardAttributeFilter } from "./useKdaDefinition.js";
import { useSaveCheck } from "./useSaveCheck.js";
import {
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
    makeUserItem,
} from "../../../model.js";
import { colorPaletteSelector, settingsSelector } from "../../../store/chatWindow/chatWindowSelectors.js";
import {
    copyToClipboardAction,
    type setKeyDriverAnalysisAction,
} from "../../../store/chatWindow/chatWindowSlice.js";
import { newMessageAction } from "../../../store/messages/messagesSlice.js";
import { type RootState } from "../../../store/types.js";
import { getAbsoluteVisualizationHref, getVisualizationHref } from "../../../utils.js";
import { useConfig } from "../../ConfigContext.js";
import { convertIntersectionToAttributeFilters, mergeFilters } from "../../utils/intersectionUtils.js";
import { VisualizationErrorBoundary } from "../components/VisualizationErrorBoundary.js";
import { DrillSelectDropdownMenu } from "../contents/drill/DrillSelectDropdownMenu.js";
import { MarkdownComponent } from "../contents/Markdown.js";

const MORE_MENU_BUTTON_ID = "gd-gen-ai-chat__visualization__save__more-menu-button";
const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

//TODO: What if is not supported now

interface IMenuButtonItem {
    id: string;
    title: string;
    icon: ReactNode;
    ariaAttributes: AriaAttributes;
}

export type ConversationVisualizationContentProps = {
    message: IChatConversationLocalItem;
    part: IChatConversationMultipartLocalPart;
    visualization: IChatConversationVisualisationContent["visualization"];
    showSuggestions?: boolean;
    colorPalette?: IColorPalette;
    className?: string;
    agGridToken?: string;
    useMarkdown?: boolean;
    onCopyToClipboard?: (data: { content: string }) => void;
    setKeyDriverAnalysis?: typeof setKeyDriverAnalysisAction;
    enableChangeAnalysis?: boolean;
    enableNewPivotTable?: boolean;
    enableAccessibleChartTooltip?: boolean;
};

function ConversationVisualizationContentCore({
    showSuggestions,
    message,
    part,
    visualization,
    className,
    useMarkdown,
    onCopyToClipboard,
    setKeyDriverAnalysis,
    colorPalette,
    agGridToken,
    enableChangeAnalysis,
    enableNewPivotTable,
    enableAccessibleChartTooltip,
}: ConversationVisualizationContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const [hasVisError, setVisError] = useState(false);
    const [isTable, setIsTable] = useState(false);
    const moreButtonDescId = useId();

    const { setDrillState, DrillOverlay, DrillChooser } = useDrillState({
        containerRef,
        filters: [],
        setKeyDriverAnalysis,
    });
    const { setSaveDialogOpen, SaveDialog } = useSaveDialog({
        message,
        part,
        visualization,
    });
    const { visualisationCheckLoading, visualisationSaved } = useSaveCheck(part, visualization);

    const { onCopy, onOpen, onSave } = useHandlers({ visualization, setSaveDialogOpen, onCopyToClipboard });

    const onVisualizationError = useCallback(() => {
        setVisError(true);
    }, []);

    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--visualization",
        className,
    );

    return (
        <div className={classNames}>
            <DrillChooser>
                <Wrapper containerRef={containerRef} visualization={visualization}>
                    <VisualisationMenu
                        visualization={visualization}
                        isVisualisationSaved={visualisationSaved}
                        isVisualisationCheckLoading={visualisationCheckLoading}
                        isTable={isTable}
                        onTable={setIsTable}
                        hasError={hasVisError}
                        moreButtonId={moreButtonDescId}
                        onSave={onSave}
                        onOpen={onOpen}
                        onCopy={onCopy}
                        isLoading={part.reporting ?? false}
                    />
                    <Title id={moreButtonDescId} visualization={visualization} useMarkdown={useMarkdown} />
                    <VisualisationWrapper
                        message={message}
                        colorPalette={colorPalette}
                        isTable={isTable}
                        visualization={visualization}
                        agGridToken={agGridToken}
                        enableChangeAnalysis={enableChangeAnalysis}
                        enableNewPivotTable={enableNewPivotTable}
                        enableAccessibleChartTooltip={enableAccessibleChartTooltip}
                        onDrillFired={setDrillState}
                        onVisualisationError={onVisualizationError}
                    />
                    <SaveDialog />
                    <DrillOverlay />
                </Wrapper>
            </DrillChooser>
            <Suggestions showSuggestions={showSuggestions} suggestions={[]} />
        </div>
    );
}

// Components

interface IWrapperProps {
    containerRef: RefObject<HTMLDivElement | null>;
    visualization: IChatConversationVisualisationContent["visualization"];
    children: ReactNode;
}

function Wrapper({ containerRef, visualization, children }: IWrapperProps) {
    return (
        <div
            ref={containerRef}
            data-testid="gen-ai-conversation-visualization"
            data-visualization-type={
                visualization?.insight.visualizationUrl.replace("local:", "").toLowerCase() ?? "unknown"
            }
            className={cx(
                "gd-gen-ai-chat__conversation__visualization",
                `gd-gen-ai-chat__conversation__visualization--${visualization?.insight.visualizationUrl.replace("local:", "").toLowerCase() ?? "unknown"}`,
            )}
        >
            {children}
        </div>
    );
}

interface ITitleProps {
    visualization: IChatConversationVisualisationContent["visualization"];
    id: string;
    useMarkdown?: boolean;
}

function Title({ id, visualization, useMarkdown }: ITitleProps) {
    return (
        <div className="gd-gen-ai-chat__conversation__visualization__title" id={id}>
            <MarkdownComponent allowMarkdown={useMarkdown}>
                {visualization?.insight.title ?? ""}
            </MarkdownComponent>
        </div>
    );
}

interface IVisualisationMenuProps {
    visualization: IChatConversationVisualisationContent["visualization"];
    hasError: boolean;
    //state
    isLoading: boolean;
    isVisualisationCheckLoading: boolean;
    isVisualisationSaved: boolean;
    //table
    isTable: boolean;
    onTable: (state: boolean) => void;
    //menu
    moreButtonId: string;
    //callbacks
    onSave: (e: MouseEvent | KeyboardEvent) => void;
    onOpen: (e: MouseEvent | KeyboardEvent, isSaved: boolean) => void;
    onCopy: (e: MouseEvent | KeyboardEvent) => void;
}

function VisualisationMenu({
    visualization,
    isVisualisationSaved,
    isVisualisationCheckLoading,
    hasError,
    isLoading,
    isTable,
    onTable,
    moreButtonId,
    onSave,
    onOpen,
    onCopy,
}: IVisualisationMenuProps) {
    const [isMenuButtonOpen, setMenuButtonOpen] = useState(false);

    const config = useConfig();
    const intl = useIntl();

    // generate unique IDs for accessibility and dropdown positioning
    const id = useId();
    const menuId = `menu-${id}`;
    const classes = `${MORE_MENU_BUTTON_ID}-${id}`;

    const moreLabel = intl.formatMessage({ id: "gd.gen-ai.visualisation.menu" });
    const toggleTableLabel = intl.formatMessage({ id: "gd.gen-ai.visualisation.toggle.table" });
    const toggleTableOrig = intl.formatMessage({ id: "gd.gen-ai.visualisation.toggle.original" });

    const menuItems = useMemo(
        () =>
            isVisualisationSaved
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
        [intl, isVisualisationSaved],
    );

    const handleButtonClick = useCallback(
        (e: MouseEvent | KeyboardEvent, item: IMenuButtonItem) => {
            switch (item.id) {
                case "button-save":
                    onSave(e);
                    setMenuButtonOpen(false);
                    break;
                case "button-open":
                    onOpen(e, isVisualisationSaved);
                    setMenuButtonOpen(false);
                    break;
                case "button-copy":
                    if (isVisualisationSaved) {
                        onCopy(e);
                    }
                    setMenuButtonOpen(false);
                    break;
                default:
                    // No action needed for other items
                    break;
            }
        },
        [onCopy, setMenuButtonOpen, onOpen, onSave, isVisualisationSaved],
    );

    const renderMenuItems = useCallback(() => {
        return (
            <Overlay
                closeOnMouseDrag
                closeOnOutsideClick
                alignTo={`.${classes}`}
                alignPoints={overlayAlignPoints}
                key="saveVisualisationMenuButton"
                onClose={() => setMenuButtonOpen(false)}
                className="gd-gen-ai-chat__conversation__visualization__menu_overlay"
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
    }, [classes, handleButtonClick, menuId, menuItems, setMenuButtonOpen]);

    if (!config.canAnalyze || hasError) {
        return null;
    }

    return (
        <div
            className={cx("gd-gen-ai-chat__conversation__visualization__buttons", {
                active: isMenuButtonOpen,
            })}
        >
            {visualization?.insight.visualizationUrl === "local:table" ? null : (
                <div className={cx("gd-gen-ai-chat__conversation__visualization__table")}>
                    <UiTooltip
                        triggerBy={["focus", "hover"]}
                        arrowPlacement="bottom"
                        anchor={
                            <UiIconButton
                                dataTestId="gen-ai-visualization-toggle-button"
                                onClick={() => {
                                    onTable(!isTable);
                                }}
                                icon={isTable ? "visualization" : "table"}
                                accessibilityConfig={{
                                    role: "button",
                                    ariaLabel: isTable ? toggleTableOrig : toggleTableLabel,
                                }}
                            />
                        }
                        content={isTable ? toggleTableOrig : toggleTableLabel}
                    />
                </div>
            )}
            <div
                id={MORE_MENU_BUTTON_ID}
                className={cx("gd-gen-ai-chat__conversation__visualization__save", classes)}
            >
                <UiTooltip
                    disabled={!moreLabel}
                    triggerBy={["focus", "hover"]}
                    arrowPlacement="bottom"
                    anchor={
                        <UiIconButton
                            dataTestId="gen-ai-visualization-menu-button"
                            onClick={() => setMenuButtonOpen(!isMenuButtonOpen)}
                            icon="ellipsis"
                            isDisabled={isLoading || isVisualisationCheckLoading}
                            accessibilityConfig={{
                                role: "button",
                                ariaLabel: moreLabel,
                                ariaDescribedBy: moreButtonId,
                                isExpanded: isMenuButtonOpen,
                                popupId: menuId,
                                ariaHaspopup: "menu",
                            }}
                            isActive={isMenuButtonOpen}
                        />
                    }
                    content={moreLabel}
                />
                {isMenuButtonOpen ? renderMenuItems() : null}
            </div>
        </div>
    );
}

function VisualisationWrapper(props: ConversationVisualisationProps) {
    return (
        <div
            className={cx(
                "gd-gen-ai-chat__conversation__visualization__wrapper",
                `gd-gen-ai-chat__conversation__visualization__wrapper--${props.isTable ? "table" : (props.visualization?.insight.visualizationUrl.replace("local:", "").toLowerCase() ?? "unknown")}`,
            )}
        >
            <VisualizationErrorBoundary>
                <ConversationVisualisation {...props} />
            </VisualizationErrorBoundary>
        </div>
    );
}

interface ISuggestionsProps {
    showSuggestions?: boolean;
    suggestions: IChatSuggestion[];
}

function Suggestions({ suggestions, showSuggestions }: ISuggestionsProps) {
    const dispatch = useDispatch();

    return (
        <>
            {showSuggestions && suggestions.length ? (
                <div className="gd-gen-ai-chat__conversation__visualization__suggestions">
                    {suggestions.map((suggestion) => (
                        <UiButton
                            key={suggestion.label}
                            label={suggestion.label}
                            variant="secondary"
                            size="small"
                            onClick={() => {
                                dispatch(
                                    newMessageAction(makeUserItem({ type: "text", text: suggestion.query })),
                                );
                            }}
                            tooltip={suggestion.query}
                        />
                    ))}
                </div>
            ) : null}
        </>
    );
}

//hooks

interface IUseDrillStateProps {
    containerRef: RefObject<HTMLDivElement | null>;
    filters: IFilter[];
    setKeyDriverAnalysis?: typeof setKeyDriverAnalysisAction;
}

function useDrillState({ containerRef, filters, setKeyDriverAnalysis }: IUseDrillStateProps) {
    const intl = useIntl();
    const [drillState, setDrillState] = useState<{
        keyDriverData: IDashboardKeyDriverCombinationItem[];
        event: IDrillEvent;
    } | null>(null);

    const DrillChooser = useCallback(
        ({ children }: { children: ReactNode }) => {
            return (
                <Dropdown
                    enableAutoToggle={false}
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
                            offset: calculateOffset(containerRef.current, drillState?.event),
                        },
                        {
                            align: "tl tr",
                            offset: calculateOffset(containerRef.current, drillState?.event),
                        },
                    ]}
                    renderBody={() => {
                        return (
                            <DrillSelectDropdownMenu
                                drillState={drillState}
                                onSelect={(item) => {
                                    const data = item.data.context as IDashboardKeyDriverCombinationItem;
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
                    renderButton={() => <>{children}</>}
                />
            );
        },
        [containerRef, drillState, filters, intl.locale, setKeyDriverAnalysis],
    );

    const DrillOverlay = useCallback(
        () => (
            <>
                {drillState ? (
                    <div className="gd-gen-ai-chat__conversation__visualization__drill_overlay" />
                ) : null}
            </>
        ),
        [drillState],
    );

    return {
        DrillOverlay,
        DrillChooser,
        setDrillState,
        drillState,
    };
}

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

interface IUseSaveDialogProps {
    message: IChatConversationLocalItem;
    part: IChatConversationMultipartLocalPart;
    visualization: IChatConversationVisualisationContent["visualization"];
}

function useSaveDialog({ message, part, visualization }: IUseSaveDialogProps) {
    const [saveDialogOpen, setSaveDialogOpen] = useState<"save" | "explore" | null>(null);

    const SaveDialog = useCallback(() => {
        return (
            <>
                {saveDialogOpen ? (
                    <SaveVisualizationDialog
                        message={message}
                        part={part}
                        type={saveDialogOpen}
                        visualization={visualization}
                        onClose={() => setSaveDialogOpen(null)}
                    />
                ) : null}
            </>
        );
    }, [message, saveDialogOpen, part, visualization]);

    return {
        SaveDialog,
        saveDialogOpen,
        setSaveDialogOpen,
    };
}

interface IUseHandlersProps {
    visualization: IChatConversationVisualisationContent["visualization"];
    setSaveDialogOpen: (value: "save" | "explore" | null) => void;
    onCopyToClipboard?: (data: { content: string }) => void;
}

function useHandlers({ visualization, setSaveDialogOpen, onCopyToClipboard }: IUseHandlersProps) {
    const config = useConfig();
    const workspaceId = useWorkspaceStrict();

    const onSave = useCallback(() => {
        setSaveDialogOpen("save");
    }, [setSaveDialogOpen]);

    const onOpen = useCallback(
        (e: MouseEvent | KeyboardEvent, isSaved: boolean) => {
            if (!visualization) {
                return;
            }

            if (isSaved) {
                if (config.allowNativeLinks) {
                    window.location.href = getVisualizationHref(
                        workspaceId,
                        visualization.insight.identifier,
                    );
                } else {
                    config.linkHandler?.({
                        id: visualization.insight.identifier,
                        type: "visualization",
                        workspaceId,
                        newTab: e.metaKey,
                        preventDefault: e.preventDefault.bind(e),
                        itemUrl: getVisualizationHref(workspaceId, visualization.insight.identifier),
                    });
                    e.stopPropagation();
                }
            } else {
                setSaveDialogOpen("explore");
            }
        },
        [config, setSaveDialogOpen, visualization, workspaceId],
    );

    const onCopy = useCallback(() => {
        if (!visualization) {
            return;
        }
        const link = getAbsoluteVisualizationHref(workspaceId, visualization.insight.identifier);
        copy(link);
        onCopyToClipboard?.({ content: link });
    }, [onCopyToClipboard, visualization, workspaceId]);

    return {
        onSave,
        onOpen,
        onCopy,
    };
}

//CORE

const mapDispatchToProps = {
    onCopyToClipboard: copyToClipboardAction,
};

const mapStateToProps = (
    state: RootState,
): Pick<
    ConversationVisualizationContentProps,
    | "colorPalette"
    | "agGridToken"
    | "enableNewPivotTable"
    | "enableAccessibleChartTooltip"
    | "enableChangeAnalysis"
> => {
    const settings = settingsSelector(state);
    return {
        colorPalette: colorPaletteSelector(state),
        agGridToken: settings?.agGridToken,
        enableNewPivotTable: settings?.enableNewPivotTable,
        enableAccessibleChartTooltip: settings?.enableAccessibleChartTooltip,
        enableChangeAnalysis: settings?.enableChangeAnalysis,
    };
};

export const ConversationVisualizationContent = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ConversationVisualizationContentCore);

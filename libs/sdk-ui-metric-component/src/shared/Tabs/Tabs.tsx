// (C) 2022-2026 GoodData Corporation

import {
    type ComponentClass,
    type FunctionComponent,
    type KeyboardEvent,
    type MouseEvent,
    type ReactElement,
    type RefObject,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    IconClose,
    IconContract,
    IconExpand,
    IconMinimize,
} from "@gooddata/sdk-ui-kit";

import { handOffFocusDuring, useFocusHandoff } from "../focusHandoff.js";
import { makeStyles } from "../theme/index.js";

import { useChangeScroll } from "./hooks/useChangeScroll.js";
import { useScrollByButtons } from "./hooks/useScrollByButtons.js";
import { useScrollToActive } from "./hooks/useScrollToActive.js";
import { useTabCallbacks } from "./hooks/useTabCallbacks.js";
import { useTabsCallbacks } from "./hooks/useTabsCallbacks.js";
import { type ITabsLabels, useTabsLabels } from "./hooks/useTabsLabels.js";
import { NameButton, Tab, TabActive, TabRoot, TitleText } from "./Tab.js";
import { TabsClasses } from "./Tabs.classes.js";
import { type ITabContentProps, type ITabsProps, TabMaxWidth, TabsIconSize } from "./Tabs.data.js";

export const ButtonDivider = "divider";

const useStyles = makeStyles()((theme) => {
    const buttonSize = TabsIconSize + theme.tabs.sizes.buttonMargin * 2;

    const button = {
        cursor: "pointer",
        minWidth: theme.tabs.sizes.arrowButtonWidth,
        width: theme.tabs.sizes.arrowButtonWidth,
        background: "transparent",
        border: "none",
        borderBottom: `1px solid ${theme.tabs.colors.border}`,
        display: "flex",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.25s ease-in-out",
        color: theme.tabs.colors.arrow,

        "&:hover": {
            color: theme.tabs.colors.hover,
        },
    };

    return {
        root: {
            display: "block",
        },
        tabs: {
            padding: `${theme.tabs.sizes.tabsPadding}px 0 0 0`,
            display: "flex",
            overflow: "hidden",

            [`button.${NameButton}`]: {
                display: "none",
            },

            [`.${TabActive}`]: {
                [`button.${NameButton}`]: {
                    display: "block",
                },
                [`div.${TitleText}`]: {
                    width: `calc(100% - ${
                        theme.tabs.sizes.buttonMargin + theme.tabs.sizes.controlsDividerMargin
                    }px)`,
                },
            },

            "&:hover": {
                [`button.${NameButton}`]: {
                    display: "block",
                },
                [`div.${TitleText}`]: {
                    width: `calc(100% - ${
                        theme.tabs.sizes.buttonMargin + theme.tabs.sizes.controlsDividerMargin
                    }px)`,
                },
            },
        },
        //list
        tabsList: {
            display: "flex",
            flexGrow: 0,
            overflow: "hidden",
            maxWidth: "100%",
            position: "relative",

            "&.minimizable": {
                maxWidth: `calc(100% - ${buttonSize}px)`,
            },
            "&.closeable": {
                maxWidth: `calc(100% - ${buttonSize}px)`,
            },
            "&.minimizable.closeable": {
                maxWidth: `calc(100% - ${buttonSize * 2 + theme.tabs.sizes.controlsDividerWidth}px)`,
            },
            "&.scrollable > div:last-child": {
                width: `${theme.tabs.sizes.tabLastDivider}px`,

                "&:after": {
                    display: "none",
                },
            },
        },
        //filler
        filler: {
            borderBottom: `1px solid ${theme.tabs.colors.border}`,
            flexShrink: 1,
            flexGrow: 1,
        },
        //arrows
        leftButton: {
            ...button,
            borderRight: `1px solid ${theme.tabs.colors.border}`,
        },
        rightButton: {
            ...button,
            borderLeft: `1px solid ${theme.tabs.colors.border}`,
        },
        disabled: {
            cursor: "default",

            span: {
                color: `${theme.tabs.colors.disabled} !important`,
            },
        },
        //create button
        create: {
            // `&&` doubles specificity (.x.x → 0,2,0) so these beat kit's single-class (0,1,0)
            // `.gd-button-action` background/border/box-shadow, which get re-injected into the shared
            // <head> on host preload and would otherwise win the tie by order and restore the button look.
            "&&": {
                background: "transparent",
                border: "none",
                boxShadow: "none",
                fontSize: `${TabsIconSize}px`,

                ".gd-button-icon::before": {
                    color: theme.tabs.colors.create,
                },
                "&:hover, &:focus, &:active": {
                    background: "transparent",
                    border: "none",
                    boxShadow: "none",

                    ".gd-button-icon": {
                        marginTop: "0 !important",
                    },
                    ".gd-button-icon::before": {
                        color: theme.tabs.colors.hover,
                    },
                },
            },
        },
        //controls
        controls: {
            display: "flex",
            borderBottom: `1px solid ${theme.tabs.colors.border}`,
        },
        trigger: {
            display: "block",
            position: "relative",
            bottom: "-1px",
        },
        divider: {
            margin: `${theme.tabs.sizes.controlsDividerMargin}px 0`,
            width: theme.tabs.sizes.controlsDividerWidth,
            background: theme.tabs.colors.divider,
        },
        button: {
            padding: 0,
            border: "none",
            cursor: "pointer",
            background: "none",
            margin: `0 ${theme.tabs.sizes.buttonMargin}px`,

            "svg path": {
                transition: "all 0.25s ease-in-out",
                fill: theme.tabs.colors.normal,
            },
            "&:hover svg path": {
                fill: theme.tabs.colors.hover,
            },
        },
    };
});

export function Tabs({
    tabs,
    active,
    render,
    content,
    className,
    closeable = false,
    minimizable = false,
    maximizable = false,
    maximized = false,
    creatable = false,
    onTabCreate = () => {},
    onTabActivate = () => {},
    onTabClose = () => {},
    onTabsMinimize = () => {},
    onTabsMaximizable = () => {},
    onTabsClose = () => {},
    options = {},
    locales = {},
}: ITabsProps) {
    if (content && render) {
        throw new Error(`Only one property "render" or "content" can be set.`);
    }

    const { classes, cx } = useStyles();
    const { scrollToTabSpace = 3, scrollByArrowsRepeat = 150, scrollByArrowsStep = 100 } = options;
    const labels = useTabsLabels(locales);

    const [tabsElement, setTabsElement] = useState<HTMLDivElement | null>(null);
    const editorRoot = useRef<HTMLDivElement>(null);
    const { enabled, canLeft, canRight, onLeft, onRight, stepLeft, stepRight } = useScrollByButtons(
        tabsElement,
        scrollByArrowsRepeat,
        scrollByArrowsStep,
    );
    useChangeScroll(tabsElement);
    useScrollToActive(tabsElement, active, enabled, scrollToTabSpace);

    const { onTabsMinimizeHandler, onTabsCloseHandler, onTabCreateHandler, onTabsMaximizeHandler } =
        useTabsCallbacks(onTabCreate, onTabsMinimize, onTabsMaximizable, onTabsClose);
    const { onTabActiveHandler, onTabCloseHandler } = useTabCallbacks(
        tabs,
        onTabActivate,
        onTabClose,
        onTabsClose,
    );

    const onTabListKeyDown = useTabListKeyboard(tabsElement, tabs, active, onTabActiveHandler);

    const Content: ComponentClass<ITabContentProps> | FunctionComponent<ITabContentProps> | undefined =
        content;

    return (
        <div ref={editorRoot} className={cx(classes.root, className)}>
            <div className={cx(classes.tabs)}>
                {/* The mouse scrolls while the arrow is held; Enter and Space scroll one step. */}
                {enabled && (
                    <button
                        type="button"
                        aria-label={labels.scrollLeft}
                        aria-disabled={!canLeft}
                        className={cx(
                            classes.leftButton,
                            !canLeft && classes.disabled,
                            TabsClasses.ButtonLeft,
                        )}
                        onMouseDown={onLeft}
                        onClick={(event) => onScrollButtonClick(event, stepLeft)}
                    >
                        <span className="gd-icon-navigateleft" aria-hidden="true" />
                    </button>
                )}
                <div
                    role="tablist"
                    aria-label={labels.tabList}
                    onKeyDown={onTabListKeyDown}
                    className={cx(classes.tabsList, {
                        minimizable: minimizable,
                        closeable: closeable,
                        scrollable: enabled,
                    })}
                    style={{ width: TabMaxWidth * tabs.length }}
                    ref={setTabsElement}
                >
                    {tabs.map((tab, i) => (
                        <Tab
                            key={tab.id}
                            tab={tab}
                            placeholder={locales.titlePlaceholder}
                            active={active === i}
                            last={i === tabs.length - 1}
                            beforeActive={active - 1 === i}
                            afterActive={active + 1 === i}
                            closeLabel={labels.closeTab}
                            onActive={onTabActiveHandler}
                            onClose={onTabCloseHandler}
                        />
                    ))}
                </div>
                {enabled && (
                    <button
                        type="button"
                        aria-label={labels.scrollRight}
                        aria-disabled={!canRight}
                        className={cx(
                            classes.rightButton,
                            !canRight && classes.disabled,
                            TabsClasses.ButtonRight,
                        )}
                        onMouseDown={onRight}
                        onClick={(event) => onScrollButtonClick(event, stepRight)}
                    >
                        <span className="gd-icon-navigateright" aria-hidden="true" />
                    </button>
                )}
                {creatable && (
                    <BubbleHoverTrigger
                        showDelay={0}
                        hideDelay={100}
                        eventsOnBubble
                        className={classes.trigger}
                    >
                        <div className={cx(classes.controls)}>
                            <Button
                                iconLeft="gd-icon-add"
                                onClick={onTabCreateHandler}
                                className={cx(classes.create, "gd-button-action", TabsClasses.ButtonNewTab)}
                                // the same text as the hover tooltip, so the name matches what is seen
                                accessibilityConfig={{ ariaLabel: labels.create }}
                            />
                        </div>
                        {locales.createTooltip && (
                            <Bubble
                                className={cx("bubble-dark", "s-tabs-create-tooltip")}
                                alignPoints={[{ align: "bc tr", offset: { x: 0, y: -5 } }]}
                            >
                                {locales.createTooltip}
                            </Bubble>
                        )}
                    </BubbleHoverTrigger>
                )}
                <div className={cx(classes.filler)} />
                <div className={cx(classes.controls)}>
                    <TabsControls
                        maximized={maximized}
                        minimizable={minimizable}
                        maximizable={maximizable}
                        closeable={closeable}
                        // closing asks first only when a metric has unsaved changes
                        closeOpensDialog={tabs.some((tab) => tab.states?.dirty)}
                        labels={labels}
                        onTabsClose={onTabsCloseHandler}
                        onTabsMinimize={onTabsMinimizeHandler}
                        editorRoot={editorRoot}
                        onTabsMaximize={onTabsMaximizeHandler}
                    />
                </div>
            </div>
            {Content && tabs[active] && <Content tab={tabs[active]} />}
            {render && tabs[active] && render({ tab: tabs[active] })}
        </div>
    );
}

/**
 * A click with no pointer behind it (`detail` 0) comes from Enter, Space or assistive technology, and
 * scrolls one step. A mouse click (`detail` 1 and up) was already handled by its mousedown, which
 * keeps scrolling while the button is held, so it does not scroll a second time.
 */
function onScrollButtonClick(event: MouseEvent<HTMLButtonElement>, step: () => void) {
    if (event.detail === 0) {
        step();
    }
}

/**
 * The arrow keys, Home and End of the tab list, the way the ARIA tabs pattern has them: they select
 * the tab (selection follows the focus) and move the focus to it once it is active, and the active
 * tab scrolls into view as it does for a mouse selection.
 */
function useTabListKeyboard<T>(
    tabsElement: HTMLElement | null,
    tabs: ITabsProps<T>["tabs"],
    active: number,
    onActivate: (tab: ITabsProps<T>["tabs"][number]) => void,
) {
    const isFocusPending = useRef(false);

    useEffect(() => {
        if (!isFocusPending.current) {
            return;
        }
        isFocusPending.current = false;

        // The key's activation may never have completed (a caller can hold it back), and the change
        // of the active tab then comes from elsewhere; follow it only while the keyboard is still in
        // the tab list, never pull the focus back from a field the user went to in the meantime.
        if (!tabsElement?.contains(document.activeElement)) {
            return;
        }

        // the scroll to the active tab is smooth, a focus scroll would jump ahead of it
        tabsElement.querySelector<HTMLElement>(`.${TabRoot}.${TabActive}`)?.focus({ preventScroll: true });
    }, [active, tabsElement]);

    return (event: KeyboardEvent<HTMLDivElement>) => {
        // the keys of the close button inside a tab are its own
        if (!(event.target instanceof HTMLElement) || event.target.getAttribute("role") !== "tab") {
            return;
        }

        const last = tabs.length - 1;
        const targets: Record<string, number> = {
            ArrowLeft: active > 0 ? active - 1 : last,
            ArrowRight: active < last ? active + 1 : 0,
            Home: 0,
            End: last,
        };
        const target = targets[event.key];

        if (target === undefined) {
            return;
        }

        event.preventDefault();
        if (target !== active && tabs[target]) {
            isFocusPending.current = true;
            onActivate(tabs[target]);
        }
    };
}

type ITabsControlsProps = {
    minimizable: boolean;
    maximizable: boolean;
    closeable: boolean;
    closeOpensDialog: boolean;
    maximized: boolean;
    labels: ITabsLabels;
    onTabsClose?: () => void;
    onTabsMinimize?: () => void;
    onTabsMaximize?: (state: boolean) => void;
    // the whole editor (tabs and content), which minimizing unmounts
    editorRoot: RefObject<HTMLDivElement | null>;
};

function TabsControls({
    minimizable,
    maximizable,
    maximized,
    closeable,
    closeOpensDialog,
    labels,
    onTabsMinimize,
    onTabsMaximize,
    onTabsClose,
    editorRoot,
}: ITabsControlsProps) {
    const { classes, cx } = useStyles();
    const minimizeButton = useRef<HTMLButtonElement>(null);
    const focusHandoff = useFocusHandoff();

    // Restoring from the chip drops the focus to the page (see focusHandoff). Put it back on the
    // minimize button, where it was before minimizing, only when this editor's chip handed it off,
    // and only if nothing inside the editor has taken it in the meantime.
    useEffect(() => {
        const isHandedOff = focusHandoff?.take("editor") ?? false;
        const isFocusDropped = !document.activeElement || document.activeElement === document.body;

        if (isHandedOff && isFocusDropped) {
            minimizeButton.current?.focus();
        }
        // only on mount, which is when the chip has just handed off
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // minimizing unmounts the editor, so the chip catches the focus if the editor held it
    const minimizeHandler = () =>
        handOffFocusDuring(
            focusHandoff,
            "chip",
            !!editorRoot.current?.contains(document.activeElement),
            onTabsMinimize,
            () => editorRoot.current !== null,
        );

    const controls = [
        minimizable && (
            <button
                key="minimize"
                ref={minimizeButton}
                type="button"
                className={cx(classes.button, TabsClasses.ButtonMinimize)}
                aria-label={labels.minimize}
                onClick={minimizeHandler}
            >
                <IconMinimize width={TabsIconSize} height={TabsIconSize} ariaHidden />
            </button>
        ),
        maximizable && (
            <button
                key="maximize"
                type="button"
                className={cx(classes.button, TabsClasses.ButtonMaximize)}
                aria-label={maximized ? labels.exitMaximize : labels.maximize}
                onClick={() => onTabsMaximize?.(!maximized)}
            >
                {maximized ? (
                    <IconContract width={TabsIconSize} height={TabsIconSize} ariaHidden />
                ) : (
                    <IconExpand width={TabsIconSize} height={TabsIconSize} ariaHidden />
                )}
            </button>
        ),
        closeable && (
            <button
                key="close"
                type="button"
                className={cx(classes.button, TabsClasses.ButtonCloseTabs)}
                aria-label={labels.close}
                aria-haspopup={closeOpensDialog ? "dialog" : undefined}
                onClick={onTabsClose}
            >
                <IconClose width={TabsIconSize} height={TabsIconSize} ariaHidden />
            </button>
        ),
    ];

    return (
        <>
            {(controls.filter(Boolean) as ReactElement[]).reduce((prev, current, i) => {
                if (i !== 0) {
                    return [...prev, <div key={i} className={cx(classes.divider, ButtonDivider)} />, current];
                }
                return [...prev, current];
            }, [] as ReactElement[])}
        </>
    );
}

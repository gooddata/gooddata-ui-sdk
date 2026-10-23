// (C) 2022-2026 GoodData Corporation

import { type ComponentClass, type FunctionComponent, type ReactElement, useState } from "react";

import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    IconClose,
    IconContract,
    IconExpand,
    IconMinimize,
} from "@gooddata/sdk-ui-kit";

import { makeStyles } from "../theme/index.js";

import { useChangeScroll } from "./hooks/useChangeScroll.js";
import { useScrollByButtons } from "./hooks/useScrollByButtons.js";
import { useScrollToActive } from "./hooks/useScrollToActive.js";
import { useTabCallbacks } from "./hooks/useTabCallbacks.js";
import { useTabsCallbacks } from "./hooks/useTabsCallbacks.js";
import { NameButton, Tab, TabActive, TitleText } from "./Tab.js";
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

    const [tabsElement, setTabsElement] = useState<HTMLDivElement | null>(null);
    const { enabled, canLeft, canRight, onLeft, onRight } = useScrollByButtons(
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

    const Content: ComponentClass<ITabContentProps> | FunctionComponent<ITabContentProps> | undefined =
        content;

    return (
        <div className={cx(classes.root, className)}>
            <div className={cx(classes.tabs)}>
                {enabled && (
                    <button
                        className={cx(
                            classes.leftButton,
                            !canLeft && classes.disabled,
                            TabsClasses.ButtonLeft,
                        )}
                        onMouseDown={onLeft}
                    >
                        <span className="gd-icon-navigateleft" />
                    </button>
                )}
                <div
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
                            onActive={onTabActiveHandler}
                            onClose={onTabCloseHandler}
                        />
                    ))}
                </div>
                {enabled && (
                    <button
                        className={cx(
                            classes.rightButton,
                            !canRight && classes.disabled,
                            TabsClasses.ButtonRight,
                        )}
                        onMouseDown={onRight}
                    >
                        <span className="gd-icon-navigateright" />
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
                        onTabsClose={onTabsCloseHandler}
                        onTabsMinimize={onTabsMinimizeHandler}
                        onTabsMaximize={onTabsMaximizeHandler}
                    />
                </div>
            </div>
            {Content && tabs[active] && <Content tab={tabs[active]} />}
            {render && tabs[active] && render({ tab: tabs[active] })}
        </div>
    );
}

type ITabsControlsProps = {
    minimizable: boolean;
    maximizable: boolean;
    closeable: boolean;
    maximized: boolean;
    onTabsClose?: () => void;
    onTabsMinimize?: () => void;
    onTabsMaximize?: (state: boolean) => void;
};

function TabsControls({
    minimizable,
    maximizable,
    maximized,
    closeable,
    onTabsMinimize,
    onTabsMaximize,
    onTabsClose,
}: ITabsControlsProps) {
    const { classes, cx } = useStyles();

    const controls = [
        minimizable && (
            <button
                key="minimize"
                className={cx(classes.button, TabsClasses.ButtonMinimize)}
                onClick={onTabsMinimize}
            >
                <IconMinimize width={TabsIconSize} height={TabsIconSize} />
            </button>
        ),
        maximizable && (
            <button
                key="maximize"
                className={cx(classes.button, TabsClasses.ButtonMaximize)}
                onClick={() => onTabsMaximize?.(!maximized)}
            >
                {maximized ? (
                    <IconContract width={TabsIconSize} height={TabsIconSize} />
                ) : (
                    <IconExpand width={TabsIconSize} height={TabsIconSize} />
                )}
            </button>
        ),
        closeable && (
            <button
                key="close"
                className={cx(classes.button, TabsClasses.ButtonCloseTabs)}
                onClick={onTabsClose}
            >
                <IconClose width={TabsIconSize} height={TabsIconSize} />
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

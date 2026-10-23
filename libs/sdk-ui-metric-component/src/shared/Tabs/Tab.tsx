// (C) 2021-2026 GoodData Corporation

import { IconClose } from "@gooddata/sdk-ui-kit";

import { makeStyles } from "../theme/index.js";

import { TabsClasses } from "./Tabs.classes.js";
import { TabMaxWidth, TabMinWidth } from "./Tabs.data.js";

export const NameButton = "name";
export const TitleText = "title";
export const TabActive = "active";
export const TabRoot = "tab-root";
export const TabSpace = "tab-space";
export const TabPlaceholder = "tab-placeholder";

const useStyles = makeStyles<void, "close">()((theme, _params, classes) => {
    return {
        //space
        space: {
            flexShrink: 0,
            width: theme.tabs.sizes.space,
            borderBottom: `1px solid ${theme.tabs.colors.border}`,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",

            "&:after": {
                content: `""`,
                width: 1,
                marginTop: 5,
                marginBottom: 6,
                background: theme.tabs.colors.separator,
            },

            "&:first-of-type:after": {
                display: "none",
            },
        },
        spaceActive: {
            "&:after": {
                display: "none",
            },
        },
        spaceAfterActive: {
            "&:after": {
                display: "none",
            },
        },
        //tab
        root: {
            fontFamily: theme.globals.font,
            cursor: "pointer",
            position: "relative",
            border: `none`,
            borderBottom: `1px solid ${theme.tabs.colors.border}`,
            borderTopLeftRadius: `${theme.tabs.sizes.tabBorderRadius}px`,
            borderTopRightRadius: `${theme.tabs.sizes.tabBorderRadius}px`,
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            alignItems: "center",
            padding: "3px 11px 1px 11px",
            flexWrap: "nowrap",
            maxWidth: TabMaxWidth,
            flexBasis: TabMaxWidth,
            minWidth: TabMinWidth,
            color: theme.tabs.colors.normal,

            "&:hover": {
                color: theme.globals.colors.defaultText,
            },
        },
        active: {
            border: `1px solid ${theme.tabs.colors.border}`,
            borderBottom: `none`,
            padding: "3px 10px 2px 10px",
            background: theme.tabs.colors.background,

            [`.${classes.close}`]: {
                top: "3px",
                right: theme.tabs.sizes.space + 2,
            },
        },
        //state: DIRTY
        dirty: {
            display: "block",
            overflow: "hidden",
            width: 0,
            opacity: 0,
            transition: "opacity 200ms, width 200ms",
            flexShrink: 0,

            "&:after": {
                content: `""`,
                display: "block",
                width: theme.tabs.sizes.flag,
                height: theme.tabs.sizes.flag,
                borderRadius: theme.tabs.sizes.flag,
            },
        },
        dirtyActive: {
            width: theme.tabs.sizes.flag * 2,
            opacity: 1,
            "&:after": {
                background: theme.tabs.colors.dirty,
            },
        },
        dirtyInvalid: {
            width: theme.tabs.sizes.flag * 2,
            opacity: 1,
            "&:after": {
                background: theme.tabs.colors.negative,
            },
        },
        //title
        title: {
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            width: "100%",
            fontSize: `${theme.tabs.fontSize.title}px`,
            lineHeight: `${theme.tabs.lineHeight.title}px`,
        },
        inner: {
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
        },
        //placeholder
        placeholder: {
            color: theme.tabs.colors.placeholder,
            fontStyle: "normal",
        },
        //button: CLOSE
        close: {
            position: "absolute",
            top: 0,
            bottom: 0,
            right: theme.tabs.sizes.space,
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: "0",
            marginLeft: theme.tabs.sizes.space,
            display: "block",
            lineHeight: `${theme.tabs.lineHeight.close}px`,

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

export enum TabState {
    Invalid = "invalid",
    Dirty = "dirty",
}

export interface ITab<T = undefined> {
    id: string;
    title: string;
    states?: Partial<Record<TabState, boolean>>;
    options?: {
        closeable: boolean;
    };
    data: T;
}

export interface ITabProps<T = undefined> {
    tab: ITab<T>;
    active: boolean;
    placeholder?: string;
    beforeActive?: boolean;
    afterActive?: boolean;
    last?: boolean;
    onActive: (tab: ITab<T>) => void;
    onClose: (tab: ITab<T>) => void;
}

export function Tab({ tab, placeholder, last, active, afterActive, onActive, onClose }: ITabProps) {
    const { states, options, title } = tab;
    const { classes, cx } = useStyles();

    return (
        <>
            <div
                className={cx(
                    classes.space,
                    active && classes.spaceActive,
                    afterActive && classes.spaceAfterActive,
                    TabSpace,
                )}
            />
            <div
                role="tab"
                className={cx(
                    classes.root,
                    TabRoot,
                    active && classes.active,
                    active && TabActive,
                    TabsClasses.Tab,
                )}
                onClick={() => onActive(tab)}
            >
                <div
                    className={cx(
                        classes.dirty,
                        states?.dirty && classes.dirtyActive,
                        states?.dirty && TabsClasses.TabDirty,
                        states?.invalid && classes.dirtyInvalid,
                        states?.invalid && TabsClasses.TabInvalid,
                    )}
                />
                <div className={cx(classes.title)}>
                    <div className={cx(classes.inner, TitleText)}>
                        <Title title={title} placeholder={placeholder} />
                    </div>
                </div>
                {options && options.closeable && (
                    <button
                        className={cx(classes.close, NameButton, TabsClasses.ButtonCloseTab)}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose(tab);
                        }}
                    >
                        <IconClose width={9} height={9} />
                    </button>
                )}
            </div>
            {last && <div className={cx(classes.space, active && classes.spaceActive, TabSpace)} />}
        </>
    );
}

function Title({ title, placeholder }: { title: string; placeholder?: string }) {
    const { classes, cx } = useStyles();

    if (title) {
        return <>{title}</>;
    }
    if (placeholder) {
        return <span className={cx(classes.placeholder, TabPlaceholder)}>{placeholder}</span>;
    }
    return <>{"\u200B"}</>;
}

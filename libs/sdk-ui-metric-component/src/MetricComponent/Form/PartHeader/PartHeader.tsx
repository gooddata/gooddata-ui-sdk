// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import {
    Bubble,
    BubbleHoverTrigger,
    Dropdown,
    DropdownList,
    IconQuestionMark,
    Separator,
    SingleSelectListItem,
} from "@gooddata/sdk-ui-kit";

import { isMac } from "../../../shared/platform.js";
import { type DefaultTheme, makeStyles } from "../../../shared/theme/index.js";

const useStyles = makeStyles()((theme: DefaultTheme) => ({
    root: {
        display: "flex",
        flex: "1 1 auto",
    },
    header: {
        fontSize: "11px",
        lineHeight: "11px",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        margin: "10px 20px",
        color: theme.globals.colors.placeholder,

        "svg path": {
            fill: theme.globals.colors.dropdownButton,
        },
    },
    title: {
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    help: {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
    },
    toolbar: {
        flex: "1 1 auto",
        display: "flex",
        justifyContent: "flex-end",
        marginRight: 20,
    },
    after: {
        display: "flex",
    },
    afterLine: {
        margin: 8,
        borderLeft: `1px solid ${theme.globals.colors.line}`,
    },

    dropdownRoot: {
        marginRight: -20,
        "> div": {
            height: "100%",
        },
    },
    dropdownButton: {
        border: "none",
        outline: "none",
        background: "transparent",
        color: theme.globals.colors.defaultGreyedText,
        fontSize: 18,
        width: theme.globals.metricList.itemSize,
        height: "100%",
        fontFamily: theme.globals.font,
        fontWeight: 700,

        "&:hover, &.is-open": {
            color: theme.globals.colors.defaultText,
            background: theme.globals.colors.dropdownButtonMoreHover,
        },
    },
    dropdownList: {},
}));

interface IDropdownItem {
    type: "separator" | "link";
    tooltip?: string;
    tooltipMac?: string;
    title?: string;
    onClick?: () => void;
}

const getItemHeight = (item: IDropdownItem) => {
    return item.type === "separator" ? 10 : 28;
};

export interface IPartHeader {
    TitleContent: ReactElement;
    TitleTooltip?: ReactElement;
    className?: string;
    buttons?: Array<ReactElement | false | undefined>;
    dropdown?: Array<IDropdownItem>;
    after?: ReactElement | false | undefined;
}

export function PartDivider() {
    const { classes, cx } = useStyles();

    return <div className={cx(classes.afterLine)} />;
}

export function PartHeader({
    TitleContent,
    TitleTooltip,
    buttons = [],
    dropdown = [],
    after,
    className,
}: IPartHeader) {
    const { classes, cx } = useStyles();

    return (
        <div className={cx(classes.root, className)}>
            <div className={cx(classes.header)}>
                <div className={cx(classes.title)}>{TitleContent}</div>
                {TitleTooltip && (
                    <BubbleHoverTrigger showDelay={500} className={cx(classes.help)}>
                        <IconQuestionMark />
                        <Bubble className="bubble-primary" alignPoints={[{ align: "bc tc" }]}>
                            {TitleTooltip}
                        </Bubble>
                    </BubbleHoverTrigger>
                )}
            </div>
            <div className={cx(classes.toolbar)}>
                {buttons}
                {dropdown.length > 0 && (
                    <Dropdown
                        enableEventPropagation
                        className={classes.dropdownRoot}
                        alignPoints={[{ align: "br tr" }, { align: "tr br" }]}
                        renderBody={({ closeDropdown, isMobile }) => (
                            <DropdownList
                                height={dropdown.reduce(
                                    (accumulator: number, item) => accumulator + getItemHeight(item),
                                    0,
                                )}
                                itemHeightGetter={(index) => getItemHeight(dropdown[index])}
                                items={dropdown}
                                isMobile={isMobile}
                                className={classes.dropdownList}
                                renderItem={({ item }) => (
                                    <>
                                        {item.type === "separator" ? (
                                            <Separator />
                                        ) : (
                                            <BubbleHoverTrigger showDelay={500}>
                                                <SingleSelectListItem
                                                    title={item.title}
                                                    onClick={(e) => {
                                                        if (item.onClick) {
                                                            item.onClick();
                                                        }
                                                        closeDropdown();
                                                        e.stopPropagation();
                                                    }}
                                                    isSelected={false}
                                                />
                                                {Boolean(item.tooltip) && (
                                                    <Bubble
                                                        className="bubble-primary"
                                                        alignPoints={[{ align: "bc tc" }]}
                                                    >
                                                        {isMac()
                                                            ? item.tooltipMac || item.tooltip
                                                            : item.tooltip}
                                                    </Bubble>
                                                )}
                                            </BubbleHoverTrigger>
                                        )}
                                    </>
                                )}
                            />
                        )}
                        renderButton={({ toggleDropdown, isOpen }) => (
                            <button
                                type="button"
                                className={cx(classes.dropdownButton, "s-part_header_dropdown", [
                                    { "is-open": isOpen },
                                ])}
                                onClick={(e) => {
                                    toggleDropdown();
                                    e.stopPropagation();
                                }}
                            >
                                ⋯
                            </button>
                        )}
                    />
                )}
                {Boolean(after) && (
                    <div className={cx(classes.after)}>
                        <PartDivider />
                        {after}
                    </div>
                )}
            </div>
        </div>
    );
}

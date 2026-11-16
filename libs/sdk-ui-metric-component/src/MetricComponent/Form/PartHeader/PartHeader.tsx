// (C) 2021-2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, type ReactElement, type RefObject, useId, useRef } from "react";

import { useIntl } from "react-intl";

import {
    Bubble,
    BubbleHoverTrigger,
    type IUiMenuItem,
    IconQuestionMark,
    UiDropdown,
    UiMenu,
    getFocusableElements,
} from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

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

        "&:focus-visible": {
            outline: `2px solid ${theme.globals.colors.defaultText}`,
            outlineOffset: -2,
        },
    },
    shortcut: {
        marginLeft: 16,
        color: theme.globals.colors.defaultGreyedText,
    },
}));

interface IDropdownItem {
    type: "separator" | "link";
    /**
     * What the item does, read as its description (aria-describedby); on macOS `tooltipMac` if given.
     */
    tooltip?: string;
    tooltipMac?: string;
    title?: string;
    /**
     * The keys of the item, in the `aria-keyshortcuts` form ("Shift+Alt+F"); shown at its right too.
     */
    keyShortcuts?: string;
    /**
     * Set for a toggle: the item is a menu checkbox, checked when the option is on.
     */
    checked?: boolean;
    onClick?: () => void;
}

type MenuItemData = { interactive: (() => void) | undefined };
type MenuItem = IUiMenuItem<MenuItemData>;

function getDescription(item: IDropdownItem): string | undefined {
    return isMac() ? item.tooltipMac || item.tooltip : item.tooltip;
}

// "Shift+Alt+F" as macOS shows it ("⇧⌥F"), and as it is elsewhere
function formatShortcut(keyShortcuts: string): string {
    const macSymbols: Record<string, string> = { Shift: "⇧", Alt: "⌥", Meta: "⌘", Control: "⌃" };
    return isMac()
        ? keyShortcuts
              .split("+")
              .map((key) => macSymbols[key] ?? key)
              .join("")
        : keyShortcuts;
}

/**
 * The menu items. No item has a tooltip: the menu's tooltip takes the first Escape for itself, so the
 * menu would need two to close. What a tooltip said is the item's description instead, its keys are
 * in aria-keyshortcuts and shown at its right, hidden from assistive technology, which has them.
 */
function toMenuItems(
    dropdown: IDropdownItem[],
    descriptionId: (index: number) => string,
    shortcutClassName: string,
): MenuItem[] {
    return dropdown.map((item, index): MenuItem => {
        if (item.type === "separator") {
            return { type: "separator", id: `separator-${index}` };
        }
        const title = item.title ?? "";
        const isToggle = item.checked !== undefined;

        return {
            type: "interactive",
            id: `${index}-${title}`,
            stringTitle: title,
            selectionRole: isToggle ? "checkbox" : undefined,
            isSelected: item.checked,
            iconRight: item.keyShortcuts ? (
                <span className={shortcutClassName} aria-hidden="true">
                    {formatShortcut(item.keyShortcuts)}
                </span>
            ) : undefined,
            ariaAttributes: {
                "aria-describedby": getDescription(item) ? descriptionId(index) : undefined,
                "aria-keyshortcuts": item.keyShortcuts,
            },
            data: item.onClick,
        };
    });
}

// The test hook of each item ("s-auto_format", the class the former list items had), which the e2e
// helpers select by; UiMenu takes it as the item's data-testid.
function getItemDataTestId(item: MenuItem): string | undefined {
    return item.type === "interactive" ? `s-${simplifyText(item.stringTitle)}` : undefined;
}

function stopPropagation(event: MouseEvent) {
    event.stopPropagation();
}

export interface IPartHeader {
    TitleContent: ReactElement;
    TitleTooltip?: ReactElement;
    className?: string;
    buttons?: Array<ReactElement | false | undefined>;
    dropdown?: Array<IDropdownItem>;
    /**
     * Accessible name of the dropdown's "⋯" button; a generic "More actions" when not given.
     */
    dropdownLabel?: string;
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
    dropdownLabel,
    after,
    className,
}: IPartHeader) {
    const { classes, cx } = useStyles();
    const intl = useIntl();
    const dropdownRoot = useRef<HTMLDivElement>(null);
    const idBase = useId();
    const descriptionId = (index: number) => `${idBase}-description-${index}`;

    // The menu renders in a portal at the end of the page, so the browser would continue the Tab order
    // from there (past Save). As in the menu button pattern, Tab closes the menu and moves on from the
    // "⋯" button, Shift+Tab closes it and goes back to the button.
    const onMenuKeyDownCapture = (event: KeyboardEvent, closeDropdown: () => void) => {
        if (event.key !== "Tab") {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        closeDropdown();

        const trigger = dropdownRoot.current?.querySelector<HTMLElement>(".s-part_header_dropdown");
        if (!trigger) {
            return;
        }
        if (event.shiftKey) {
            trigger.focus();
            return;
        }
        // the next control after the button, in the order of the dialog around it (its focus trap's)
        const scope = trigger.closest<HTMLElement>('[role="dialog"]') ?? document.body;
        const { focusableElements } = getFocusableElements(scope);
        (focusableElements[focusableElements.indexOf(trigger) + 1] ?? trigger).focus();
    };

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
                    // The menu renders in a portal, but its React events still bubble to the form
                    // around the header; stop them, as the former list items did.
                    <div ref={dropdownRoot} className={classes.dropdownRoot} onClick={stopPropagation}>
                        <UiDropdown
                            alignPoints={[{ align: "br tr" }, { align: "tr br" }]}
                            autofocusOnOpen
                            closeOnEscape
                            closeOnOutsideClick
                            enableFocusTrap={false}
                            accessibilityConfig={{ triggerRole: "button", popupRole: "menu" }}
                            renderButton={({ ref, toggleDropdown, isOpen, ariaAttributes }) => (
                                <button
                                    ref={ref as RefObject<HTMLButtonElement>}
                                    type="button"
                                    className={cx(classes.dropdownButton, "s-part_header_dropdown", {
                                        "is-open": isOpen,
                                    })}
                                    aria-label={
                                        dropdownLabel ??
                                        intl.formatMessage({ id: "metricComponent.partHeader.moreActions" })
                                    }
                                    onClick={toggleDropdown}
                                    {...ariaAttributes}
                                >
                                    <span aria-hidden="true">⋯</span>
                                </button>
                            )}
                            renderBody={({ ariaAttributes, closeDropdown, triggerId }) => (
                                <div
                                    style={{ display: "contents" }}
                                    onKeyDownCapture={(event) => onMenuKeyDownCapture(event, closeDropdown)}
                                >
                                    <UiMenu<MenuItemData>
                                        items={toMenuItems(dropdown, descriptionId, classes.shortcut)}
                                        onSelect={(item) => item.data?.()}
                                        onClose={closeDropdown}
                                        ariaAttributes={{ ...ariaAttributes, "aria-labelledby": triggerId }}
                                        size="small"
                                        containerTopPadding="small"
                                        containerBottomPadding="small"
                                        itemDataTestId={getItemDataTestId}
                                    />
                                    {/* the descriptions the items point at, not shown */}
                                    {dropdown.map((item, index) => {
                                        const description = getDescription(item);
                                        return description ? (
                                            <span key={index} id={descriptionId(index)} hidden>
                                                {description}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        />
                    </div>
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

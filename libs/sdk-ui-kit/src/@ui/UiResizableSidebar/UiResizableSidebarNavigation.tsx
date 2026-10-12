// (C) 2026 GoodData Corporation

import {
    type KeyboardEvent,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
    useCallback,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    FloatingFocusManager,
    FloatingPortal,
    type OffsetOptions,
    safePolygon,
    useDismiss,
    useHover,
    useInteractions,
} from "@floating-ui/react";
import cx from "classnames";

import { ConditionalScopedThemeProvider } from "@gooddata/sdk-ui-theme-provider";

import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { type IconType } from "../@types/icon.js";
import { bem } from "../@utils/bem.js";
import { makeGridKeyboardNavigation, makeMenuKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { useFloatingPosition } from "../UiFloatingElement/useFloatingPosition.js";
import { iconPaths } from "../UiIcon/icons.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { hasSystemModifier } from "../UiToolbar/rovingFocusUtils.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

import {
    type IUiResizableSidebarNavigationActionRequired,
    type IUiResizableSidebarNavigationItem,
    type IUiResizableSidebarNavigationSubItem,
    type UiResizableSidebarNavigationNamingConfig,
} from "./types.js";
import { useOptionalUiResizableSidebar } from "./UiResizableSidebarContext.js";

const { b, e } = bem("gd-ui-kit-resizable-sidebar-navigation");

const ICON_SIZE = 18;
const CHEVRON_SIZE = 14;
const FLYOVER_OPEN_DELAY = 100;

/**
 * @internal
 */
export type UiResizableSidebarNavigationItem =
    | IUiResizableSidebarNavigationItem
    | IUiResizableSidebarNavigationSubItem;

/**
 * @internal
 */
export interface IUiResizableSidebarNavigationProps {
    items: IUiResizableSidebarNavigationItem[];
    /**
     * Called when the user activates an item. A link item is not prevented from following its `href`;
     * call `event.preventDefault()` to route it in the application instead. A click with Alt, Ctrl, Meta
     * or Shift on a link item is left to the browser (new tab, window or download) and does not call
     * this.
     *
     * A group with an `href` calls this only while it is not active. Activating an active group toggles
     * its sub-items, so its own `href` is then reached only by a modified click; list a group page that
     * must stay reachable as one of its sub-items. In rail mode a group does not call this: activating
     * it opens the flyover with its sub-items.
     */
    onSelect?: (item: UiResizableSidebarNavigationItem, event: MouseEvent | KeyboardEvent) => void;
    accessibilityConfig: UiResizableSidebarNavigationNamingConfig;
    /**
     * Rail mode lists only the icons of the top-level items. An item shows its label in a tooltip, and a
     * group lists its sub-items in a flyover that opens on hover, on activation or with the Right arrow
     * key. Keyboard focus on a group with a closed flyover shows the group label in a tooltip.
     * Defaults to whether the nearest {@link UiResizableSidebarProvider} is collapsed to a rail.
     */
    isRail?: boolean;
    /**
     * Class name of the rail flyover. The flyover renders in a portal, so styles of the navigation do not
     * reach it.
     */
    flyoverClassName?: string;
    dataTestId?: string;
}

interface IRow {
    item: UiResizableSidebarNavigationItem;
    parent?: IUiResizableSidebarNavigationItem;
    /**
     * Identity of the row in the list. Sub-item ids only have to be unique within their group, so the
     * key qualifies them by the group; the JSON encoding keeps it unique for any id strings.
     */
    key: string;
}

function makeRow(item: UiResizableSidebarNavigationItem, parent?: IUiResizableSidebarNavigationItem): IRow {
    return { item, parent, key: JSON.stringify(parent ? [parent.id, item.id] : [item.id]) };
}

interface IExpansionState {
    selectionKey: string;
    toggles: ReadonlyMap<string, boolean>;
}

interface IFlyoverState {
    rowKey: string;
    focusItems: boolean;
}

type FlyoverFocusSource = "keyboard" | "pointer";

interface IFlyoverFocus {
    rowKey: string;
    source: FlyoverFocusSource;
}

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

// A label can start with an emoji or a combined character that spans several UTF-16 code units.
function getFirstGrapheme(label: string): string {
    return graphemeSegmenter.segment(label)[Symbol.iterator]().next().value?.segment ?? "";
}

// Any supplied href, even an empty one, makes the item a link.
function isLink(item: UiResizableSidebarNavigationItem): boolean {
    return item.href !== undefined;
}

// A modified click on a link is left to the browser: a new tab, a window or a download.
function isBrowserLinkClick(
    item: UiResizableSidebarNavigationItem,
    event: MouseEvent | KeyboardEvent,
): boolean {
    return isLink(item) && (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
}

function isIconType(icon: unknown): icon is IconType {
    return typeof icon === "string" && icon in iconPaths;
}

function isGroup(item: IUiResizableSidebarNavigationItem): boolean {
    return (item.children?.length ?? 0) > 0;
}

function isActive(item: IUiResizableSidebarNavigationItem): boolean {
    return !!item.isSelected || !!item.children?.some((child) => child.isSelected);
}

function hasGroupRow(items: IUiResizableSidebarNavigationItem[], rowKey: string): boolean {
    return items.some((item) => isGroup(item) && makeRow(item).key === rowKey);
}

function getSelectionKey(items: IUiResizableSidebarNavigationItem[]): string {
    return items
        .flatMap((item) => [makeRow(item), ...(item.children ?? []).map((child) => makeRow(child, item))])
        .filter((row) => row.item.isSelected)
        .map((row) => row.key)
        .join();
}

/**
 * Item list of a sidebar: top-level pages and expandable groups of sub-pages. A group expands by itself
 * when it or one of its sub-items is selected, and the user can expand and collapse it with its chevron
 * or the Left and Right arrow keys. The list is one tab stop: Up and Down move between the listed items,
 * Home and End jump to the ends.
 *
 * @remarks
 * Selection is driven by the `isSelected` flags of the items; the list does not keep a selection of its
 * own. A group with a selected sub-item is highlighted together with the sub-item.
 *
 * @internal
 */
export function UiResizableSidebarNavigation({
    items,
    onSelect,
    accessibilityConfig,
    isRail: isRailProp,
    flyoverClassName,
    dataTestId,
}: IUiResizableSidebarNavigationProps): ReactElement {
    const sidebar = useOptionalUiResizableSidebar();
    const isRail = isRailProp ?? (!!sidebar && sidebar.isCollapsed && sidebar.hasRail);
    const idPrefix = useId();

    const selectionKey = getSelectionKey(items);
    const [expansion, setExpansion] = useState<IExpansionState>({ selectionKey, toggles: new Map() });
    const [flyoverState, setFlyoverState] = useState<IFlyoverState | null>(null);
    const flyover = isRail ? flyoverState : null;
    const flyoverFocusRef = useRef<IFlyoverFocus | null>(null);

    // A flyover left open must not open again, and take focus, when the list returns to the rail or
    // its group comes back.
    if (flyoverState && (!isRail || !hasGroupRow(items, flyoverState.rowKey))) {
        setFlyoverState(null);
    }

    // A change of selection forgets the manual toggles, so the group of the new page always opens.
    if (expansion.selectionKey !== selectionKey) {
        setExpansion({ selectionKey, toggles: new Map() });
    }

    const isExpanded = useCallback(
        (item: IUiResizableSidebarNavigationItem) =>
            !isRail && isGroup(item) && (expansion.toggles.get(item.id) ?? isActive(item)),
        [expansion.toggles, isRail],
    );

    const setExpanded = useCallback((id: string, expanded: boolean) => {
        setExpansion((current) => ({
            ...current,
            toggles: new Map(current.toggles).set(id, expanded),
        }));
    }, []);

    const rows = useMemo<IRow[]>(
        () =>
            items.flatMap((item): IRow[] => {
                const own = makeRow(item);
                return isExpanded(item)
                    ? [own, ...(item.children ?? []).map((child) => makeRow(child, item))]
                    : [own];
            }),
        [items, isExpanded],
    );

    const [focusedKey, setFocusedKey] = useState<string | null>(null);
    const tabStopKey = useMemo(() => {
        if (rows.some((row) => row.key === focusedKey)) {
            return focusedKey;
        }

        const selected = rows.find((row) => row.item.isSelected) ?? rows.find((row) => isActive(row.item));

        return (selected ?? rows[0])?.key ?? null;
    }, [rows, focusedKey]);

    const elementsRef = useRef(new Map<string, HTMLElement>());

    const focusRow = useCallback((key: string | undefined) => {
        if (key !== undefined) {
            elementsRef.current.get(key)?.focus();
        }
    }, []);

    const getRowIndex = useCallback(
        (target: EventTarget) => {
            const entry = [...elementsRef.current.entries()].find(([, element]) =>
                element.contains(target as Node),
            );

            return entry ? rows.findIndex((row) => row.key === entry[0]) : -1;
        },
        [rows],
    );

    const onKeyDown = useMemo(() => {
        // Enter and Space stay unhandled, so links and buttons keep their native activation.
        const handleKey = makeGridKeyboardNavigation<KeyboardEvent<HTMLElement>>({
            onFocusUp: (event) => {
                const index = getRowIndex(event.target);
                focusRow(rows[Math.max(0, index - 1)]?.key);
            },
            onFocusDown: (event) => {
                const index = getRowIndex(event.target);
                focusRow(rows[Math.min(rows.length - 1, index + 1)]?.key);
            },
            onFocusFirst: () => focusRow(rows[0]?.key),
            onFocusLast: () => focusRow(rows[rows.length - 1]?.key),
            onFocusRight: (event) => {
                const row = rows[getRowIndex(event.target)];
                const item = row?.item as IUiResizableSidebarNavigationItem | undefined;

                if (!item || row.parent || !isGroup(item)) {
                    return;
                }

                if (isRail) {
                    setFlyoverState({ rowKey: row.key, focusItems: true });
                    return;
                }

                if (isExpanded(item)) {
                    const firstChild = item.children?.[0];
                    focusRow(firstChild ? makeRow(firstChild, item).key : undefined);
                } else {
                    setExpanded(item.id, true);
                }
            },
            onFocusLeft: (event) => {
                const row = rows[getRowIndex(event.target)];

                if (!row) {
                    return;
                }

                if (row.parent) {
                    focusRow(makeRow(row.parent).key);
                } else if (isExpanded(row.item as IUiResizableSidebarNavigationItem)) {
                    setExpanded(row.item.id, false);
                }
            },
        });

        // Modified keys stay with the browser, e.g. Alt+Left for history navigation. Keys from a flyover
        // reach the list through the React tree only, because the flyover renders in a portal.
        return (event: KeyboardEvent<HTMLElement>) => {
            const isFromList = event.currentTarget.contains(event.target as Node);
            if (isFromList && !hasSystemModifier(event)) {
                handleKey(event);
            }
        };
    }, [rows, getRowIndex, focusRow, isExpanded, setExpanded, isRail]);

    // Leaving the rail, or removing the open group, unmounts the flyover with focus inside. Focus goes
    // back to the group row, or to the tab stop of the list when the group is gone.
    useLayoutEffect(() => {
        const focus = flyoverFocusRef.current;
        if (!focus) {
            return;
        }
        const hasGroup = hasGroupRow(items, focus.rowKey);
        if (isRail && hasGroup) {
            return;
        }
        flyoverFocusRef.current = null;
        focusRow(hasGroup ? focus.rowKey : (tabStopKey ?? undefined));
    }, [isRail, items, tabStopKey, focusRow]);

    const registerElement = useCallback((key: string, element: HTMLElement | null) => {
        if (element) {
            elementsRef.current.set(key, element);
        } else {
            elementsRef.current.delete(key);
        }
    }, []);

    const onActivate = useCallback(
        (row: IRow, event: MouseEvent | KeyboardEvent) => {
            const item = row.item as IUiResizableSidebarNavigationItem;

            if (isBrowserLinkClick(item, event)) {
                return;
            }

            if (isRail && !row.parent && isGroup(item)) {
                event.preventDefault();
                // A keyboard activation has no click count; it moves focus into the flyover.
                setFlyoverState({ rowKey: row.key, focusItems: event.detail === 0 });
                return;
            }

            if (row.parent || isRail || !isGroup(item)) {
                onSelect?.(item, event);
                return;
            }

            if (!isLink(item) || isActive(item)) {
                event.preventDefault();
                setExpanded(item.id, !isExpanded(item));
                return;
            }

            setExpanded(item.id, true);
            onSelect?.(item, event);
        },
        [onSelect, isRail, isExpanded, setExpanded],
    );

    const renderRow = (row: IRow): ReactNode => {
        const item = row.item as IUiResizableSidebarNavigationItem;
        const group = !row.parent && isGroup(item);
        const expanded = isExpanded(item);
        const childrenId = `${idPrefix}-${encodeURIComponent(item.id)}`;

        // A collapsed group shows the marker of a sub-page, so the marker stays visible from outside.
        const actionRequired =
            item.actionRequired ??
            (group && !expanded
                ? item.children?.find((child) => child.actionRequired)?.actionRequired
                : undefined);
        const isFlyoverOpen = flyover?.rowKey === row.key;

        const element = (
            <NavigationRow
                item={item}
                actionRequired={actionRequired}
                rowKey={row.key}
                isChild={!!row.parent}
                isRail={isRail}
                isActive={!row.parent && isActive(item)}
                isExpanded={group && !isRail ? expanded : undefined}
                isFlyoverOpen={group && isRail ? isFlyoverOpen : undefined}
                childrenId={group ? childrenId : undefined}
                tabIndex={row.key === tabStopKey ? 0 : -1}
                onFocus={() => setFocusedKey(row.key)}
                onActivate={(event) => onActivate(row, event)}
                registerElement={registerElement}
            />
        );

        if (isRail && group) {
            const closeFlyover = () =>
                setFlyoverState((current) => (current?.rowKey === row.key ? null : current));
            // The pointer must not take over from the keyboard in the flyover of another group.
            const hoverOpenFlyover = () => {
                const focus = flyoverFocusRef.current;
                if (focus?.source === "keyboard" && focus.rowKey !== row.key) {
                    if (isFocusInFlyover()) {
                        return;
                    }
                    // The focused item was removed without a blur, so the record is stale.
                    flyoverFocusRef.current = null;
                }
                setFlyoverState({ rowKey: row.key, focusItems: false });
            };

            return (
                <li key={row.key} className={e("row", { rail: true })}>
                    <NavigationFlyover
                        id={childrenId}
                        className={flyoverClassName}
                        label={item.label}
                        anchor={
                            <UiTooltip
                                anchor={element}
                                content={item.label}
                                arrowPlacement="left"
                                triggerBy={["focus"]}
                                disabled={isFlyoverOpen}
                                accessibilityHidden
                            />
                        }
                        isOpen={isFlyoverOpen}
                        focusItems={isFlyoverOpen ? !!flyover?.focusItems : false}
                        onOpenChange={(open) => (open ? hoverOpenFlyover() : closeFlyover())}
                        onClose={closeFlyover}
                        onReturnFocus={() => focusRow(row.key)}
                        onFocusChange={(source) => {
                            flyoverFocusRef.current = source ? { rowKey: row.key, source } : null;
                        }}
                    >
                        {item.children?.map((child) => {
                            const childRow = makeRow(child, item);

                            return (
                                <li key={childRow.key}>
                                    <NavigationRow
                                        item={child}
                                        actionRequired={child.actionRequired}
                                        rowKey={childRow.key}
                                        isChild
                                        isFlyover
                                        isRail={false}
                                        isActive={false}
                                        isExpanded={undefined}
                                        childrenId={undefined}
                                        tabIndex={-1}
                                        onActivate={(event) => {
                                            onActivate(childRow, event);
                                            // A new-tab click leaves the flyover open for more pages.
                                            if (!isBrowserLinkClick(child, event)) {
                                                closeFlyover();
                                            }
                                        }}
                                    />
                                </li>
                            );
                        })}
                    </NavigationFlyover>
                </li>
            );
        }

        return (
            <li key={row.key} className={e("row", { rail: isRail })}>
                {isRail ? (
                    <UiTooltip
                        anchor={element}
                        content={item.label}
                        arrowPlacement="left"
                        triggerBy={["hover", "focus"]}
                        accessibilityHidden
                        closeOnAnchorClick
                    />
                ) : (
                    element
                )}
                {group && expanded ? (
                    <ul id={childrenId} className={e("children")}>
                        {item.children?.map((child) => renderRow(makeRow(child, item)))}
                    </ul>
                ) : null}
            </li>
        );
    };

    return (
        <nav
            className={b({ rail: isRail })}
            {...accessibilityConfigToAttributes(accessibilityConfig)}
            data-testid={dataTestId}
            onKeyDown={onKeyDown}
        >
            <ul className={e("list")}>{items.map((item) => renderRow(makeRow(item)))}</ul>
        </nav>
    );
}

interface INavigationRowProps {
    item: IUiResizableSidebarNavigationItem;
    actionRequired: IUiResizableSidebarNavigationActionRequired | undefined;
    rowKey: string;
    isChild: boolean;
    isFlyover?: boolean;
    isRail: boolean;
    isActive: boolean;
    isExpanded: boolean | undefined;
    isFlyoverOpen?: boolean;
    childrenId: string | undefined;
    tabIndex: number;
    onFocus?: () => void;
    onActivate: (event: MouseEvent | KeyboardEvent) => void;
    registerElement?: (key: string, element: HTMLElement | null) => void;
}

function NavigationRow({
    item,
    actionRequired,
    rowKey,
    isChild,
    isFlyover = false,
    isRail,
    isActive,
    isExpanded,
    isFlyoverOpen,
    childrenId,
    tabIndex,
    onFocus,
    onActivate,
    registerElement,
}: INavigationRowProps): ReactElement {
    const showIcon = !isChild;
    const showChevron = isExpanded !== undefined;
    // A group whose current sub-page is not rendered (collapsed, or in a closed flyover) stands in for it.
    const isSubPageShown = isExpanded === true || isFlyoverOpen === true;
    const holdsHiddenCurrentPage = isActive && !item.isSelected && !isSubPageShown;
    const ariaCurrent = item.isSelected
        ? ("page" as const)
        : holdsHiddenCurrentPage
          ? ("true" as const)
          : undefined;
    const actionRequiredElement = actionRequired ? (
        <span className={e("action-required")}>
            <span className={e("sr-only")}>{actionRequired.label}</span>
        </span>
    ) : null;

    const content = (
        <>
            {showIcon ? (
                <span className={e("icon")} aria-hidden="true">
                    {isIconType(item.icon) ? (
                        <UiIcon type={item.icon} size={ICON_SIZE} color="currentColor" layout="block" />
                    ) : (
                        (item.icon ?? getFirstGrapheme(item.label))
                    )}
                </span>
            ) : null}
            <span className={e(isRail ? "sr-only" : "label")}>{item.label}</span>
            {actionRequiredElement}
            {showChevron ? (
                <span className={e("chevron", { expanded: !!isExpanded })} aria-hidden="true">
                    <UiIcon type="chevronRight" size={CHEVRON_SIZE} color="currentColor" layout="block" />
                </span>
            ) : null}
        </>
    );

    const sharedProps = {
        className: e("item", {
            selected: !!item.isSelected,
            active: isActive,
            child: isChild,
            flyover: isFlyover,
            rail: isRail,
            open: !!isFlyoverOpen,
        }),
        tabIndex,
        "aria-current": ariaCurrent,
        "aria-expanded": isExpanded ?? isFlyoverOpen,
        "aria-controls": (isExpanded ?? isFlyoverOpen) ? childrenId : undefined,
        "data-testid": item.dataTestId,
        onFocus,
        onClick: onActivate,
    };

    if (isLink(item)) {
        return (
            <a ref={(element) => registerElement?.(rowKey, element)} href={item.href} {...sharedProps}>
                {content}
            </a>
        );
    }

    return (
        <button ref={(element) => registerElement?.(rowKey, element)} type="button" {...sharedProps}>
            {content}
        </button>
    );
}

// The flyover starts at the edge of the sidebar, not at the edge of the narrower item in the rail.
const flyoverOffset: OffsetOptions = ({ elements }) => {
    const sidebar =
        elements.reference instanceof Element
            ? elements.reference.closest(".gd-ui-kit-resizable-sidebar")
            : null;

    return sidebar
        ? sidebar.getBoundingClientRect().right - elements.reference.getBoundingClientRect().right
        : 0;
};

function isFocusInFlyover(): boolean {
    return !!document.activeElement?.closest(`.${e("flyover")}`);
}

// Scrolls only the container. Element.scrollIntoView would also scroll the page under the flyover.
function scrollIntoContainer(container: HTMLElement, element: Element): void {
    const box = container.getBoundingClientRect();
    const target = element.getBoundingClientRect();
    if (target.bottom > box.bottom) {
        container.scrollTop += target.bottom - box.bottom;
    } else if (target.top < box.top) {
        container.scrollTop -= box.top - target.top;
    }
}

function getFlyoverItems(container: HTMLElement | null): HTMLElement[] {
    return container ? [...container.querySelectorAll<HTMLElement>("a, button")] : [];
}

interface INavigationFlyoverProps {
    id: string;
    className: string | undefined;
    label: string;
    anchor: ReactNode;
    isOpen: boolean;
    focusItems: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
    onReturnFocus: () => void;
    onFocusChange: (source: FlyoverFocusSource | null) => void;
    children: ReactNode;
}

/**
 * Lists the sub-items of a group in the rail. Hover opens it without moving focus; the Right arrow key
 * on the group opens it with focus on the current page or the first sub-item.
 */
function NavigationFlyover({
    id,
    className,
    label,
    anchor,
    isOpen,
    focusItems,
    onOpenChange,
    onClose,
    onReturnFocus,
    onFocusChange,
    children,
}: INavigationFlyoverProps): ReactElement {
    const focusSourceRef = useRef<FlyoverFocusSource | null>(null);
    const isPointerDownRef = useRef(false);

    const setFocusSource = (source: FlyoverFocusSource | null) => {
        focusSourceRef.current = source;
        onFocusChange(source);
    };

    const { refs, floatingStyles, zIndex, context } = useFloatingPosition({
        isOpen,
        // The pointer can leave while the keyboard works in the flyover; that must not close it.
        onOpenChange: (open: boolean, _event?: Event, reason?: string) => {
            const isHoverClose = reason === "hover" || reason === "safe-polygon";
            if (!open && isHoverClose && focusSourceRef.current === "keyboard") {
                if (refs.floating.current?.contains(document.activeElement)) {
                    return;
                }
                // The focused item was removed without a blur, so nothing holds the flyover open.
                setFocusSource(null);
            }
            onOpenChange(open);
        },
        placement: "right-start",
        offset: flyoverOffset,
        autoFlip: false,
        // Only the height is limited, to the viewport space below the group, so a long list scrolls.
        maxWidth: "none",
    });

    const hover = useHover(context, {
        delay: { open: FLYOVER_OPEN_DELAY },
        handleClose: safePolygon(),
    });
    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss]);

    // The portal mounts the flyover after the first commit, so focus waits for the element.
    const [flyoverElement, setFlyoverElement] = useState<HTMLElement | null>(null);
    const setFloating = useCallback(
        (element: HTMLElement | null) => {
            refs.setFloating(element);
            setFlyoverElement(element);
        },
        [refs],
    );

    useLayoutEffect(() => {
        if (!focusItems) {
            return;
        }
        const items = getFlyoverItems(flyoverElement);
        const current = items.find((item) => item.getAttribute("aria-current") === "page");
        (current ?? items[0])?.focus({ preventScroll: true });
    }, [focusItems, flyoverElement]);

    // Removing the focused item, e.g. after a change of permissions, drops focus to the document. Focus
    // goes back into the flyover, so its keys keep working.
    useLayoutEffect(() => {
        if (!focusSourceRef.current || !flyoverElement || document.activeElement !== document.body) {
            return;
        }
        // Focus from a press is not restored, or the flyover would count as keyboard focused.
        if (focusSourceRef.current === "pointer") {
            setFocusSource(null);
            return;
        }
        const items = getFlyoverItems(flyoverElement);
        const current = items.find((item) => item.getAttribute("aria-current") === "page");
        (current ?? items[0])?.focus({ preventScroll: true });
    });

    // The height limit applies once the flyover is positioned, so the focused item is revealed after it.
    useLayoutEffect(() => {
        const focused = document.activeElement;
        if (focusItems && flyoverElement && focused && flyoverElement.contains(focused)) {
            scrollIntoContainer(flyoverElement, focused);
        }
    }, [focusItems, flyoverElement, floatingStyles]);

    // A flyover that closes with focus inside removes the focused item, so focus goes back to the group.
    useLayoutEffect(() => {
        if (!isOpen && focusSourceRef.current) {
            // Focus from a press stays where the pointer goes, e.g. to the flyover of another group.
            const isKeyboardFocus = focusSourceRef.current === "keyboard";
            setFocusSource(null);
            if (isKeyboardFocus) {
                onReturnFocus();
            }
        }
    });

    const moveFocus = (target: EventTarget, getIndex: (index: number, count: number) => number) => {
        const items = getFlyoverItems(refs.floating.current);
        const index = items.findIndex((item) => item.contains(target as Node));
        items[getIndex(index, items.length)]?.focus();
    };

    // Enter and Space stay unhandled, so links and buttons keep their native activation.
    const handleKey = makeMenuKeyboardNavigation<KeyboardEvent<HTMLElement>>({
        onFocusPrevious: (event) => moveFocus(event.target, (index) => Math.max(0, index - 1)),
        onFocusNext: (event) => moveFocus(event.target, (index, count) => Math.min(count - 1, index + 1)),
        onFocusFirst: (event) => moveFocus(event.target, () => 0),
        onFocusLast: (event) => moveFocus(event.target, (_, count) => count - 1),
        onLeaveLevel: onClose,
        onClose,
    });

    // The navigation stops only the keys it handles, so page shortcuts such as Ctrl+K still work here.
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        isPointerDownRef.current = false;
        if (!hasSystemModifier(event)) {
            handleKey(event);
        }
    };

    return (
        <>
            <div className={e("flyover-anchor")} ref={refs.setReference} {...getReferenceProps()}>
                {anchor}
            </div>
            {isOpen ? (
                <FloatingPortal>
                    <ConditionalScopedThemeProvider>
                        <FloatingFocusManager
                            context={context}
                            modal={false}
                            initialFocus={-1}
                            returnFocus={false}
                        >
                            <div
                                id={id}
                                ref={setFloating}
                                className={cx(e("flyover"), className)}
                                style={{ ...floatingStyles, zIndex }}
                                role="group"
                                aria-label={label}
                                {...getFloatingProps({
                                    onKeyDown,
                                    // A press focuses an item before the click, e.g. a right click for a
                                    // new tab. That focus must not hold the flyover open like the keyboard.
                                    onPointerDown: () => {
                                        isPointerDownRef.current = true;
                                    },
                                    onPointerUp: () => {
                                        isPointerDownRef.current = false;
                                    },
                                    onFocus: () => {
                                        setFocusSource(isPointerDownRef.current ? "pointer" : "keyboard");
                                    },
                                    // A removed item can blur with no target; focus still has to go back.
                                    onBlur: (event) => {
                                        const target = event.relatedTarget as Node | null;
                                        if (target && !event.currentTarget.contains(target)) {
                                            // Shift+Tab lands on the group, which keeps a non-modal flyover open.
                                            const isKeyboardExit = focusSourceRef.current === "keyboard";
                                            setFocusSource(null);
                                            if (isKeyboardExit) {
                                                onClose();
                                            }
                                        }
                                    },
                                })}
                            >
                                <ul className={e("flyover-list")}>{children}</ul>
                            </div>
                        </FloatingFocusManager>
                    </ConditionalScopedThemeProvider>
                </FloatingPortal>
            ) : null}
        </>
    );
}
